// O servidor da loja própria: um Worker da Cloudflare (plano de 13/11/2026, seção 3).
//
// Rotas:
//   POST /api/checkout                 cria o pedido e o link de pagamento
//   POST /api/webhook/mercadopago      aviso de pagamento (assinado)
//   POST /api/pedido                   consulta do pedido, com código e token
//   POST /api/pedido/desistir          botão "Quero desistir" (Decreto 7.962, art. 5º)
//   cron de hora em hora               conciliação e limpeza dos não pagos
//
// A consulta é POST, e não GET como no plano: o token fica fora da URL (o
// link do e-mail leva o token depois do "#", que não vai ao servidor nem a log).
//
// Tudo o que vale dinheiro é decidido aqui. O navegador manda SKU e quantidade;
// preço e frete saem do catálogo deste deploy e da regra de frete.

import {
  apagarNaoPagos, esquecerAviso, gravarPedido, itensDoPedido, marcarConciliado, pedidoPorChave,
  pedidoPorCodigo, pedidosDoIpDesde, pedidosParaConciliar, registrarAviso, registrarEvento, subirEstorno,
  trocarStatus,
} from "./banco.js";
import { indexarCatalogo } from "./catalogo.js";
import {
  emailDesistenciaCliente, emailDonoAlerta, emailDonoDesistencia, emailDonoPago, emailPagamentoAprovado,
  emailPedidoCriado, enviarEmail,
} from "./email.js";
import { assinaturaValida, buscarPagamentos, criarPreferencia, lerPagamento } from "./mercadopago.js";
import { montarPedido } from "./pedido.js";

const HORA = 3600 * 1000;
const DIA = 24 * HORA;
const CORPO_MAXIMO = 16 * 1024;
const PEDIDOS_POR_IP_POR_HORA = 5;
const CONCILIAR_POR_RODADA = 10; // 10 buscas + até 20 e-mails cabem nas 50 chamadas externas do plano grátis
const CONCILIAR_ATE_DIAS = 10;
const APAGAR_NAO_PAGOS_APOS_DIAS = 30;

// O que o cliente lê sobre o pedido. Nunca "em produção" (de-para, seção 4).
export const STATUS_TEXTO = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pagamento confirmado",
  repassado: "Preparando seu pedido",
  enviado: "Enviado",
  divergente: "Pagamento em conferência",
  contestado: "Pagamento em conferência",
  desistencia: "Desistência registrada",
  reembolsado: "Valor devolvido",
};
const PODE_DESISTIR = ["pago", "repassado", "enviado"];
const PODE_REEMBOLSAR = ["pago", "repassado", "enviado", "desistencia", "divergente", "contestado"];

const MEIO = { credit_card: "cartão", debit_card: "cartão de débito", bank_transfer: "Pix", ticket: "boleto", account_money: "saldo Mercado Pago" };

const json = (corpo, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const erro = (mensagem, status) => json({ erro: mensagem }, status);

const enc = new TextEncoder();
const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (texto) => hex(await crypto.subtle.digest("SHA-256", enc.encode(texto)));
async function hmac(segredo, texto) {
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", chave, enc.encode(texto)));
}
function aleatorio(bytes) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
// Código do pedido: NB-XXXX-XXXX, sem letras que se confundem (0/O, 1/I/L).
function novoCodigo() {
  const alfabeto = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const b = crypto.getRandomValues(new Uint8Array(8));
  const s = [...b].map((x) => alfabeto[x % alfabeto.length]).join("");
  return `NB-${s.slice(0, 4)}-${s.slice(4)}`;
}

async function lerJson(req) {
  const texto = await req.text();
  if (texto.length > CORPO_MAXIMO) return { falha: erro("Pedido grande demais.", 413) };
  try {
    return { corpo: JSON.parse(texto) };
  } catch {
    return { falha: erro("Formato inválido.", 400) };
  }
}

async function turnstileValido(env, token, ip) {
  if (typeof token !== "string" || !token || token.length > 4096) return false;
  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  if (!resp.ok) return false;
  const r = await resp.json();
  return r.success === true;
}

const resumoPublico = (pedido, itens) => ({
  itens: itens.map((i) => ({ sku: i.sku, nome: i.nome, quantidade: i.quantidade, preco_centavos: i.preco_centavos })),
  subtotal_centavos: pedido.subtotal_centavos,
  frete_centavos: pedido.frete_centavos,
  total_centavos: pedido.total_centavos,
});

// A sacola, o e-mail e o CEP: a mesma chave com outra sacola é recusada.
const impressaoDe = (p) =>
  sha256(JSON.stringify([p.itens.map((i) => [i.sku, i.quantidade]), p.contato.email, p.endereco.cep]));

export function criarServidor(catalogo, relogio = () => Date.now()) {
  let indice = null;
  const indiceDePrecos = () => (indice ??= indexarCatalogo(catalogo));
  const agoraIso = () => new Date(relogio()).toISOString();

  // E-mails saem depois da resposta. Falha de envio vira evento no pedido,
  // para o painel mostrar; o pedido não depende do e-mail.
  function despachar(env, ctx, emails) {
    if (!emails.length) return;
    ctx.waitUntil(
      Promise.all(
        emails.map(async ({ codigo, ...email }) => {
          try {
            await enviarEmail(env, email);
          } catch (e) {
            console.error(`e-mail não saiu (pedido ${codigo || "-"}): ${e.message}`);
            if (codigo) await registrarEvento(env.DB, codigo, "email_falhou", email.assunto, agoraIso()).catch(() => {});
          }
        }),
      ),
    );
  }

  async function checkout(req, env, ctx) {
    const { corpo, falha } = await lerJson(req);
    if (falha) return falha;
    const p = montarPedido(corpo, indiceDePrecos());
    if (p.erro) return erro(p.erro, 400);
    p.impressao = await impressaoDe(p);

    // Envio repetido (clique duplo, rede que caiu): devolve o pedido já criado.
    const existente = await pedidoPorChave(env.DB, p.chave);
    if (existente) {
      if (existente.impressao !== p.impressao) return erro("A sacola mudou. Recarregue a página e tente de novo.", 409);
      const itens = await itensDoPedido(env.DB, existente.codigo);
      const pagar = existente.status === "aguardando_pagamento" ? existente.link_pagamento : null;
      return json({ codigo: existente.codigo, resumo: resumoPublico(existente, itens), pagar });
    }

    const ip = req.headers.get("CF-Connecting-IP") || "";
    if (!(await turnstileValido(env, corpo.turnstile, ip))) return erro("Não conseguimos confirmar que você não é um robô. Tente de novo.", 403);
    p.ip_hash = await hmac(env.SAL_IP, ip);
    if ((await pedidosDoIpDesde(env.DB, p.ip_hash, new Date(relogio() - HORA).toISOString())) >= PEDIDOS_POR_IP_POR_HORA)
      return erro("Muitos pedidos seguidos. Tente de novo em uma hora.", 429);

    p.codigo = novoCodigo();
    const token = aleatorio(32);
    p.token_hash = await sha256(token);
    try {
      const pref = await criarPreferencia(env, p, relogio());
      p.preferencia_id = pref.id;
      p.link_pagamento = pref.link;
    } catch (e) {
      console.error(`preferência não criada: ${e.message}`);
      return erro("O pagamento está fora do ar agora. Tente de novo em alguns minutos.", 502);
    }

    try {
      await gravarPedido(env.DB, p, agoraIso());
    } catch (e) {
      // Corrida de dois envios iguais: o outro gravou primeiro.
      if (/UNIQUE constraint failed: pedidos\.chave/.test(e.message)) {
        const outro = await pedidoPorChave(env.DB, p.chave);
        const itens = await itensDoPedido(env.DB, outro.codigo);
        return json({ codigo: outro.codigo, resumo: resumoPublico(outro, itens), pagar: outro.link_pagamento });
      }
      throw e;
    }

    const gravado = await pedidoPorCodigo(env.DB, p.codigo);
    const itens = await itensDoPedido(env.DB, p.codigo);
    despachar(env, ctx, [{ codigo: p.codigo, ...emailPedidoCriado(env, gravado, itens, token) }]);
    return json({ codigo: p.codigo, resumo: resumoPublico(gravado, itens), pagar: p.link_pagamento }, 201);
  }

  // Situação do aviso: o status e, no estorno parcial, o valor estornado.
  const situacaoDe = (pg) => (pg.estornado_centavos > 0 ? `${pg.status}:${pg.estornado_centavos}` : pg.status);

  /** Aplica um pagamento lido na API ao pedido. Devolve os e-mails a mandar. */
  async function aplicarPagamento(env, pg) {
    const db = env.DB;
    const agora = agoraIso();
    const situacao = situacaoDe(pg);
    if (!(await registrarAviso(db, pg.id, situacao, pg.referencia, agora))) return [];
    try {
      return await aplicarNovo(env, pg, agora);
    } catch (e) {
      await esquecerAviso(db, pg.id, situacao); // para o reenvio do aviso ser processado
      throw e;
    }
  }

  async function aplicarNovo(env, pg, agora) {
    const db = env.DB;
    const pedido = pg.referencia ? await pedidoPorCodigo(db, pg.referencia) : null;
    if (!pedido) {
      if (pg.status !== "approved") return [];
      return [emailDonoAlerta(env, "pagamento sem pedido", [
        `O Mercado Pago aprovou o pagamento ${pg.id} (${(pg.valor_centavos / 100).toFixed(2)} ${pg.moeda}), com referência "${pg.referencia || ""}", e não há pedido com esse código.`,
        "Conferir no painel do Mercado Pago e estornar se for o caso.",
      ])];
    }
    const codigo = pedido.codigo;
    const meio = MEIO[pg.meio] || pg.meio;

    if (pg.status === "approved") {
      const emails = [];
      if (pedido.pagamento_id && pedido.pagamento_id !== pg.id) {
        await registrarEvento(db, codigo, "pagamento_a_mais", pg.id, agora);
        return [{ codigo, ...emailDonoAlerta(env, `segundo pagamento no pedido ${codigo}`, [
          `O pedido ${codigo} já estava pago pelo pagamento ${pedido.pagamento_id}. Chegou outro aprovado: ${pg.id}.`,
          "Estornar o segundo no painel do Mercado Pago.",
        ]) }];
      }
      if (pg.moeda !== "BRL" || pg.valor_centavos !== pedido.total_centavos) {
        if (await trocarStatus(db, codigo, ["aguardando_pagamento"], "divergente", { pagamento_id: pg.id, meio }, agora)) {
          await registrarEvento(db, codigo, "divergente", `pago ${pg.valor_centavos} ${pg.moeda}, esperado ${pedido.total_centavos} BRL`, agora);
          emails.push({ codigo, ...emailDonoAlerta(env, `valor diferente no pedido ${codigo}`, [
            `O pagamento ${pg.id} do pedido ${codigo} veio com ${(pg.valor_centavos / 100).toFixed(2)} ${pg.moeda}; o pedido é de ${(pedido.total_centavos / 100).toFixed(2)} BRL.`,
            "O pedido não foi liberado. Conferir e estornar no painel do Mercado Pago.",
          ]) });
        }
        return emails;
      }
      if (await trocarStatus(db, codigo, ["aguardando_pagamento"], "pago", { pagamento_id: pg.id, meio }, agora)) {
        await registrarEvento(db, codigo, "pago", `${pg.id} ${meio}`, agora);
        const atual = await pedidoPorCodigo(db, codigo);
        const itens = await itensDoPedido(db, codigo);
        emails.push({ codigo, ...emailPagamentoAprovado(env, atual, itens) }, { codigo, ...emailDonoPago(env, atual, itens) });
      }
      if (pg.estornado_centavos > 0 && (await subirEstorno(db, codigo, pg.estornado_centavos, agora)))
        await registrarEvento(db, codigo, "estorno_parcial", String(pg.estornado_centavos), agora);
      return emails;
    }

    if (pg.status === "refunded") {
      if (await trocarStatus(db, codigo, PODE_REEMBOLSAR, "reembolsado", { estornado_centavos: pg.estornado_centavos }, agora))
        await registrarEvento(db, codigo, "reembolsado", String(pg.estornado_centavos), agora);
      return [];
    }

    if (pg.status === "charged_back" || pg.status === "in_mediation") {
      await registrarEvento(db, codigo, pg.status, pg.id, agora);
      if (pg.status === "charged_back") await trocarStatus(db, codigo, PODE_REEMBOLSAR, "contestado", {}, agora);
      return [{ codigo, ...emailDonoAlerta(env, `contestação no pedido ${codigo}`, [
        `O pagamento ${pg.id} do pedido ${codigo} está em "${pg.status}" no Mercado Pago.`,
        "Responder pelo painel do Mercado Pago.",
      ]) }];
    }

    // pending, in_process, authorized, rejected, cancelled: só registra. O
    // cliente pode tentar de novo pelo mesmo link até ele vencer.
    await registrarEvento(db, codigo, `pagamento_${pg.status || "sem_status"}`, pg.id, agora);
    return [];
  }

  async function webhook(req, env, ctx) {
    const url = new URL(req.url);
    const { corpo } = await lerJson(req);
    const dataId = url.searchParams.get("data.id") ?? undefined;
    // Aviso no formato antigo (?topic=...&id=...) não é assinado: responde 200
    // sem fazer nada, para não ser reenviado. O pagamento chega pelo aviso novo
    // ou pela conciliação de hora em hora.
    if (!dataId && url.searchParams.has("topic")) return json({ ok: true, ignorado: true });
    const ok = await assinaturaValida({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
      segredo: env.MP_WEBHOOK_SECRET,
    });
    if (!ok) return erro("Assinatura inválida.", 401);

    const tipo = url.searchParams.get("type") ?? corpo?.type;
    const id = dataId ?? (corpo?.data?.id != null ? String(corpo.data.id) : undefined);
    if (tipo !== "payment" || !id) return json({ ok: true, ignorado: true });
    if (!/^\d{1,24}$/.test(id)) return erro("Pagamento inválido.", 400);

    // Não confia no conteúdo do aviso: lê o pagamento na API.
    const pg = await lerPagamento(env, id);
    if (!pg) return json({ ok: true, ignorado: true });
    const emails = await aplicarPagamento(env, pg);
    despachar(env, ctx, emails);
    return json({ ok: true });
  }

  async function pedidoComToken(env, corpo) {
    const codigo = typeof corpo?.codigo === "string" ? corpo.codigo : "";
    const token = typeof corpo?.token === "string" ? corpo.token : "";
    if (!/^NB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo) || token.length < 20 || token.length > 100) return null;
    const pedido = await pedidoPorCodigo(env.DB, codigo);
    if (!pedido || pedido.token_hash !== (await sha256(token))) return null;
    return pedido;
  }

  async function consultar(req, env) {
    const { corpo, falha } = await lerJson(req);
    if (falha) return falha;
    const pedido = await pedidoComToken(env, corpo);
    if (!pedido) return erro("Pedido não encontrado.", 404);
    const itens = await itensDoPedido(env.DB, pedido.codigo);
    return json({
      codigo: pedido.codigo,
      status: pedido.status,
      status_texto: STATUS_TEXTO[pedido.status] || "Em andamento",
      criado_em: pedido.criado_em,
      ...resumoPublico(pedido, itens),
      projeto: pedido.projeto,
      rastreio: pedido.rastreio || null,
      pagar: pedido.status === "aguardando_pagamento" ? pedido.link_pagamento : null,
      pode_desistir: PODE_DESISTIR.includes(pedido.status),
    });
  }

  async function desistir(req, env, ctx) {
    const { corpo, falha } = await lerJson(req);
    if (falha) return falha;
    const pedido = await pedidoComToken(env, corpo);
    if (!pedido) return erro("Pedido não encontrado.", 404);
    if (pedido.status === "desistencia") return json({ ok: true, status_texto: STATUS_TEXTO.desistencia });
    if (pedido.status === "aguardando_pagamento")
      return erro("Este pedido ainda não foi pago. Sem pagamento, ele é cancelado sozinho.", 409);
    const agora = agoraIso();
    if (!(await trocarStatus(env.DB, pedido.codigo, PODE_DESISTIR, "desistencia", {}, agora)))
      return erro("Este pedido não aceita desistência pelo site. Escreva para o nosso e-mail.", 409);
    await registrarEvento(env.DB, pedido.codigo, "desistencia", "pelo botão da página do pedido", agora);
    despachar(env, ctx, [
      { codigo: pedido.codigo, ...emailDesistenciaCliente(env, pedido) },
      { codigo: pedido.codigo, ...emailDonoDesistencia(env, pedido) },
    ]);
    return json({ ok: true, status_texto: STATUS_TEXTO.desistencia });
  }

  /** Cron: confere na API os pedidos sem aviso e apaga os não pagos vencidos. */
  async function rodadaAgendada(env, ctx) {
    const agora = relogio();
    const codigos = await pedidosParaConciliar(
      env.DB,
      new Date(agora - HORA).toISOString(),
      new Date(agora - CONCILIAR_ATE_DIAS * DIA).toISOString(),
      CONCILIAR_POR_RODADA,
    );
    const emails = [];
    for (const codigo of codigos) {
      try {
        for (const pg of await buscarPagamentos(env, codigo)) emails.push(...(await aplicarPagamento(env, pg)));
        await marcarConciliado(env.DB, codigo, agoraIso());
      } catch (e) {
        console.error(`conciliação do pedido ${codigo} falhou: ${e.message}`);
      }
    }
    despachar(env, ctx, emails);
    const apagados = await apagarNaoPagos(env.DB, new Date(agora - APAGAR_NAO_PAGOS_APOS_DIAS * DIA).toISOString());
    return { conferidos: codigos.length, apagados };
  }

  return {
    async fetch(req, env, ctx) {
      const { pathname } = new URL(req.url);
      if (!pathname.startsWith("/api/")) return env.ASSETS ? env.ASSETS.fetch(req) : new Response("Não encontrado", { status: 404 });
      if (req.method !== "POST") return erro("Método não aceito.", 405);
      try {
        if (pathname === "/api/checkout") return await checkout(req, env, ctx);
        if (pathname === "/api/webhook/mercadopago") return await webhook(req, env, ctx);
        if (pathname === "/api/pedido") return await consultar(req, env);
        if (pathname === "/api/pedido/desistir") return await desistir(req, env, ctx);
        return erro("Não encontrado.", 404);
      } catch (e) {
        console.error(`erro em ${pathname}: ${e.message}`);
        return erro("Erro no servidor. Tente de novo.", 500);
      }
    },
    async scheduled(_evento, env, ctx) {
      await rodadaAgendada(env, ctx);
    },
    rodadaAgendada, // exposta para o portão loja:teste
  };
}

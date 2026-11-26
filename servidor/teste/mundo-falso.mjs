// O mundo de mentira dos testes da loja: o servidor de verdade
// (servidor/src/app.js) dentro do Node, com o D1 num SQLite em memória e o
// Mercado Pago, o Turnstile e o Resend simulados. Usado pelo portão
// loja:teste (loja-teste.mjs) e pelo teste do formulário no navegador
// (formulario-teste.mjs).
import { createHmac, randomUUID } from "node:crypto";
import { join } from "node:path";
import { criarServidor } from "../src/app.js";
import { indexarCatalogo } from "../src/catalogo.js";
import { criarD1Falso } from "./d1-falso.mjs";

export const RAIZ = join(import.meta.dirname, "..", "..");
const MIGRACOES = [join(RAIZ, "servidor/migrations/0001_inicial.sql")];
export const SEGREDO = "segredo-de-teste-do-webhook";
export const CPF = "529.982.247-25"; // CPF de exemplo, válido pelos dígitos

// Catálogo de mentira, na forma do public/loja/catalogo.json.
export const CATALOGO = {
  produtos: [
    { nome: "Teste A | Camiseta", variantes_por_cor: { Branca: [{ sku: "A-BR-M", tamanho: "M", preco: 149.9 }, { sku: "A-BR-G", tamanho: "G", preco: 149.9 }] } },
    { nome: "Teste B | Oversized", variantes_por_cor: { Preta: [{ sku: "B-PR-M", tamanho: "M", preco: 179.9 }] } },
    { nome: "Teste C | Moletom", variantes_por_cor: { Preta: [{ sku: "C-PR-G", tamanho: "G", preco: 299.9 }] } },
    { nome: "Teste D | Boné", variantes_por_cor: { Branca: [{ sku: "D-BR-U", tamanho: "Único", preco: 100 }] } },
    { nome: "Teste E | Meia", variantes_por_cor: { Branca: [{ sku: "E-BR-U", tamanho: "Único", preco: 99.99 }] } },
  ],
};
export const INDICE = indexarCatalogo(CATALOGO);

// ---------------------------------------------------------------- o mundo de mentira

export function mundo() {
  let agora = Date.parse("2026-12-01T15:00:00Z");
  const relogio = () => agora;
  const db = criarD1Falso(MIGRACOES);
  const mp = { preferencias: [], pagamentos: new Map(), leituras: 0, fora: false };
  const emails = [];

  async function fetchFalso(entrada, init = {}) {
    const url = new URL(typeof entrada === "string" ? entrada : entrada.url);
    const corpo = init.body ? JSON.parse(init.body) : null;
    const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
    if (url.host === "challenges.cloudflare.com") return resposta({ success: corpo.response === "ok" });
    if (url.host === "api.resend.com") {
      emails.push(corpo);
      return resposta({ id: `email-${emails.length}` });
    }
    if (url.host === "api.mercadopago.com") {
      if (mp.fora) return resposta({ message: "fora do ar" }, 500);
      if (url.pathname === "/checkout/preferences") {
        mp.preferencias.push(corpo);
        const n = mp.preferencias.length;
        return resposta({ id: `pref-${n}`, init_point: `https://mp.teste/checkout/${n}` }, 201);
      }
      if (url.pathname === "/v1/payments/search") {
        const ref = url.searchParams.get("external_reference");
        return resposta({ paging: {}, results: [...mp.pagamentos.values()].filter((p) => p.external_reference === ref) });
      }
      const m = url.pathname.match(/^\/v1\/payments\/(\d+)$/);
      if (m) {
        mp.leituras++;
        const p = mp.pagamentos.get(m[1]);
        return p ? resposta(p) : resposta({ message: "not found" }, 404);
      }
    }
    throw new Error(`chamada externa não simulada: ${url}`);
  }

  const env = {
    DB: db,
    MP_ACCESS_TOKEN: "token-de-teste",
    MP_WEBHOOK_SECRET: SEGREDO,
    RESEND_API_KEY: "chave-de-teste",
    TURNSTILE_SECRET: "turnstile-teste",
    SAL_IP: "sal-de-teste",
    URL_BASE: "https://nimbus.teste",
    EMAIL_REMETENTE: "NIMBUS <pedidos@nimbuswear.com.br>",
    EMAIL_RESPOSTA: "resposta@nimbus.teste",
    EMAIL_DONO: "dono@nimbus.teste",
  };
  const servidor = criarServidor(CATALOGO, relogio);

  async function comContexto(fn) {
    const pendentes = [];
    const ctx = { waitUntil: (p) => pendentes.push(p) };
    const anterior = globalThis.fetch;
    globalThis.fetch = fetchFalso;
    try {
      const r = await fn(ctx);
      await Promise.all(pendentes);
      return r;
    } finally {
      globalThis.fetch = anterior;
    }
  }

  async function chamar(caminho, corpo, cabecalhos = {}, metodo = "POST") {
    return comContexto(async (ctx) => {
      const req = new Request(`https://nimbus.teste${caminho}`, {
        method: metodo,
        headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7", ...cabecalhos },
        body: metodo === "POST" ? JSON.stringify(corpo ?? {}) : undefined,
      });
      const resp = await servidor.fetch(req, env, ctx);
      return { status: resp.status, corpo: await resp.json() };
    });
  }

  async function aviso(id, { segredo = SEGREDO, requestId = `req-${id}-${randomUUID()}` } = {}) {
    const ts = String(Math.floor(agora / 1000));
    const v1 = createHmac("sha256", segredo).update(`id:${id};request-id:${requestId};ts:${ts};`).digest("hex");
    return chamar(`/api/webhook/mercadopago?data.id=${id}&type=payment`, { type: "payment", action: "payment.updated", data: { id } }, {
      "x-signature": `ts=${ts},v1=${v1}`,
      "x-request-id": requestId,
    });
  }

  function pagar(id, codigo, valor, extra = {}) {
    mp.pagamentos.set(String(id), {
      id: Number(id), status: "approved", status_detail: "accredited", transaction_amount: valor,
      transaction_amount_refunded: 0, currency_id: "BRL", external_reference: codigo, payment_type_id: "bank_transfer",
      ...extra,
    });
  }

  const pedido = (codigo) => db.sql.prepare("SELECT * FROM pedidos WHERE codigo = ?").get(codigo);
  const contar = (tabela) => db.sql.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get().n;

  // Uma requisição pronta (a do navegador, no teste do formulário), atendida
  // pelo servidor com o mesmo mundo de mentira.
  const atender = (req) => comContexto((ctx) => servidor.fetch(req, env, ctx));

  return {
    env, mp, emails, chamar, atender, aviso, pagar, pedido, contar,
    rodada: () => comContexto((ctx) => servidor.rodadaAgendada(env, ctx)),
    avancar: (ms) => { agora += ms; },
  };
}

export const formulario = (itens, cep, uf, extra = {}) => ({
  chave: randomUUID(),
  itens,
  contato: { nome: "Maria Teste", email: "maria@exemplo.com", telefone: "(61) 99999-0000", cpf: CPF },
  endereco: { cep, uf, cidade: "Cidade", bairro: "Centro", rua: "Rua Um", numero: "10", complemento: "" },
  projeto: "fazenda-da-esperanca",
  turnstile: "ok",
  ...extra,
});

export const tokenDoEmail = (email) => email.text.match(/\/loja\/pedido\/#(NB-[A-Z0-9-]+)\.([A-Za-z0-9_-]+)/).slice(1);


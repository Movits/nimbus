// Mercado Pago Checkout Pro, por redirecionamento (plano de 13/11/2026, seção 1).
//
// O cartão nunca passa por aqui: o cliente paga na página do Mercado Pago. Do
// pagamento o servidor guarda só o número, o status, o valor e o meio (Pix,
// cartão ou boleto). Nenhum dado de cartão, nem os últimos dígitos, entra no
// banco ou no log (cláusula 2.2.1(h) do contrato grátis da Cloudflare, seção 2).
//
// Fontes conferidas em 25/11/2026:
// - assinatura do aviso: código oficial do SDK, mercadopago/sdk-nodejs,
//   src/utils/webhook/index.ts (manifest "id:...;request-id:...;ts:...;",
//   par ausente sai do manifest, HMAC-SHA256 em hexadecimal);
// - preferência: referência "create-preference" do Checkout Pro (campos items,
//   payer, external_reference, back_urls, auto_return,
//   payment_methods.installments de 1 a 36, expires e expiration_date_to em
//   ISO 8601 com fuso);
// - sem notification_url na preferência: o endereço do aviso é cadastrado no
//   painel do Mercado Pago ("Suas integrações"), que é onde nasce o segredo da
//   assinatura. Aviso sem assinatura válida é recusado.
// - pagamento e busca: referências "get-payment" e "search-payments".

const API = "https://api.mercadopago.com";
const PARCELAS_MAXIMAS = 12; // o site promete até 12x, com juros do comprador
const VALIDADE_DO_LINK_HORAS = 48;

const cabecalhos = (env) => ({
  Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
});

// Data em ISO 8601 no fuso de Brasília, o formato dos exemplos da referência.
function isoBrasilia(ms) {
  return new Date(ms - 3 * 3600 * 1000).toISOString().replace("Z", "-03:00");
}

export async function criarPreferencia(env, pedido, agoraMs) {
  const reais = (centavos) => centavos / 100;
  const itens = pedido.itens.map((i) => ({
    id: i.sku,
    title: i.nome,
    quantity: i.quantidade,
    unit_price: reais(i.preco_centavos),
    currency_id: "BRL",
  }));
  if (pedido.frete_centavos > 0)
    itens.push({ id: "frete", title: "Frete", quantity: 1, unit_price: reais(pedido.frete_centavos), currency_id: "BRL" });

  const voltar = `${env.URL_BASE}/loja/pedido/obrigado/?codigo=${encodeURIComponent(pedido.codigo)}`;
  const resp = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: { ...cabecalhos(env), "X-Idempotency-Key": pedido.codigo },
    body: JSON.stringify({
      items: itens,
      payer: { name: pedido.contato.nome, email: pedido.contato.email },
      external_reference: pedido.codigo,
      back_urls: { success: voltar, pending: voltar, failure: voltar },
      auto_return: "approved",
      payment_methods: { installments: PARCELAS_MAXIMAS },
      statement_descriptor: "NIMBUS",
      expires: true,
      expiration_date_to: isoBrasilia(agoraMs + VALIDADE_DO_LINK_HORAS * 3600 * 1000),
    }),
  });
  if (!resp.ok) throw new Error(`Mercado Pago recusou a preferência (HTTP ${resp.status})`);
  const pref = await resp.json();
  if (!pref.id || !pref.init_point) throw new Error("Mercado Pago respondeu sem id ou init_point");
  return { id: String(pref.id), link: pref.init_point };
}

// Do pagamento, só o que o pedido precisa. O resto da resposta é descartado.
function resumoDoPagamento(p) {
  return {
    id: String(p.id),
    status: String(p.status || ""),
    valor_centavos: Math.round(Number(p.transaction_amount) * 100),
    estornado_centavos: Math.round(Number(p.transaction_amount_refunded || 0) * 100),
    moeda: String(p.currency_id || ""),
    referencia: p.external_reference ? String(p.external_reference) : null,
    meio: String(p.payment_type_id || ""),
  };
}

/** O pagamento lido na API, ou null se ele não existir (ex.: aviso de teste do painel). */
export async function lerPagamento(env, id) {
  const resp = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, { headers: cabecalhos(env) });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`Mercado Pago não devolveu o pagamento (HTTP ${resp.status})`);
  return resumoDoPagamento(await resp.json());
}

/** Todos os pagamentos de um pedido, do mais antigo ao mais novo. */
export async function buscarPagamentos(env, codigo) {
  const q = new URLSearchParams({
    external_reference: codigo,
    sort: "date_created",
    criteria: "asc",
    range: "date_created",
    begin_date: "NOW-30DAYS",
    end_date: "NOW",
  });
  const resp = await fetch(`${API}/v1/payments/search?${q}`, { headers: cabecalhos(env) });
  if (!resp.ok) throw new Error(`Mercado Pago não fez a busca (HTTP ${resp.status})`);
  const corpo = await resp.json();
  return (corpo.results || []).map(resumoDoPagamento);
}

const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

function iguais(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

/**
 * Confere o header x-signature do aviso, como o SDK oficial: o manifest
 * "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" assinado com o segredo do
 * webhook em HMAC-SHA256. O data.id é o da query da URL, sem normalizar.
 */
export async function assinaturaValida({ xSignature, xRequestId, dataId, segredo }) {
  if (!segredo || !xSignature) return false;
  let ts = null;
  let v1 = null;
  for (const parte of xSignature.split(",")) {
    const i = parte.indexOf("=");
    if (i < 0) continue;
    const chave = parte.slice(0, i).trim().toLowerCase();
    const valor = parte.slice(i + 1).trim();
    if (chave === "ts") ts = valor;
    else if (chave === "v1") v1 = valor;
  }
  if (!ts || !/^\d+$/.test(ts) || !v1) return false;

  const partes = [];
  if (dataId?.trim()) partes.push(`id:${dataId.trim()}`);
  if (xRequestId?.trim()) partes.push(`request-id:${xRequestId.trim()}`);
  partes.push(`ts:${ts}`);
  const manifest = partes.join(";") + ";";

  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const calculado = hex(await crypto.subtle.sign("HMAC", chave, enc.encode(manifest)));
  return iguais(calculado, v1.toLowerCase());
}

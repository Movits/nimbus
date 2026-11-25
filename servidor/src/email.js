// E-mails do pedido, pelo Resend (plano de 13/11/2026, seção 4).
//
// RASCUNHO: os textos abaixo esperam o sim do dono junto com os textos legais
// (passo 11 do plano). A loja segue fechada; nada disto é enviado antes do
// teste ponta a ponta da fase 6. Copy segue as regras do CLAUDE.md: sem
// travessão e sem as expressões proibidas de 29/07.

const brl = (centavos) =>
  "R$ " + (centavos / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export async function enviarEmail(env, { para, assunto, texto }) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_REMETENTE,
      to: [para],
      reply_to: env.EMAIL_RESPOSTA,
      subject: assunto,
      text: texto,
    }),
  });
  if (!resp.ok) throw new Error(`Resend recusou o e-mail (HTTP ${resp.status})`);
}

function linhasDoResumo(pedido, itens) {
  const linhas = itens.map((i) => `${i.quantidade} x ${i.nome}: ${brl(i.preco_centavos * i.quantidade)}`);
  linhas.push(`Frete: ${pedido.frete_centavos ? brl(pedido.frete_centavos) : "grátis"}`);
  linhas.push(`Total: ${brl(pedido.total_centavos)}`);
  return linhas.join("\n");
}

const endereco = (p) =>
  `${p.rua}, ${p.numero}${p.complemento ? `, ${p.complemento}` : ""}\n${p.bairro}, ${p.cidade} ${p.uf}\nCEP ${p.cep.slice(0, 5)}-${p.cep.slice(5)}`;

export const linkDoPedido = (env, codigo, token) => `${env.URL_BASE}/loja/pedido/#${codigo}.${token}`;

/** Ao criar o pedido: o resumo e o link para pagar (Decreto 7.962, art. 4º, III). */
export function emailPedidoCriado(env, pedido, itens, token) {
  return {
    para: pedido.email,
    assunto: `NIMBUS: pedido ${pedido.codigo} recebido`,
    texto: [
      `Olá, ${pedido.nome}.`,
      "",
      `Recebemos o seu pedido ${pedido.codigo}. Ele fica guardado até o pagamento.`,
      "",
      linhasDoResumo(pedido, itens),
      "",
      `Para pagar: ${pedido.link_pagamento}`,
      `Para acompanhar: ${linkDoPedido(env, pedido.codigo, token)}`,
      "",
      "Entrega em:",
      endereco(pedido),
      "",
      `Projeto social escolhido: ${pedido.projeto}.`,
      "",
      "Guarde este e-mail: ele é o resumo da sua compra.",
      "NIMBUS",
    ].join("\n"),
  };
}

export function emailPagamentoAprovado(env, pedido, itens) {
  return {
    para: pedido.email,
    assunto: `NIMBUS: pagamento do pedido ${pedido.codigo} confirmado`,
    texto: [
      `Olá, ${pedido.nome}.`,
      "",
      `O pagamento do pedido ${pedido.codigo} foi confirmado.`,
      "",
      linhasDoResumo(pedido, itens),
      "",
      `Os prazos de entrega estão em ${env.URL_BASE}/loja/envios/. O código de rastreio chega por e-mail quando o pedido sair.`,
      "",
      "Você pode desistir da compra em até 7 dias depois de receber, pelo botão \"Quero desistir\" na página do pedido, o mesmo link do primeiro e-mail.",
      "",
      `10% do lucro deste pedido, depois dos custos e do prazo de desistência, vai para ${pedido.projeto}. O repasse é mensal, com comprovante.`,
      "",
      "NIMBUS",
    ].join("\n"),
  };
}

export function emailDesistenciaCliente(env, pedido) {
  return {
    para: pedido.email,
    assunto: `NIMBUS: desistência do pedido ${pedido.codigo} recebida`,
    texto: [
      `Olá, ${pedido.nome}.`,
      "",
      `Recebemos o seu pedido de desistência do pedido ${pedido.codigo}.`,
      "",
      `O estorno de ${brl(pedido.total_centavos)} é pedido ao Mercado Pago e volta pelo mesmo meio do pagamento. A etiqueta para devolver a peça chega em outro e-mail.`,
      "",
      `Regras de trocas e devoluções: ${env.URL_BASE}/loja/trocas/`,
      "",
      "NIMBUS",
    ].join("\n"),
  };
}

// Para o dono. Vão para EMAIL_DONO.

export function emailDonoPago(env, pedido, itens) {
  return {
    para: env.EMAIL_DONO,
    assunto: `Pedido pago: ${pedido.codigo} (${brl(pedido.total_centavos)})`,
    texto: [
      `Pedido ${pedido.codigo} pago (${pedido.meio || "meio não informado"}).`,
      "",
      linhasDoResumo(pedido, itens),
      "",
      `Projeto social: ${pedido.projeto}.`,
      `Repasse e dados de entrega no painel: ${env.URL_BASE}/admin/`,
    ].join("\n"),
  };
}

export function emailDonoDesistencia(env, pedido) {
  return {
    para: env.EMAIL_DONO,
    assunto: `Desistência: ${pedido.codigo}`,
    texto: [
      `O cliente do pedido ${pedido.codigo} pediu desistência pelo botão da página do pedido.`,
      "",
      "A fazer: conferir o prazo de 7 dias, estornar no painel do Mercado Pago e mandar a etiqueta de devolução.",
      `Painel: ${env.URL_BASE}/admin/`,
    ].join("\n"),
  };
}

export function emailDonoAlerta(env, assunto, linhas) {
  return { para: env.EMAIL_DONO, assunto: `Atenção na loja: ${assunto}`, texto: linhas.join("\n") };
}

#!/usr/bin/env node
/**
 * Portão loja:teste. O preço que o cliente vê é o preço cobrado, e o aviso de
 * pagamento não se deixa enganar (plano da loja própria, 13/11/2026, seção 3).
 *
 * Roda o servidor de verdade (servidor/src/app.js) dentro do Node, sem conta
 * nem credencial: o D1 é um SQLite em memória com a mesma migração, e o
 * Mercado Pago, o Turnstile e o Resend são simulados (mundo-falso.mjs). Confere:
 *   - matriz de sacolas e CEPs com o total esperado de cada uma;
 *   - preço e frete mandados pelo navegador são ignorados;
 *   - aviso com assinatura falsa é recusado; aviso repetido não manda segundo
 *     e-mail; valor adulterado não libera o pedido;
 *   - conciliação, desistência, estorno, limpeza dos não pagos;
 *   - o catálogo publicado indexa sem erro.
 *
 * Uso: node servidor/teste/loja-teste.mjs   (npm run loja:teste)
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STATUS_TEXTO } from "../src/app.js";
import { indexarCatalogo } from "../src/catalogo.js";
import { FAIXAS_CEP, freteCentavos, ufDoCep } from "../src/frete.js";
import { cpfValido, montarPedido } from "../src/pedido.js";
import { CPF, INDICE, RAIZ, formulario, mundo, tokenDoEmail } from "./mundo-falso.mjs";

async function criarPedido(m, itens = [{ sku: "A-BR-M", quantidade: 1 }], cep = "01310-100", uf = "SP") {
  const r = await m.chamar("/api/checkout", formulario(itens, cep, uf));
  assert.equal(r.status, 201, JSON.stringify(r.corpo));
  const [codigo, token] = tokenDoEmail(m.emails.at(-1));
  assert.equal(codigo, r.corpo.codigo);
  return { ...r.corpo, token };
}

// ---------------------------------------------------------------- casos

const casos = [];
const caso = (nome, fn) => casos.push([nome, fn]);

caso("faixas de CEP: sem sobreposição; o único buraco é o conhecido das fontes", () => {
  const ordenadas = [...FAIXAS_CEP].sort((a, b) => a[1] - b[1]);
  assert.equal(ordenadas[0][1], 1000000);
  assert.equal(ordenadas.at(-1)[2], 99999999);
  const buracos = [];
  for (let i = 1; i < ordenadas.length; i++) {
    assert.ok(ordenadas[i][1] > ordenadas[i - 1][2], `sobreposição em ${ordenadas[i]}`);
    if (ordenadas[i][1] !== ordenadas[i - 1][2] + 1) buracos.push([ordenadas[i - 1][2] + 1, ordenadas[i][1] - 1]);
  }
  assert.deepEqual(buracos, [[78900000, 78999999]], "buraco novo nas faixas de CEP");
  assert.equal(ufDoCep("78950000"), null);
  const bordas = { "66000000": "PA", "65999999": "MA", "69999999": "AC", "70000000": "DF", "76799999": "GO", "76800000": "RO", "77999999": "TO", "78000000": "MT", "68900000": "AP", "69300000": "RR", "69400000": "AM" };
  for (const [cep, uf] of Object.entries(bordas)) assert.equal(ufDoCep(cep), uf, cep);
  assert.equal(ufDoCep("00999999"), null);
  assert.equal(ufDoCep("1234567"), null);
});

caso("regra de frete de 28/10: Norte R$ 19,90 abaixo de R$ 399,90; resto grátis", () => {
  assert.equal(freteCentavos("SP", 100), 0);
  assert.equal(freteCentavos("AM", 39989), 1990);
  assert.equal(freteCentavos("AM", 39990), 0);
  assert.equal(freteCentavos("TO", 14990), 1990);
});

caso("matriz de sacolas e CEPs: total esperado de cada uma", () => {
  const matriz = [
    // [itens, cep, uf, subtotal, frete, total]
    [[["A-BR-M", 1]], "01310-100", "SP", 14990, 0, 14990],
    [[["A-BR-M", 1]], "69005-000", "AM", 14990, 1990, 16980],
    [[["B-PR-M", 2]], "66010-000", "PA", 35980, 1990, 37970],
    [[["C-PR-G", 1], ["D-BR-U", 1]], "76800-000", "RO", 39990, 0, 39990],
    [[["C-PR-G", 1], ["E-BR-U", 1]], "77999-999", "TO", 39989, 1990, 41979],
    [[["C-PR-G", 1], ["E-BR-U", 1]], "76799-999", "GO", 39989, 0, 39989],
    [[["A-BR-M", 3]], "69999-999", "AC", 44970, 0, 44970],
    [[["A-BR-M", 1], ["A-BR-G", 1]], "65999-999", "MA", 29980, 0, 29980],
    [[["E-BR-U", 10]], "70040-010", "DF", 99990, 0, 99990],
    [[["A-BR-M", 1], ["A-BR-M", 2]], "68900-000", "AP", 44970, 0, 44970],
  ];
  for (const [itens, cep, uf, subtotal, frete, total] of matriz) {
    const p = montarPedido(formulario(itens.map(([sku, quantidade]) => ({ sku, quantidade })), cep, uf), INDICE);
    assert.ok(!p.erro, `${cep}: ${p.erro}`);
    assert.deepEqual([p.subtotal_centavos, p.frete_centavos, p.total_centavos], [subtotal, frete, total], `${cep} ${JSON.stringify(itens)}`);
  }
});

caso("formulário inválido é recusado", () => {
  const ok = formulario([{ sku: "A-BR-M", quantidade: 1 }], "01310-100", "SP");
  const recusa = (mudar, trecho) => {
    const f = structuredClone(ok);
    mudar(f);
    const p = montarPedido(f, INDICE);
    assert.ok(p.erro, `devia recusar (${trecho})`);
    assert.match(p.erro, new RegExp(trecho, "i"));
  };
  recusa((f) => (f.itens = [{ sku: "NAO-EXISTE", quantidade: 1 }]), "disponível");
  recusa((f) => (f.itens = [{ sku: "A-BR-M", quantidade: 0 }]), "quantidade");
  recusa((f) => (f.itens = [{ sku: "A-BR-M", quantidade: 1.5 }]), "quantidade");
  recusa((f) => (f.itens = [{ sku: "A-BR-M", quantidade: 11 }]), "máximo");
  recusa((f) => (f.itens = [{ sku: "A-BR-M", quantidade: 6 }, { sku: "A-BR-M", quantidade: 5 }]), "máximo");
  recusa((f) => (f.itens = []), "vazia");
  recusa((f) => (f.endereco.uf = "RJ"), "não é de RJ");
  recusa((f) => (f.endereco.cep = "123"), "CEP");
  recusa((f) => (f.contato.cpf = "123.456.789-00"), "CPF");
  recusa((f) => (f.contato.email = "sem-arroba"), "e-mail");
  recusa((f) => (f.contato.telefone = "1234"), "telefone");
  recusa((f) => (f.projeto = "qualquer"), "projeto");
  recusa((f) => { f.projeto = "outro"; f.projeto_outro = ""; }, "projeto");
  recusa((f) => (f.chave = "curta"), "recarregue");
  assert.equal(cpfValido("52998224725"), true);
  assert.equal(cpfValido("11111111111"), false);
});

caso("preço e frete mandados pelo navegador são ignorados", async () => {
  const m = mundo();
  const f = formulario([{ sku: "A-BR-M", quantidade: 2, preco: 0.01, preco_centavos: 1 }], "69005-000", "AM", {
    frete_centavos: 0, total_centavos: 2, subtotal_centavos: 2,
  });
  const r = await m.chamar("/api/checkout", f);
  assert.equal(r.status, 201, JSON.stringify(r.corpo));
  assert.equal(r.corpo.resumo.total_centavos, 31970);
  const pref = m.mp.preferencias[0];
  const soma = pref.items.reduce((s, i) => s + Math.round(i.unit_price * 100) * i.quantity, 0);
  assert.equal(soma, 31970, "a preferência cobra o mesmo total do resumo");
  assert.deepEqual(pref.items.map((i) => i.id), ["A-BR-M", "frete"]);
  assert.equal(pref.external_reference, r.corpo.codigo);
  assert.equal(pref.payment_methods.installments, 12);
  assert.equal(pref.notification_url, undefined);
  assert.equal(m.pedido(r.corpo.codigo).total_centavos, 31970);
});

caso("pedido criado: resumo, link, e-mail com o token e nada do cartão no banco", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  assert.match(p.codigo, /^NB-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.equal(p.pagar, "https://mp.teste/checkout/1");
  assert.equal(m.emails.length, 1);
  assert.equal(m.emails[0].to[0], "maria@exemplo.com");
  const linha = m.pedido(p.codigo);
  assert.equal(linha.status, "aguardando_pagamento");
  assert.notEqual(linha.token_hash, p.token, "o token não fica no banco");
  assert.equal(linha.cpf, "52998224725");
  assert.ok(!Object.keys(linha).some((k) => /cart|card/i.test(k)), "nenhuma coluna de cartão");
});

caso("envio repetido com a mesma chave devolve o mesmo pedido; sacola mudada é recusada", async () => {
  const m = mundo();
  const f = formulario([{ sku: "B-PR-M", quantidade: 1 }], "01310-100", "SP");
  const a = await m.chamar("/api/checkout", f);
  const b = await m.chamar("/api/checkout", { ...f, turnstile: "token-gasto" });
  assert.equal(a.status, 201);
  assert.equal(b.status, 200);
  assert.equal(b.corpo.codigo, a.corpo.codigo);
  assert.equal(m.mp.preferencias.length, 1, "um pagamento só");
  assert.equal(m.contar("pedidos"), 1);
  const c = await m.chamar("/api/checkout", { ...f, itens: [{ sku: "B-PR-M", quantidade: 2 }] });
  assert.equal(c.status, 409);
});

caso("antirrobô, limite por IP e gateway fora do ar", async () => {
  const m = mundo();
  const robo = await m.chamar("/api/checkout", formulario([{ sku: "A-BR-M", quantidade: 1 }], "01310-100", "SP", { turnstile: "falso" }));
  assert.equal(robo.status, 403);
  assert.equal(m.mp.preferencias.length, 0);
  for (let i = 0; i < 5; i++) await criarPedido(m);
  const sexto = await m.chamar("/api/checkout", formulario([{ sku: "A-BR-M", quantidade: 1 }], "01310-100", "SP"));
  assert.equal(sexto.status, 429);
  const outroIp = await m.chamar("/api/checkout", formulario([{ sku: "A-BR-M", quantidade: 1 }], "01310-100", "SP"), { "CF-Connecting-IP": "198.51.100.9" });
  assert.equal(outroIp.status, 201);
  m.mp.fora = true;
  const antes = m.contar("pedidos");
  const fora = await m.chamar("/api/checkout", formulario([{ sku: "A-BR-M", quantidade: 1 }], "01310-100", "SP"), { "CF-Connecting-IP": "192.0.2.1" });
  assert.equal(fora.status, 502);
  assert.equal(m.contar("pedidos"), antes, "sem pagamento, sem pedido");
});

caso("aviso com assinatura falsa ou ausente é recusado e não mexe em nada", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  m.pagar(9001, p.codigo, 149.9);
  const falso = await m.aviso(9001, { segredo: "outro-segredo" });
  assert.equal(falso.status, 401);
  const sem = await m.chamar("/api/webhook/mercadopago?data.id=9001&type=payment", { type: "payment", data: { id: "9001" } });
  assert.equal(sem.status, 401);
  assert.equal(m.mp.leituras, 0, "nem consulta o pagamento");
  assert.equal(m.pedido(p.codigo).status, "aguardando_pagamento");
  const antigo = await m.chamar("/api/webhook/mercadopago?topic=payment&id=9001", {});
  assert.equal(antigo.status, 200);
  assert.equal(m.pedido(p.codigo).status, "aguardando_pagamento");
});

caso("aviso aprovado marca pago e manda dois e-mails; repetido não manda mais nada", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  m.pagar(9002, p.codigo, "149.90"); // a API pode mandar o valor como texto
  const a = await m.aviso(9002);
  assert.equal(a.status, 200);
  const linha = m.pedido(p.codigo);
  assert.equal(linha.status, "pago");
  assert.equal(linha.pagamento_id, "9002");
  assert.equal(linha.meio, "Pix");
  assert.equal(m.emails.length, 3, "criado + cliente + dono");
  assert.deepEqual(m.emails.slice(1).map((e) => e.to[0]).sort(), ["dono@nimbus.teste", "maria@exemplo.com"]);
  await m.aviso(9002);
  await m.aviso(9002);
  assert.equal(m.emails.length, 3, "aviso repetido não manda e-mail");
});

caso("valor adulterado não libera o pedido e avisa só o dono", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  m.pagar(9003, p.codigo, 0.01);
  await m.aviso(9003);
  assert.equal(m.pedido(p.codigo).status, "divergente");
  assert.equal(m.emails.length, 2);
  assert.equal(m.emails[1].to[0], "dono@nimbus.teste");
  m.pagar(9004, p.codigo, 149.9, { currency_id: "USD" });
  const q = await criarPedido(m);
  m.pagar(9005, q.codigo, 149.9, { currency_id: "USD" });
  await m.aviso(9005);
  assert.equal(m.pedido(q.codigo).status, "divergente", "moeda diferente também");
});

caso("pagamento sem pedido e segundo pagamento aprovado viram alerta ao dono", async () => {
  const m = mundo();
  m.pagar(9010, "NB-ZZZZ-ZZZZ", 50);
  await m.aviso(9010);
  assert.equal(m.emails.length, 1);
  assert.match(m.emails[0].subject, /sem pedido/);
  const p = await criarPedido(m);
  m.pagar(9011, p.codigo, 149.9);
  m.pagar(9012, p.codigo, 149.9);
  await m.aviso(9011);
  await m.aviso(9012);
  assert.equal(m.pedido(p.codigo).pagamento_id, "9011");
  assert.match(m.emails.at(-1).subject, /segundo pagamento/);
});

caso("aviso de pagamento que não existe na API é ignorado com 200", async () => {
  const m = mundo();
  const r = await m.aviso(123456);
  assert.equal(r.status, 200);
  assert.equal(m.emails.length, 0);
});

caso("recusado só registra; estorno parcial e total atualizam o pedido", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  m.pagar(9020, p.codigo, 149.9, { status: "rejected" });
  await m.aviso(9020);
  assert.equal(m.pedido(p.codigo).status, "aguardando_pagamento");
  m.pagar(9021, p.codigo, 149.9);
  await m.aviso(9021);
  assert.equal(m.pedido(p.codigo).status, "pago");
  m.pagar(9021, p.codigo, 149.9, { transaction_amount_refunded: 50 });
  await m.aviso(9021);
  assert.equal(m.pedido(p.codigo).estornado_centavos, 5000);
  m.pagar(9021, p.codigo, 149.9, { status: "refunded", transaction_amount_refunded: 149.9 });
  await m.aviso(9021);
  assert.equal(m.pedido(p.codigo).status, "reembolsado");
  assert.equal(m.pedido(p.codigo).estornado_centavos, 14990);
});

caso("conciliação pega o aviso perdido; o aviso atrasado não repete o e-mail", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  m.pagar(9030, p.codigo, 149.9);
  const cedo = await m.rodada();
  assert.equal(cedo.conferidos, 0, "pedido com menos de uma hora espera o aviso");
  m.avancar(2 * 3600 * 1000);
  const r = await m.rodada();
  assert.equal(r.conferidos, 1);
  assert.equal(m.pedido(p.codigo).status, "pago");
  assert.equal(m.emails.length, 3);
  await m.aviso(9030);
  assert.equal(m.emails.length, 3);
});

caso("limpeza: não pago some em 30 dias, pago fica", async () => {
  const m = mundo();
  const naoPago = await criarPedido(m);
  const pago = await criarPedido(m);
  m.pagar(9040, pago.codigo, 149.9);
  await m.aviso(9040);
  m.avancar(31 * 24 * 3600 * 1000);
  const r = await m.rodada();
  assert.equal(r.apagados, 1);
  assert.equal(m.pedido(naoPago.codigo), undefined);
  assert.equal(m.pedido(pago.codigo).status, "pago");
  const orfaos = m.env.DB.sql.prepare("SELECT COUNT(*) AS n FROM itens WHERE pedido = ?").get(naoPago.codigo).n;
  assert.equal(orfaos, 0, "itens vão junto");
});

caso("consulta do pedido: só com o token, sem dado pessoal na resposta, nunca 'em produção'", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  const errado = await m.chamar("/api/pedido", { codigo: p.codigo, token: "x".repeat(43) });
  assert.equal(errado.status, 404);
  const get = await m.chamar("/api/pedido", null, {}, "GET");
  assert.equal(get.status, 405);
  const r = await m.chamar("/api/pedido", { codigo: p.codigo, token: p.token });
  assert.equal(r.status, 200);
  assert.equal(r.corpo.status_texto, "Aguardando pagamento");
  assert.equal(r.corpo.pagar, "https://mp.teste/checkout/1");
  const texto = JSON.stringify(r.corpo);
  for (const proibido of ["529", "maria@", "99999", "Rua Um", "token_hash", "ip_hash"]) assert.ok(!texto.includes(proibido), proibido);
  for (const t of Object.values(STATUS_TEXTO)) assert.ok(!/produ[cç][aã]o/i.test(t), t);
});

caso("desistência pelo botão: só pago, confirma na hora, uma vez", async () => {
  const m = mundo();
  const p = await criarPedido(m);
  const cedo = await m.chamar("/api/pedido/desistir", { codigo: p.codigo, token: p.token });
  assert.equal(cedo.status, 409, "não pago não tem desistência");
  m.pagar(9050, p.codigo, 149.9);
  await m.aviso(9050);
  const intruso = await m.chamar("/api/pedido/desistir", { codigo: p.codigo, token: "y".repeat(43) });
  assert.equal(intruso.status, 404);
  const antes = m.emails.length;
  const ok = await m.chamar("/api/pedido/desistir", { codigo: p.codigo, token: p.token });
  assert.equal(ok.status, 200);
  assert.equal(m.pedido(p.codigo).status, "desistencia");
  assert.equal(m.emails.length, antes + 2, "cliente e dono");
  const de_novo = await m.chamar("/api/pedido/desistir", { codigo: p.codigo, token: p.token });
  assert.equal(de_novo.status, 200);
  assert.equal(m.emails.length, antes + 2);
  m.pagar(9050, p.codigo, 149.9, { status: "refunded", transaction_amount_refunded: 149.9 });
  await m.aviso(9050);
  assert.equal(m.pedido(p.codigo).status, "reembolsado");
});

caso("textos dos e-mails seguem as regras de copy", async () => {
  const m = mundo();
  const p = await criarPedido(m, [{ sku: "A-BR-M", quantidade: 1 }], "69005-000", "AM");
  m.pagar(9060, p.codigo, 169.8);
  await m.aviso(9060);
  await m.chamar("/api/pedido/desistir", { codigo: p.codigo, token: p.token });
  assert.equal(m.emails.length, 5);
  const proibidas = [/[—–]/, /sob demanda/i, /print on demand/i, /ap[oó]s o pedido/i, /troca f[aá]cil/i, /loja oficial/i, /em produ[cç][aã]o/i];
  for (const e of m.emails) for (const r of proibidas) assert.ok(!r.test(e.subject + e.text), `${r} em "${e.subject}"`);
  assert.match(m.emails[0].text, /Frete: R\$ 19,90/);
  assert.match(m.emails[0].text, /Total: R\$ 169,80/);
});

caso("rotas fora de /api/ vão para os arquivos do site", async () => {
  const m = mundo();
  let pedido = null;
  m.env.ASSETS = { fetch: (req) => { pedido = new URL(req.url).pathname; return new Response("{}"); } };
  await m.chamar("/loja/", null, {}, "GET");
  assert.equal(pedido, "/loja/");
});

caso("o catálogo publicado indexa, e o preço do servidor é o da vitrine", async () => {
  const real = JSON.parse(readFileSync(join(RAIZ, "public/loja/catalogo.json"), "utf-8"));
  const indice = indexarCatalogo(real);
  let n = 0;
  for (const prod of real.produtos)
    for (const vs of Object.values(prod.variantes_por_cor || {}))
      for (const v of vs) {
        assert.equal(indice.get(v.sku).preco_centavos, Math.round(v.preco * 100), v.sku);
        n++;
      }
  assert.equal(indice.size, n);
  const entrada = await import("../src/index.js");
  assert.equal(typeof entrada.default.fetch, "function");
  assert.equal(typeof entrada.default.scheduled, "function");
});

// ---------------------------------------------------------------- execução

let falhas = 0;
for (const [nome, fn] of casos) {
  try {
    await fn();
    console.log(`  ok      ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  FALHOU  ${nome}\n          ${e.message.split("\n").join("\n          ")}`);
  }
}
console.log(falhas ? `\nloja:teste: ${falhas} de ${casos.length} casos falharam` : `\nloja:teste: ${casos.length} casos ok`);
process.exit(falhas ? 1 : 0);

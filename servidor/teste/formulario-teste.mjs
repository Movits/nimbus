#!/usr/bin/env node
/**
 * Teste do formulário de compra, no navegador (loja própria, fase 4).
 *
 * Abre as páginas geradas (public/loja/finalizar/, /loja/pedido/ e
 * /loja/pedido/obrigado/) num Chromium de verdade. Um servidor local entrega
 * public/ e manda /api/* para o servidor da loja (servidor/src/app.js), no
 * mesmo mundo de mentira do portão loja:teste (mundo-falso.mjs). Nada sai para
 * a rede: o Turnstile e o Mercado Pago viram dublês dentro do navegador.
 *
 * Confere, do jeito que o cliente usa:
 *   - sacola vazia mostra o vazio; com itens, a lista e o formulário;
 *   - o estado sai do CEP, e o navegador manda só SKU e quantidade;
 *   - erro do servidor aparece na página;
 *   - rede que cai depois de o pedido nascer: o reenvio devolve o mesmo pedido,
 *     sem segundo pagamento;
 *   - "Confira antes de pagar" mostra o que o servidor calculou, não o preço da
 *     sacola, e "Pagar no Mercado Pago" leva ao link que o servidor criou;
 *   - sacola mudada ou endereço corrigido depois do resumo viram pedido novo;
 *   - a página do pedido abre pelo link do e-mail, tira o token da barra de
 *     endereço, sobrevive a um recarregar e registra a desistência;
 *   - a volta do Mercado Pago escolhe a frase pela situação e só esvazia a
 *     sacola quando o pagamento foi aprovado ou está em processamento;
 *   - nenhuma das telas rola para o lado no celular.
 *
 * Precisa do Playwright com o Chromium, o mesmo do vitrine:olho, e por isso
 * fica fora do CI. Uso: npm run loja:formulario
 * FOTOS=<pasta> salva uma foto de cada etapa, no celular e no computador.
 */
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { chromium } from "playwright";
import { CPF, RAIZ, mundo, tokenDoEmail } from "./mundo-falso.mjs";

const PUBLIC = join(RAIZ, "public");
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
};
const FOTOS = process.env.FOTOS || "";
if (FOTOS) mkdirSync(FOTOS, { recursive: true });

const m = mundo();
const checkouts = []; // o corpo de cada POST /api/checkout, como o navegador mandou

const http = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname.startsWith("/api/")) {
    const partes = [];
    for await (const p of req) partes.push(p);
    const corpo = Buffer.concat(partes).toString("utf8");
    if (url.pathname === "/api/checkout") checkouts.push(JSON.parse(corpo));
    const resp = await m.atender(new Request(`https://nimbus.teste${url.pathname}${url.search}`, {
      method: req.method,
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.9" },
      body: req.method === "POST" ? corpo : undefined,
    }));
    res.writeHead(resp.status, { "Content-Type": resp.headers.get("Content-Type") || "application/json" });
    res.end(await resp.text());
    return;
  }
  let caminho = decodeURIComponent(url.pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  const arquivo = normalize(join(PUBLIC, caminho));
  if (!arquivo.startsWith(PUBLIC + sep)) { res.writeHead(403); res.end(); return; }
  try {
    const dados = await readFile(arquivo);
    res.writeHead(200, { "Content-Type": TIPOS[extname(arquivo)] || "application/octet-stream" });
    res.end(dados);
  } catch {
    res.writeHead(404);
    res.end("não encontrado");
  }
});
await new Promise((ok) => http.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${http.address().port}`;

// Dublê do Turnstile: o mesmo contrato do modo explícito (render, reset e o
// onload da URL), com o token "ok" que o mundo de mentira aceita.
const DUBLE_TURNSTILE = `(function () {
  var opcoes = {}, n = 0;
  window.turnstile = {
    render: function (el, o) { var id = "w" + (++n); opcoes[id] = o; o.callback("ok"); return id; },
    reset: function (id) { if (opcoes[id]) opcoes[id].callback("ok"); },
  };
  var onload = new URL(document.currentScript.src).searchParams.get("onload");
  if (onload && window[onload]) window[onload]();
})();`;

// A sacola de partida. O preço da linha A é falso de propósito: o resumo tem
// que mostrar o do servidor.
const SACOLA = {
  itens: [
    { sku: "A-BR-M", slug: "teste-a", nome: "Teste A | Camiseta", cor: "Branca", tamanho: "M", peca: "Camiseta", preco: 1, qtd: 2 },
    { sku: "E-BR-U", slug: "teste-e", nome: "Teste E | Meia", cor: "Branca", tamanho: "Único", peca: "Meia", preco: 99.99, qtd: 1 },
  ],
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "pt-BR", hasTouch: true, isMobile: true });
await ctx.route("**/*", (route) => {
  const url = new URL(route.request().url());
  if (url.origin === BASE) return route.continue();
  if (url.host === "challenges.cloudflare.com") return route.fulfill({ contentType: "text/javascript", body: DUBLE_TURNSTILE });
  if (url.host === "mp.teste") return route.fulfill({ contentType: "text/html", body: "<title>Mercado Pago de mentira</title>" });
  return route.abort(); // fontes, GA4: fora do teste
});
const errosDeScript = [];
ctx.on("weberror", (e) => errosDeScript.push(e.error().message));

const visivel = (page, sel) => page.locator(sel).isVisible();
const texto = async (page, sel) => ((await page.textContent(sel)) || "").replace(/\s+/g, " ").trim();
async function semRolagemLateral(page, onde) {
  for (const largura of [390, 320]) {
    await page.setViewportSize({ width: largura, height: 844 });
    const [conteudo, tela] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    assert.ok(conteudo <= tela + 1, `${onde}: ${conteudo}px de conteúdo em ${tela}px de tela`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
}
async function foto(page, nome) {
  if (!FOTOS) return;
  await page.screenshot({ path: join(FOTOS, `${nome}-celular.png`), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: join(FOTOS, `${nome}-computador.png`), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
}
async function enviar(page) {
  await page.waitForFunction(() => window.turnstile);
  await page.click('[data-form-compra] button[type="submit"]');
}

const casos = [];
const caso = (nome, fn) => casos.push([nome, fn]);
const estado = {}; // o que um caso deixa para o seguinte
const page = await ctx.newPage();

caso("sacola vazia mostra o vazio, sem formulário e sem chamar a Cloudflare", async () => {
  let turnstile = false;
  page.on("request", (r) => { if (r.url().includes("challenges.cloudflare.com")) turnstile = true; });
  await page.goto(`${BASE}/loja/finalizar/`);
  assert.ok(await visivel(page, "[data-vazia]"));
  assert.ok(!(await visivel(page, "[data-form-compra]")));
  assert.ok(!turnstile, "o Turnstile carregou com a sacola vazia");
  assert.match(await page.getAttribute('meta[name="robots"]', "content"), /noindex/);
});

caso("com itens: a lista da sacola e o formulário", async () => {
  await page.evaluate((s) => localStorage.setItem("nimbus-sacola-v3", JSON.stringify(s)), SACOLA);
  await page.reload();
  assert.ok(await visivel(page, "[data-form-compra]"));
  assert.equal(await page.locator("[data-sacola-lista] li").count(), 2);
  assert.equal(await texto(page, "[data-sacola-subtotal]"), "R$ 101,99");
  await semRolagemLateral(page, "formulário");
  await foto(page, "1-formulario");
});

caso("o estado sai do CEP; erro do servidor aparece na página", async () => {
  await page.fill("#f-nome", "Maria Teste");
  await page.fill("#f-cpf", CPF);
  await page.fill("#f-email", "maria@exemplo.com");
  await page.fill("#f-telefone", "(61) 99999-0000");
  await page.fill("#f-cep", "01310-100");
  assert.equal(await page.inputValue("#f-uf"), "SP");
  await page.selectOption("#f-uf", "RJ"); // o cliente insiste noutro estado
  await page.fill("#f-cidade", "Manaus");
  await page.fill("#f-bairro", "Centro");
  await page.fill("#f-rua", "Rua Um");
  await page.fill("#f-numero", "10");
  await page.click("text=Fazenda da Esperança");
  await enviar(page);
  await page.waitForSelector("[data-erro]:not([hidden])");
  assert.equal(await texto(page, "[data-erro]"), "O CEP informado não é de RJ.");
  assert.equal(m.contar("pedidos"), 0);
  await page.fill("#f-cep", "69005-000");
  assert.equal(await page.inputValue("#f-uf"), "AM");
});

caso("rede que cai depois de o pedido nascer: o reenvio devolve o mesmo pedido", async () => {
  await page.route("**/api/checkout", async (route) => { await route.fetch(); await route.abort("failed"); }, { times: 1 });
  await enviar(page);
  await page.waitForSelector("[data-erro]:not([hidden])");
  assert.match(await texto(page, "[data-erro]"), /Sem conexão/);
  assert.equal(m.contar("pedidos"), 1);
  await enviar(page);
  await page.waitForSelector('[data-etapa="resumo"]:not([hidden])');
  assert.equal(m.contar("pedidos"), 1, "o reenvio criou um segundo pedido");
  assert.equal(m.mp.preferencias.length, 1, "o reenvio criou um segundo pagamento");
  const [a, b] = checkouts.slice(-2);
  assert.equal(a.chave, b.chave);
});

caso("o resumo é o do servidor: itens, frete do Norte, total e o link de pagar", async () => {
  const enviado = checkouts.at(-1);
  assert.deepEqual(enviado.itens, [{ sku: "A-BR-M", quantidade: 2 }, { sku: "E-BR-U", quantidade: 1 }]);
  assert.ok(!/preco|frete|total/.test(JSON.stringify(enviado)), "o navegador mandou preço ou frete");
  const itens = await page.locator("[data-resumo-itens] li").allTextContents();
  assert.match(itens[0], /Teste A \| Camiseta \(Branca, M\).*2 unidades.*R\$ 299,80/);
  assert.match(itens[1], /Teste E \| Meia \(Branca, Único\).*1 unidade.*R\$ 99,99/);
  assert.equal(await texto(page, "[data-resumo-frete]"), "R$ 19,90");
  assert.equal(await texto(page, "[data-resumo-total]"), "R$ 419,69");
  assert.match(await texto(page, "[data-resumo-entrega]"), /Rua Um, 10 · Centro · Manaus, AM · CEP 69005-000/);
  const codigo = m.mp.preferencias[0].external_reference;
  assert.match(await texto(page, "[data-resumo-codigo]"), new RegExp(`^Pedido ${codigo}\\.`));
  assert.equal(await page.getAttribute("[data-pagar]", "href"), "https://mp.teste/checkout/1");
  assert.match(await texto(page, '[data-etapa="resumo"]'), /Você pode desistir em até 7 dias após receber/);
  await semRolagemLateral(page, "resumo");
  await foto(page, "2-resumo");
});

caso("sacola mudada depois do resumo volta ao formulário, com chave nova", async () => {
  const antes = checkouts.at(-1).chave;
  // redesenhar sem mudar nada (a volta do Mercado Pago pelo "voltar") não derruba o resumo
  await page.evaluate(() => NIMBUS.sacola.pinta());
  assert.ok(await visivel(page, '[data-etapa="resumo"]'), "o resumo caiu sem a sacola mudar");
  await page.evaluate(() => NIMBUS.sacola.ajusta("E-BR-U", 1));
  assert.ok(await visivel(page, "[data-form-compra]"));
  assert.equal(await texto(page, "[data-erro]"), "A sacola mudou. Revise o pedido de novo.");
  await enviar(page);
  await page.waitForSelector('[data-etapa="resumo"]:not([hidden])');
  assert.notEqual(checkouts.at(-1).chave, antes);
  assert.equal(m.contar("pedidos"), 2);
  // 2 x 149,90 + 2 x 99,99 = 499,78: no Norte, frete grátis a partir de 399,90
  assert.equal(await texto(page, "[data-resumo-frete]"), "Grátis");
  assert.equal(await texto(page, "[data-resumo-total]"), "R$ 499,78");
});

caso("corrigir o endereço cria outro pedido, e pagar leva ao Mercado Pago", async () => {
  const antes = checkouts.at(-1).chave;
  await page.click("[data-corrige-endereco]");
  assert.ok(await visivel(page, "[data-form-compra]"));
  await page.fill("#f-numero", "20");
  await enviar(page);
  await page.waitForSelector('[data-etapa="resumo"]:not([hidden])');
  assert.notEqual(checkouts.at(-1).chave, antes);
  assert.equal(m.contar("pedidos"), 3);
  assert.match(await texto(page, "[data-resumo-entrega]"), /Rua Um, 20/);
  const href = await page.getAttribute("[data-pagar]", "href");
  assert.equal(href, `https://mp.teste/checkout/${m.mp.preferencias.length}`);
  await page.click("[data-pagar]");
  await page.waitForURL(href);
  estado.codigo = m.mp.preferencias.at(-1).external_reference;
});

caso("página do pedido: abre pelo link do e-mail, tira o token da barra e aguenta recarregar", async () => {
  const email = m.emails.filter((e) => e.text.includes(estado.codigo)).at(-1);
  const [codigo, token] = tokenDoEmail(email);
  assert.equal(codigo, estado.codigo);
  estado.token = token;
  await page.goto(`${BASE}/loja/pedido/#${codigo}.${token}`);
  await page.waitForSelector("[data-pedido-corpo]:not([hidden])");
  assert.equal(new URL(page.url()).hash, "", "o token ficou na barra de endereço");
  assert.equal(await texto(page, "[data-pedido-codigo]"), `Pedido ${codigo}`);
  assert.equal(await texto(page, "[data-pedido-status]"), "Aguardando pagamento");
  assert.equal(await page.getAttribute("[data-pedido-pagar] a", "href"), `https://mp.teste/checkout/${m.mp.preferencias.length}`);
  assert.ok(!(await visivel(page, "[data-desistir]")), "pedido não pago oferece desistência");
  await page.reload();
  await page.waitForSelector("[data-pedido-corpo]:not([hidden])");
  assert.equal(await texto(page, "[data-pedido-status]"), "Aguardando pagamento");
  await semRolagemLateral(page, "pedido");
});

caso("pedido pago: desistência pelo botão, com confirmação", async () => {
  const total = m.pedido(estado.codigo).total_centavos / 100;
  m.pagar("777001", estado.codigo, total);
  assert.equal((await m.aviso("777001")).status, 200);
  await page.reload();
  await page.waitForSelector("[data-desistir]:not([hidden])");
  assert.equal(await texto(page, "[data-pedido-status]"), "Pagamento confirmado");
  assert.ok(!(await visivel(page, "[data-pedido-pagar]")));
  await foto(page, "3-pedido-pago");
  await page.click("[data-desistir-abre]");
  await page.click("[data-desistir-nao]");
  assert.equal(m.pedido(estado.codigo).status, "pago", "voltar gravou a desistência");
  await page.click("[data-desistir-abre]");
  await page.click("[data-desistir-sim]");
  await page.waitForSelector("[data-pedido-recado]:not([hidden])");
  assert.equal(await texto(page, "[data-pedido-status]"), "Desistência registrada");
  assert.equal(m.pedido(estado.codigo).status, "desistencia");
  assert.ok(!(await visivel(page, "[data-desistir]")));
});

caso("link errado ou sem link: recado certo, sem pedido", async () => {
  await page.goto(`${BASE}/loja/pedido/#${estado.codigo}.${"x".repeat(43)}`);
  await page.waitForFunction(() => /Não achamos/.test(document.querySelector("[data-pedido-aviso]").textContent));
  const outra = await ctx.newPage();
  await outra.goto(`${BASE}/loja/pedido/`);
  await outra.waitForFunction(() => /abra o link do e-mail/.test(document.querySelector("[data-pedido-aviso]").textContent));
  assert.ok(!(await visivel(outra, "[data-pedido-corpo]")));
  await outra.close();
});

caso("volta do Mercado Pago: recusado guarda a sacola; aprovado mostra o código e esvazia", async () => {
  const sacola = () => page.evaluate(() => JSON.parse(localStorage.getItem("nimbus-sacola-v3") || "null"));
  await page.goto(`${BASE}/loja/pedido/obrigado/?codigo=${estado.codigo}&status=rejected`);
  assert.equal(await texto(page, "[data-obrigado-titulo]"), "O pagamento não foi concluído.");
  assert.equal((await sacola()).itens.length, 2);
  await page.goto(`${BASE}/loja/pedido/obrigado/?codigo=${estado.codigo}&collection_status=approved&status=approved&payment_id=777001`);
  assert.equal(await texto(page, "[data-obrigado-titulo]"), "Obrigado pelo pedido.");
  assert.equal(await texto(page, "[data-obrigado-codigo]"), `Pedido ${estado.codigo}`);
  assert.equal(new URL(page.url()).search, "", "a query ficou na barra de endereço");
  assert.deepEqual((await sacola()).itens, []);
  await semRolagemLateral(page, "obrigado");
  await foto(page, "4-obrigado");
});

let falhas = 0;
for (const [nome, fn] of casos) {
  try {
    await fn();
    console.log(`  ok      ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  FALHOU  ${nome}\n          ${e.message.split("\n").join("\n          ")}`);
    break; // os casos andam em sequência: um que falha derruba os seguintes
  }
}
if (errosDeScript.length) {
  falhas++;
  console.log(`  FALHOU  erro de JavaScript na página:\n          ${errosDeScript.join("\n          ")}`);
}
await browser.close();
http.close();
console.log(falhas ? `\nloja:formulario: falhou` : `\nloja:formulario: ${casos.length} casos ok`);
process.exit(falhas ? 1 : 0);

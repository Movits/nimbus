// O espelho da loja volta para a vitrine casando por pid + variante, não por
// nome. O nome vem de um <a> que embrulha a variante, então chega com quebra de
// linha e cortado em 48 caracteres: casar por ele falha nos 44 produtos.
import { existsSync } from "node:fs";
// O playwright local (node_modules) vale em qualquer máquina; o caminho
// absoluto é o da sessão na nuvem, que não tem o pacote instalado no projeto.
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs"));
}
const chromiumDaNuvem = "/opt/pw-browsers/chromium";
const b = await chromium.launch(existsSync(chromiumDaNuvem) ? { executablePath: chromiumDaNuvem } : {});
const ctx = await b.newContext({ baseURL: "http://127.0.0.1:8123" });
const page = await ctx.newPage();
let falhas = 0;
const ok = (c, n, extra = "") => { console.log(`${c ? "OK   " : "FALHA"} | ${n}${extra ? " :: " + extra : ""}`); if (!c) falhas++; };

await page.goto("http://127.0.0.1:8123/loja/");

const NOME_LONGO = "Anjo da Guarda Stencil | Camiseta Oversized Premium"; // 51 chars
const cru = (n, v) => (n + "\n  \n  " + v).trim().slice(0, 48); // o que o cart.tpl grava hoje

const r = await page.evaluate(({ NOME_LONGO, cruP, cruG }) => {
  const S = window.NIMBUS.sacola;
  S.esvazia && S.esvazia();
  localStorage.setItem("nimbus-sacola-v2", JSON.stringify({
    t: Date.now() - 5000,
    itens: [
      { slug: "anjo-p", nome: NOME_LONGO, cor: "Preta", tamanho: "P", peca: "Camiseta Oversized Premium", pid: "111", preco: 179.9, img: "/a.webp", qtd: 1 },
      { slug: "anjo-g", nome: NOME_LONGO, cor: "Preta", tamanho: "G", peca: "Camiseta Oversized Premium", pid: "111", preco: 179.9, img: "/a.webp", qtd: 1 },
    ],
  }));
  document.cookie = "nimbus_sacola_loja=" + encodeURIComponent(JSON.stringify({
    t: Date.now(), n: 3, total: 539.7,
    itens: [
      { pid: "111", partes: ["preta", "p"], nome: cruP, qtd: 1, sub: 179.9 },
      { pid: "111", partes: ["preta", "g"], nome: cruG, qtd: 2, sub: 359.8 },
    ],
  })) + "; path=/";
  S.sincroniza();
  const itens = S.itens();
  return {
    n: itens.length,
    chaves: itens.map((i) => S.chave(i)),
    detalhe: itens.map((i) => ({ slug: i.slug, tam: i.tamanho, cor: i.cor, img: i.img, qtd: i.qtd, pid: i.pid })),
  };
}, { NOME_LONGO, cruP: cru(NOME_LONGO, "Preta / P"), cruG: cru(NOME_LONGO, "Preta / G") });

ok(r.n === 2, "as duas linhas sobrevivem", String(r.n));
ok(new Set(r.chaves).size === 2, "P e G têm chaves DIFERENTES (não colapsam)", r.chaves.join(" vs "));
const p = r.detalhe.find((d) => d.tam === "P"), g = r.detalhe.find((d) => d.tam === "G");
ok(!!p && !!g, "achou o P e o G separados");
ok(p && p.slug === "anjo-p" && g && g.slug === "anjo-g", "cada linha casou com o gêmeo local certo", JSON.stringify(r.detalhe.map((d) => d.slug)));
ok(p && p.img === "/a.webp", "a foto sobreviveu (não virou item fantasma)", p && String(p.img));
ok(g && g.qtd === 2, "a quantidade veio da loja, que é a verdade", g && String(g.qtd));
ok(r.detalhe.every((d) => d.pid === "111"), "o pid sobreviveu para a ordem de remoção", JSON.stringify(r.detalhe.map((d) => d.pid)));

await b.close();
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo verde");
process.exit(falhas ? 1 : 0);

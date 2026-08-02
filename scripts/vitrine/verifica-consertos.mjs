// Confere no navegador os consertos da auditoria de 01/08.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs";
const CDN = "/tmp/claude-0/-home-user/f58e0689-2eb2-56a8-80a8-7cccd4e6f815/scratchpad/cdn/";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
let falhas = 0;
const ok = (c, n, e = "") => { console.log(`${c ? "OK   " : "FALHA"} | ${n}${e ? " :: " + e : ""}`); if (!c) falhas++; };
async function abre(opts) {
  const ctx = await b.newContext(opts);
  await ctx.route("**dcdn-us.mitiendanube.com/**", (r) => {
    const p = CDN + r.request().url().split("/").pop().split("?")[0];
    fs.existsSync(p) ? r.fulfill({ status: 200, contentType: "image/webp", body: fs.readFileSync(p) })
                     : r.fulfill({ status: 200, contentType: "image/webp", body: Buffer.alloc(0) });
  });
  return { ctx, page: await ctx.newPage() };
}

for (const w of [360, 390]) {
  const { ctx, page } = await abre({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
  await page.goto("http://127.0.0.1:8123/loja/p/sao-jorge-neobarroco1/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const bs = [...document.querySelectorAll(".pdp__thumbs button")];
    if (!bs.length) return { n: 0, linhas: 0, lado: 0 };
    return { n: bs.length, linhas: new Set(bs.map((x) => Math.round(x.getBoundingClientRect().top))).size,
             lado: Math.round(bs[0].getBoundingClientRect().width) };
  });
  ok(r.n > 0 && r.linhas === 1, `${w}px: as ${r.n} miniaturas cabem em UMA linha`, `${r.linhas} linha(s), lado ${r.lado}px`);
  await ctx.close();
}

for (const w of [360, 390]) {
  const { ctx, page } = await abre({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
  await page.goto("http://127.0.0.1:8123/loja/c/street/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const tres = await page.evaluate(() => [...document.querySelectorAll(".card__nome")]
    .filter((n) => n.getBoundingClientRect().height / (parseFloat(getComputedStyle(n).lineHeight) || 18) >= 2.9).length);
  ok(tres === 0, `${w}px: nenhum nome de card quebra em 3 linhas`, `${tres} quebrados`);
  await ctx.close();
}

{
  const { ctx, page } = await abre({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:8123/loja/c/street/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  await page.locator(".chip[data-peca]").nth(1).click();
  await page.selectOption("[data-ordenar]", "maior");
  await page.waitForTimeout(300);
  const url = page.url();
  ok(/peca=/.test(url) && /ordem=maior/.test(url), "o estado do filtro vai para a URL", url.split("?")[1] || "sem query");
  const antes = await page.evaluate(() => [...document.querySelectorAll("[data-grade] > *")].filter((c) => c.style.display !== "none").length);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({
    vis: [...document.querySelectorAll("[data-grade] > *")].filter((c) => c.style.display !== "none").length,
    sel: document.querySelector("[data-ordenar]").value,
    chip: document.querySelector('.chip[aria-pressed="true"]').dataset.peca,
  }));
  ok(r.vis === antes, "chegando pelo link, a grade vem filtrada igual", `${antes} antes, ${r.vis} depois`);
  ok(r.sel === "maior", "o select concorda com a grade (não mente mais)", r.sel);
  await ctx.close();
}

{
  const { ctx, page } = await abre({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:8123/loja/", { waitUntil: "domcontentloaded" });
  const r = await page.evaluate(() => [NIMBUS.reais(1049.6), NIMBUS.reais(1200), NIMBUS.reais(0)]);
  ok(r[0].includes("1.049,60") && r[1].includes("1.200,00") && r[2].includes("0,00"), "moeda com ponto de milhar e centavos", r.join(" · "));
  await ctx.close();
}

{
  const { ctx, page } = await abre({ viewport: { width: 1440, height: 900 } });
  for (const u of ["/loja/", "/loja/c/street/", "/loja/impacto/"]) {
    await page.goto("http://127.0.0.1:8123" + u, { waitUntil: "domcontentloaded" });
    const m = await page.evaluate(() => ["og:image", "og:url", "og:type"].map((k) => !!document.querySelector(`meta[property="${k}"]`)));
    ok(m.every(Boolean), `${u} tem og:image, og:url e og:type`);
  }
  await ctx.close();
}

{
  const { ctx, page } = await abre({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:8123/loja/p/querubim-spray1/", { waitUntil: "domcontentloaded" });
  const t = await page.evaluate(() => (document.querySelector(".pdp__devocao") || {}).textContent || "");
  ok(t && !/imagina..o moderna/i.test(t), "a PDP do Querubim não nega mais a estampa");
  await page.goto("http://127.0.0.1:8123/loja/p/wildstyle/", { waitUntil: "domcontentloaded" });
  const t2 = await page.evaluate(() => document.body.textContent);
  ok(!/N.o se aplica/i.test(t2), "a ficha da Ecobag não diz 'Não se aplica'");
  const kicker = await page.evaluate(() => (document.querySelector(".pdp__devocao .kicker") || {}).textContent || "");
  ok(/assinatura/i.test(kicker), "nas artes de marca o rótulo é 'A assinatura', não 'A devoção'", kicker);
  await ctx.close();
}

await b.close();
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo verde");
process.exit(falhas ? 1 : 0);

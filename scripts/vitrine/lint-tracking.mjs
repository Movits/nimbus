// Portão do tracking plan (P1-5 do conselho r4, 03/08/2026). O plano
// docs/fluxos/tracking-plan.md é a única fonte de verdade dos eventos de
// medição do site; este portão sai com código != 0 quando código e plano
// divergem, em QUALQUER direção:
//   - evento disparado no código sem linha no plano (evento clandestino);
//   - linha `ativo` do plano sem disparo no código (plano mentindo);
//   - linha `planejado` ou `fora` com disparo no código (decisão atropelada);
//   - `page_view` automático sem o gtag('config') nas páginas (medição caiu).
//
// O que ele lê como disparo do GA4: gtag('event', "nome"), ga4("nome") (helper
// do ui.js) e evento("nome") (helper do produto.js). Helper novo de disparo
// precisa entrar aqui no mesmo commit (regra 4 do próprio plano).
//
// Meta e TikTok (condição 4 do conselho r5, 12/08) entram no mesmo contrato,
// na seção "Pixels" do plano, com duas diferenças que o código impõe:
//   - os disparos de ui.js são dinâmicos (fbq("track", evento)), então a fonte
//     de verdade do código é o mapa EQUIVALE de ui.js, que traduz evento do GA4
//     em evento de pixel;
//   - enquanto META_PIXEL_ID e TIKTOK_PIXEL_ID estiverem vazios no build, nada
//     é injetado na página e os disparos são no-op: o plano tem que dizer
//     `planejado`. No dia em que o dono colar um ID, este portão fica VERMELHO
//     até as linhas virarem `ativo` — que é como o plano e o ar continuam
//     iguais sem depender de alguém lembrar.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const PLANO = path.join(RAIZ, "docs/fluxos/tracking-plan.md");
const UI = path.join(RAIZ, "public/loja/js/ui.js");
const BUILD = path.join(RAIZ, "scripts/vitrine/build-paginas.mjs");
const erros = [];

/* --- lado do plano: linhas de tabela com evento em crase + status ---------- */
// A seção manda: o que estiver sob "## Pixels..." é evento de Meta/TikTok; o
// resto é GA4. Sem isso, `ViewContent` seria cobrado como evento do gtag.
const md = fs.readFileSync(PLANO, "utf-8");
const plano = new Map(); // GA4: nome -> status
const pixelPlano = new Map(); // Meta/TikTok: nome -> status
let secao = "";
for (const linha of md.split(/\r?\n/)) {
  const cabeca = linha.match(/^##\s+(.*)$/);
  if (cabeca) { secao = cabeca[1].trim().toLowerCase(); continue; }
  const m = linha.match(/^\|\s*`([A-Za-z0-9_]+)`\s*\|\s*(ativo|automatico|automático|planejado|fora)\s*\|/i);
  if (!m) continue;
  const nome = m[1];
  const status = m[2].toLowerCase().replace("automático", "automatico");
  const alvo = secao.startsWith("pixels") ? pixelPlano : plano;
  if (alvo.has(nome) && alvo.get(nome) !== status)
    erros.push(`plano: evento "${nome}" com dois status diferentes (${alvo.get(nome)} e ${status})`);
  alvo.set(nome, status);
}
if (![...plano.values()].includes("ativo"))
  erros.push("plano: nenhuma linha `ativo` encontrada; a tabela do tracking-plan.md mudou de formato ou foi esvaziada");

/* --- lado do código: onde a vitrine e a landing disparam evento ----------- */
const fontes = [];
function anda(dir, exts) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p, exts);
    else if (exts.test(e.name)) fontes.push(p);
  }
}
anda(path.join(RAIZ, "public/loja/js"), /\.js$/);
if (fs.existsSync(path.join(RAIZ, "src"))) anda(path.join(RAIZ, "src"), /\.(ts|tsx|js|jsx)$/);
for (const f of ["index.html", "public/sw.js", "scripts/vitrine/build-paginas.mjs"])
  if (fs.existsSync(path.join(RAIZ, f))) fontes.push(path.join(RAIZ, f));

const DISPAROS = [
  /gtag\(\s*["']event["']\s*,\s*["']([a-z0-9_]+)["']/gi,
  /\bga4\(\s*["']([a-z0-9_]+)["']/g,
  /\bevento\(\s*["']([a-z0-9_]+)["']/g,
];
const noCodigo = new Map(); // nome -> [arquivos]
for (const arq of fontes) {
  const corpo = fs.readFileSync(arq, "utf-8");
  for (const re of DISPAROS)
    for (const m of corpo.matchAll(re)) {
      const lista = noCodigo.get(m[1]) || [];
      lista.push(path.relative(RAIZ, arq).replace(/\\/g, "/"));
      noCodigo.set(m[1], lista);
    }
}

/* --- confronto ------------------------------------------------------------ */
for (const [nome, onde] of noCodigo) {
  const status = plano.get(nome);
  if (!status)
    erros.push(`código: evento "${nome}" disparado em ${[...new Set(onde)].join(", ")} SEM linha no tracking-plan.md (evento novo entra primeiro no plano, mesmo commit)`);
  else if (status === "planejado")
    erros.push(`código: evento "${nome}" já disparado em ${[...new Set(onde)].join(", ")} mas o plano ainda diz "planejado"; promova a linha para "ativo" no mesmo commit`);
  else if (status === "fora")
    erros.push(`código: evento "${nome}" disparado em ${[...new Set(onde)].join(", ")} mas o plano decidiu "fora"; ou o código sai, ou a decisão muda no plano primeiro`);
}
for (const [nome, status] of plano)
  if (status === "ativo" && !noCodigo.has(nome))
    erros.push(`plano: evento "${nome}" está "ativo" mas nenhum disparo foi encontrado no código; o plano não pode prometer medição que não existe`);

// page_view automático: o config tem que estar vivo na vitrine e na landing
const CONFIG = /gtag\(\s*["']config["']\s*,\s*["']G-E041S3ZHWB["']\s*\)/;
for (const [rotulo, arq] of [["vitrine (home)", "public/loja/index.html"], ["landing", "index.html"]]) {
  const p = path.join(RAIZ, arq);
  if (!fs.existsSync(p) || !CONFIG.test(fs.readFileSync(p, "utf-8")))
    erros.push(`config: gtag('config','G-E041S3ZHWB') ausente em ${arq} (${rotulo}); o page_view automático do plano caiu`);
}

/* --- Meta e TikTok -------------------------------------------------------- */
const ui = fs.readFileSync(UI, "utf-8");
const build = fs.readFileSync(BUILD, "utf-8");
const idMeta = (build.match(/const\s+META_PIXEL_ID\s*=\s*"([^"]*)"/) || ["", ""])[1];
const idTikTok = (build.match(/const\s+TIKTOK_PIXEL_ID\s*=\s*"([^"]*)"/) || ["", ""])[1];
const pixelNoAr = Boolean(idMeta || idTikTok);

const pixelCodigo = new Map(); // nome do evento de pixel -> de onde veio
const mapa = ui.match(/const EQUIVALE = \{([\s\S]*?)\}/);
if (!mapa) {
  erros.push("código: o mapa EQUIVALE (evento do GA4 -> evento de pixel) sumiu de public/loja/js/ui.js; sem ele não dá para saber o que Meta e TikTok recebem");
} else {
  for (const m of mapa[1].matchAll(/([a-z0-9_]+)\s*:\s*"([A-Za-z]+)"/g)) {
    // a chave é um evento do GA4: mapear o que o plano não tem como ativo
    // significaria mandar aos pixels um evento que o GA4 não mede
    if (plano.get(m[1]) !== "ativo")
      erros.push(`código: ui.js manda "${m[1]}" para os pixels, mas esse evento não está "ativo" no plano do GA4; Meta e TikTok não podem medir o que o GA4 não mede`);
    pixelCodigo.set(m[2], `ui.js (equivale a ${m[1]})`);
  }
}
// o snippet base do Meta dispara PageView sozinho; o do TikTok, ttq.page()
for (const m of build.matchAll(/fbq\(\s*['"]track['"]\s*,\s*['"]([A-Za-z]+)['"]/g))
  pixelCodigo.set(m[1], "build-paginas.mjs (snippet base)");

for (const [nome, onde] of pixelCodigo) {
  const status = pixelPlano.get(nome);
  if (!status)
    erros.push(`pixels: evento "${nome}" existe no código (${onde}) SEM linha na seção Pixels do tracking-plan.md`);
  else if (pixelNoAr && status !== "ativo" && status !== "automatico")
    erros.push(`pixels: ID de pixel preenchido no build, então "${nome}" (${onde}) está NO AR, mas o plano diz "${status}"; promova a linha no mesmo commit`);
  else if (!pixelNoAr && (status === "ativo" || status === "automatico"))
    erros.push(`pixels: o plano diz "${status}" para "${nome}", mas META_PIXEL_ID e TIKTOK_PIXEL_ID estão vazios no build: nada é injetado e nada dispara. Preencha o ID ou volte a linha para "planejado"`);
}
for (const [nome] of pixelPlano)
  if (!pixelCodigo.has(nome))
    erros.push(`pixels: o plano lista "${nome}" mas nada no código dispara esse evento; tire a linha ou implemente no mesmo commit`);

if (erros.length) {
  console.error("LINT-TRACKING FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
const ativos = [...plano.entries()].filter(([, s]) => s === "ativo").map(([n]) => n);
const pixelRotulo = pixelNoAr
  ? `pixels NO AR (Meta ${idMeta || "-"}, TikTok ${idTikTok || "-"}) com ${pixelCodigo.size} evento(s)`
  : `pixels armados e desligados (${pixelCodigo.size} evento(s) esperando o ID do dono)`;
console.log(`lint-tracking OK: ${ativos.length} eventos ativos (${ativos.join(", ")}) batem com o código, ${[...plano.values()].filter((s) => s === "planejado").length} planejado(s), ${[...plano.values()].filter((s) => s === "fora").length} fora por decisão; config vivo na vitrine e na landing; ${pixelRotulo}`);

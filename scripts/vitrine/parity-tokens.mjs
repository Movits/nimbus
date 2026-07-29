// Gate de paridade de identidade: os tokens do :root da vitrine
// (public/loja-preview/css/tokens.css) têm que bater com os da landing
// (src/styles/global.css). Token compartilhado com valor diferente é regressão
// de marca; token novo em qualquer lado só passa se estiver na allowlist.
// Sai com código != 0 em qualquer divergência.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const LANDING = path.join(RAIZ, "src/styles/global.css");
const VITRINE = path.join(RAIZ, "public/loja-preview/css/tokens.css");

// só existem na vitrine (superfícies de loja que a landing não tem)
const SO_VITRINE = new Set([
  "--line", "--shadow",
  "--campo-street", "--campo-reliquia", "--campo-nuvem",
  "--maxw-loja", "--maxw-listagem",
]);
// só existem na landing (scroll 3D usa a própria régua de largura)
const SO_LANDING = new Set(["--maxw"]);

function tokens(arquivo) {
  const css = fs.readFileSync(arquivo, "utf-8");
  const m = css.match(/:root\s*{([^}]*)}/);
  if (!m) throw new Error(`sem bloco :root em ${arquivo}`);
  const mapa = new Map();
  for (const d of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
    mapa.set(d[1], d[2].replace(/\s+/g, " ").trim());
  return mapa;
}

const landing = tokens(LANDING);
const vitrine = tokens(VITRINE);
const erros = [];

for (const [nome, valor] of vitrine) {
  if (landing.has(nome)) {
    if (landing.get(nome) !== valor)
      erros.push(`${nome}: vitrine "${valor}" != landing "${landing.get(nome)}"`);
  } else if (!SO_VITRINE.has(nome)) {
    erros.push(`${nome}: só na vitrine e fora da allowlist`);
  }
}
for (const nome of landing.keys())
  if (!vitrine.has(nome) && !SO_LANDING.has(nome))
    erros.push(`${nome}: existe na landing e falta na vitrine`);

if (erros.length) {
  console.error("PARITY-TOKENS FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`parity-tokens OK: ${vitrine.size} tokens na vitrine, ${landing.size} na landing`);

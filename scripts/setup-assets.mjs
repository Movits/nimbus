// LIGA O REPOSITORIO DE ASSETS AO PRINCIPAL.
//
// O projeto vive em dois repositorios irmaos: o publico (codigo, documentacao,
// medicoes, receitas) e o privado `nimbus-assets` (artes, blanks, mockups).
//
// Todos os scripts usam caminho relativo a raiz do projeto — `designs/prontos/
// S6-...png`, `nuvemshop/assets/producao-capas/<id>/<id>-preta-blank.png`.
// Reescrever isso em 70 scripts seria pior que ligar as duas arvores aqui.
//
// Este script cria um link (junction no Windows, symlink no resto) de cada
// pasta de asset para dentro da arvore principal. Nada e copiado, entao nao ha
// duas copias para divergir.
//
// Uso:
//   node scripts/setup-assets.mjs [--assets ../nimbus-assets]
//
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const LIGACOES = [
  "designs/prontos",
  "designs/originais",
  "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references",
];

// os blanks moram dentro de uma arvore que TAMBEM tem arquivo versionado
// (as receitas .json), entao essa nao pode ser ligada inteira: copia-se.
const COPIAR_SEMPRE = ["nuvemshop/assets/producao-capas"];

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

function copiarArvore(de, para) {
  let n = 0;
  for (const item of fs.readdirSync(de, { withFileTypes: true })) {
    const o = path.join(de, item.name), d = path.join(para, item.name);
    if (item.isDirectory()) { fs.mkdirSync(d, { recursive: true }); n += copiarArvore(o, d); }
    else if (!fs.existsSync(d)) { fs.copyFileSync(o, d); n += 1; }
  }
  return n;
}

export function ligarAssets({ assets } = {}) {
  const raiz = process.cwd();
  const origem = path.resolve(assets ?? process.env.NIMBUS_ASSETS ?? "../nimbus-assets");
  if (!fs.existsSync(origem)) {
    throw new Error(
      `repositorio de assets nao encontrado em ${origem}.\n`
      + "Clone-o ao lado do principal:\n"
      + "  git clone https://github.com/Movits/nimbus-assets.git\n"
      + "ou aponte com --assets <caminho> / NIMBUS_ASSETS.",
    );
  }

  // SEMPRE MESCLA, nunca liga nem pula.
  //
  // Ligar por symlink nao serve: `designs/prontos` JA EXISTE no repositorio
  // publico como esqueleto de 31 `descrição.txt`, e um link substituiria essa
  // arvore versionada. Pular tambem nao serve: era o que meu primeiro esboco
  // fazia, e as artes nunca chegavam.
  //
  // `copiarArvore` so escreve o que falta, entao rodar de novo e barato e nao
  // sobrescreve nada — nem as receitas versionadas que moram no meio dos blanks.
  const feito = [];
  for (const rel of [...LIGACOES, ...COPIAR_SEMPRE]) {
    const de = path.join(origem, rel), para = path.join(raiz, rel);
    if (!fs.existsSync(de)) { feito.push({ rel, estado: "ausente na origem" }); continue; }
    fs.mkdirSync(para, { recursive: true });
    const n = copiarArvore(de, para);
    feito.push({ rel, estado: n ? `${n} arquivos novos` : "ja completo" });
  }
  return { origem, feito };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const r = ligarAssets({ assets: arg("--assets") });
  console.log(`assets em ${r.origem}\n`);
  for (const f of r.feito) console.log(`  ${f.estado.padEnd(34)} ${f.rel}`);
  console.log("\nConfira com: node scripts/producao/inventario.mjs");
}

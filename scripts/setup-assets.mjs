// LIGA O REPOSITORIO DE ASSETS AO PRINCIPAL.
//
// O projeto vive em dois repositorios irmaos: o publico (codigo, documentacao,
// medicoes, receitas) e o privado `nimbus-assets` (artes, blanks, mockups).
//
// Os scripts usam caminho relativo a raiz do projeto — `01-estampas/street/
// costas/sao-miguel-spray.png`. Reescrever isso em cada script seria pior que
// ligar as duas arvores aqui.
//
// Este script MESCLA as pastas de asset dentro da arvore principal, copiando
// so o que falta. E idempotente: rodar de novo nao sobrescreve nada.
//
// Uso:
//   node scripts/setup-assets.mjs [--assets ../nimbus-assets]
//
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Reorganizacao de 12/09/2026: a arte viva mora em `01-estampas/` no privado.
// As tres origens antigas (`designs/prontos`, `designs/originais` e as duas de
// `nuvemshop/assets/`) sumiram do privado entre 28/07 e 01/09 e este script
// vinha imprimindo "ausente na origem" em silencio para todas elas.
const LIGACOES = ["01-estampas"];

// nada mais precisa ser copiado por cima de arvore versionada: o espelho de
// 01-estampas e gitignorado inteiro, menos o LEIA-ME.
const COPIAR_SEMPRE = [];

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
  // Copia, nao symlink: o espelho e descartavel e o .gitignore do publico
  // ignora `01-estampas/*` menos o LEIA-ME. Pular nao serve: era o que meu
  // primeiro esboco fazia, e as artes nunca chegavam.
  //
  // `copiarArvore` so escreve o que falta, entao rodar de novo e barato e nao
  // sobrescreve nada — nem as receitas versionadas que moram no meio dos blanks.
  const feito = [];
  for (const rel of [...LIGACOES, ...COPIAR_SEMPRE]) {
    const de = path.join(origem, rel), para = path.join(raiz, rel);
    // origem ausente e ERRO, nao aviso: foi assim que tres das quatro ligacoes
    // ficaram mortas por semanas sem ninguem notar.
    if (!fs.existsSync(de))
      throw new Error(`origem ausente: ${de}\nO repositorio de assets mudou de estrutura? Confira nimbus-assets/LEIA-ME.md.`);
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

// Portões de nascimento da frente NUVEM (P1-1 do conselho r4, 03/08/2026).
// Sai com código != 0 se qualquer regra que hoje dependia de memória for
// violada. Cobre os itens a, b e d do P1-1:
//
//   (a) toda arte do catálogo tem entrada COMPLETA no devocional.json E o
//       bloco devocional está no HTML gerado de toda PDP. A ordem do dono de
//       01/08 ("se tiver em alguns, tem que ter em todos") tinha fallback
//       silencioso no build-paginas.mjs: arte sem entrada gerava PDP sem bloco
//       e ninguém via. Este portão roda depois do build e transforma o
//       silêncio em falha.
//   (b) toda peça do catálogo tem escala declarada em escala-grade.json, e a
//       tabela bate com as regras reais do loja.css nos dois sentidos. Peça
//       nova sem escala medida entraria ~20% maior na grade.
//   (d) todo produto tem par frente/costas POR COR, exceto a baseline datada
//       de 03/08 em par-fotos.excecoes.json. A lista só encolhe: exceção que
//       deixou de ser necessária também derruba o build, para ser removida.
//
// Onde vivem os irmãos deste portão:
//   (c) 300 DPI na receita de export -> scripts/producao/lint-export-300dpi.mjs
//       (precisa dos assets privados mesclados; fora do CI de propósito)
//   (f) regeneração no CI com diff limpo -> .github/workflows/deploy.yml
//   (g) monitor diário contra o ar    -> .github/workflows/monitor-diario.yml
//
// PENDÊNCIA declarada (P1-1e, corre em paralelo sem bloquear o portão de
// nascimento): fallback de relacionados cross-coleção quando a mesma coleção
// rende menos de 3 (as 2 PDPs da NUVEM são becos sem saída hoje). Exige editar
// scripts/vitrine/build-paginas.mjs, em edição por outra frente em 03/08.
// Quando o fallback existir, acrescentar AQUI o check de >= 3 relacionados por
// PDP; antes do fallback ele falharia sempre, e portão não vira informativo.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const cat = JSON.parse(fs.readFileSync(path.join(RAIZ, "public/loja/catalogo.json"), "utf-8"));
const DEVOCIONAL = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "devocional.json"), "utf-8"));
const ESCALA = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "escala-grade.json"), "utf-8"));
const EXCECOES = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "par-fotos.excecoes.json"), "utf-8"));
const CSS = fs.readFileSync(path.join(RAIZ, "public/loja/css/loja.css"), "utf-8");
const erros = [];

/* --- (a) devocional: catálogo -> devocional.json -> HTML gerado ----------- */
const artes = [...new Set(cat.produtos.map((p) => p.arte))];
for (const arte of artes) {
  const d = DEVOCIONAL[arte];
  if (!d) { erros.push(`devocional: arte "${arte}" sem entrada no devocional.json`); continue; }
  for (const campo of ["santo", "historia", "estetica"])
    if (!String(d[campo] || "").trim())
      erros.push(`devocional: arte "${arte}" com campo "${campo}" vazio no devocional.json`);
}
// entrada ADIANTADA é permitida (arte nova nasce com devocional escrito antes
// do produto entrar no catálogo, regra do P1-2); entrada FALTANDO não é.
for (const p of cat.produtos) {
  const arq = path.join(RAIZ, "public/loja/p", p.slug, "index.html");
  if (!fs.existsSync(arq)) { erros.push(`devocional: PDP não gerada: public/loja/p/${p.slug}/`); continue; }
  if (!fs.readFileSync(arq, "utf-8").includes('class="pdp__devocao"'))
    erros.push(`devocional: PDP de ${p.slug} SEM o bloco devocional no HTML (fallback silencioso do build pegou a arte "${p.arte}")`);
}

/* --- (b) escala da grade: catálogo <-> tabela <-> loja.css ---------------- */
const tabela = Object.fromEntries(Object.entries(ESCALA).filter(([k]) => k !== "_comentario"));
const pecasCatalogo = [...new Set(cat.produtos.map((p) => p.peca))];
const regrasCss = new Map();
for (const m of CSS.matchAll(/\.card\[data-peca="([^"]+)"\]\s*\.card__midia img\s*\{\s*transform:\s*scale\(([\d.]+)\)\s*;?\s*\}/g))
  regrasCss.set(m[1], Number(m[2]));

for (const peca of pecasCatalogo)
  if (!(peca in tabela))
    erros.push(`escala: peça "${peca}" do catálogo sem entrada em escala-grade.json (peça nova entraria ~20% maior na grade)`);
for (const [peca, valor] of Object.entries(tabela)) {
  if (!pecasCatalogo.includes(peca))
    erros.push(`escala: peça "${peca}" na tabela sem produto no catálogo (entrada órfã: remova ou corrija o nome)`);
  const css = regrasCss.get(peca);
  if (valor !== 1 && css === undefined)
    erros.push(`escala: peça "${peca}" declara scale(${valor}) na tabela mas o loja.css não tem a regra .card[data-peca="${peca}"]`);
  if (css !== undefined && css !== valor)
    erros.push(`escala: peça "${peca}" com scale(${css}) no loja.css e ${valor} na tabela; os dois têm que bater`);
}
for (const peca of regrasCss.keys())
  if (!(peca in tabela))
    erros.push(`escala: regra CSS para "${peca}" sem entrada em escala-grade.json (a tabela é a fonte de verdade)`);

/* --- (d) par frente/costas por cor, com baseline datada que só encolhe ---- */
const excecoes = Object.fromEntries(Object.entries(EXCECOES).filter(([k]) => k !== "_comentario"));
const vistas = new Set();
for (const p of cat.produtos) {
  for (const cor of p.opcoes.cores) {
    const pc = (p.imagens.por_cor || {})[cor] || {};
    const falta = ["frente", "costas"].filter((lado) => !pc[lado]);
    const chave = `${p.id}|${cor}`;
    const exc = excecoes[chave];
    if (exc) vistas.add(chave);
    if (!falta.length) {
      if (exc) erros.push(`par-fotos: ${p.slug} [${cor}] agora tem o par completo; remova a exceção "${chave}" de par-fotos.excecoes.json (a lista só encolhe)`);
      continue;
    }
    if (!exc) { erros.push(`par-fotos: ${p.slug} [${cor}] sem ${falta.join(" nem ")} (produto novo exige par frente/costas por cor; P1-1d)`); continue; }
    if (falta.join("+") !== exc.faltando)
      erros.push(`par-fotos: ${p.slug} [${cor}] falta "${falta.join("+")}" mas a exceção congela "${exc.faltando}"; o quadro mudou, reavalie a entrada`);
  }
}
for (const chave of Object.keys(excecoes))
  if (!vistas.has(chave))
    erros.push(`par-fotos: exceção "${chave}" não corresponde a nenhum produto+cor do catálogo; remova a entrada morta`);

/* -------------------------------------------------------------------------- */
if (erros.length) {
  console.error("LINT-NUVEM FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(
  `lint-nuvem OK: ${artes.length} artes com devocional completo em ${cat.produtos.length} PDPs, ` +
  `${pecasCatalogo.length} peças com escala declarada (tabela = CSS), ` +
  `par frente/costas fechado com ${Object.keys(excecoes).length} exceções datadas de 03/08`
);

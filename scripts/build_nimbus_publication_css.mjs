/**
 * Gera o CSS consolidado da loja Nuvemshop, o arquivo que se cola no painel
 * (Loja online > Layout > Edição de CSS avançada). Protocolo de colagem em
 * docs/fluxos/site-css-e-hover.md.
 *
 *   node scripts/build_nimbus_publication_css.mjs
 *       regrava nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css
 *
 *   node scripts/build_nimbus_publication_css.mjs --aberta --saida=<arquivo>
 *       prévia da loja ABERTA: mesmo build sem o bloco "ESTADO FECHADO",
 *       gravado em outro arquivo. Nunca toca o canônico.
 *
 * O painel sanitiza o que se cola e derruba em silêncio parte da sintaxe
 * (medido em 11/11/2026: 50.721 caracteres versionados, 47.579 no ar). O
 * próprio esbuild fabricava duas das formas derrubadas ao minificar: rgba()
 * virava hex de 8 dígitos e top/right/bottom/left virava inset. Por isso o
 * `supported` abaixo, e por isso o build recusa gravar saída com qualquer
 * item de PROIBIDO. A mesma lista vale em scripts/verifica-css-loja.mjs,
 * que é o portão `npm run loja:css`: mudou uma, mude a outra.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "nuvemshop");

// Ordem do build: a última vence. A lista tem que bater com o .entry.css.
const fontes = [
  "css-nimbus-correcoes-2026-07-17.css",
  "css-nimbus-responsive-header-footer-2026-07-20.css",
  "css-nimbus-um-so-ceu-2026-11-11.css",
];
const canonico = path.join(dir, "css-nimbus-publicacao-compacta-2026-07-20.css");
const entrada = path.join(dir, "css-nimbus-publicacao-compacta-2026-07-20.entry.css");

const LIMITE = 57500; // acima disso o painel recusa ou trunca
const META = 46000;

const INICIO_FECHADO = "ESTADO FECHADO: apagar este bloco quando o catálogo voltar";
const FIM_FECHADO = "FIM DO ESTADO FECHADO";

/** Sintaxe que o painel derruba (medida) ou que nunca foi testada nele. */
const PROIBIDO = [
  ["clamp()", /\bclamp\(/i],
  ["propriedade inset", /(^|[;{\s])inset(-[a-z-]+)?\s*:/i],
  ["aspect-ratio", /aspect-ratio/i],
  [":focus-visible", /:focus-visible/i],
  ["prefers-reduced-motion", /prefers-reduced-motion/i],
  ["text-underline-offset", /text-underline-offset/i],
  ["text-decoration-thickness", /text-decoration-thickness/i],
  ["var()", /\bvar\(/i],
  ["custom property", /(^|[;{\s])--[a-z0-9_-]+\s*:/i],
  [":has()", /:has\(/i],
  [":is()", /:is\(/i],
  [":where()", /:where\(/i],
  ["@import", /@import\b/i],
  ["@font-face", /@font-face\b/i],
  ["unidade lvh/svh/dvh", /\d(lvh|svh|dvh)\b/i],
  ["nesting (&)", /[{;]\s*&/],
  // O tema só carrega Fraunces 400/700 e Inter 400/700.
  ["font-weight 300/500/600", /font-weight\s*:\s*(300|500|600)\b/i],
  // Escape em content é inusável no painel (ver verifica-css-loja.mjs).
  ["escape em content", /content\s*:\s*"[^"]*\\/i],
  // Copy pública proibida também vale para texto que entra por content.
  ["travessão", new RegExp(String.fromCharCode(8212))],
  ["copy proibida", /sob demanda|print on demand|troca fácil|loja oficial/i],
];

/** Hex com alfa (#rrggbbaa e #rgba) só conta em valor de declaração: em
 *  seletor, #face seria um id legítimo. */
function hexComAlfa(css) {
  const achados = [];
  for (const m of css.matchAll(/[{;]([a-z-]+):([^;{}]*)/gi)) {
    const hex = m[2].match(/#(?:[0-9a-f]{8}|[0-9a-f]{4})(?![0-9a-f])/i);
    if (hex) achados.push(`${m[1]}:${m[2].slice(0, 60)}`);
  }
  return achados;
}

function tokensProibidos(css) {
  const achados = [];
  for (const [nome, re] of PROIBIDO) {
    const m = css.match(re);
    if (m) {
      const i = Math.max(0, m.index - 40);
      achados.push(`${nome}: ...${css.slice(i, m.index + 60)}...`);
    }
  }
  for (const h of hexComAlfa(css)) achados.push(`hex com alfa: ${h}`);
  return achados;
}

function semEstadoFechado(css) {
  const i = css.indexOf(INICIO_FECHADO);
  const f = css.indexOf(FIM_FECHADO);
  const inicio = css.lastIndexOf("/*", i);
  const fim = css.indexOf("*/", f) + 2;
  return css.slice(0, inicio) + css.slice(fim);
}

function exige(css, trecho, motivo) {
  if (!css.includes(trecho)) {
    throw new Error(`Regra obrigatória ausente (${motivo}): ${trecho}`);
  }
}

function recusa(css, re, motivo) {
  const m = css.match(re);
  if (m) throw new Error(`${motivo}: ...${m[0].slice(0, 120)}...`);
}

const aberta = process.argv.includes("--aberta");
const saidaArg = process.argv.find((a) => a.startsWith("--saida="));
const saida = saidaArg ? path.resolve(saidaArg.slice("--saida=".length)) : canonico;
if (aberta && saida === canonico) {
  throw new Error("--aberta é só prévia: informe --saida=<arquivo> fora do canônico.");
}

// O .entry.css é a lista legível das fontes; não pode divergir do build.
const importados = [...(await fs.readFile(entrada, "utf8")).matchAll(/@import\s+"\.\/([^"]+)"/g)].map((m) => m[1]);
if (importados.join("|") !== fontes.join("|")) {
  throw new Error(`O .entry.css lista [${importados.join(", ")}] e o build usa [${fontes.join(", ")}].`);
}

const partes = [];
let temFechado = false;
for (const nome of fontes) {
  let css = await fs.readFile(path.join(dir, nome), "utf8");
  const inicios = css.split(INICIO_FECHADO).length - 1;
  const fins = css.split(FIM_FECHADO).length - 1;
  if (inicios || fins) {
    // O bloco é opcional (some de vez quando o catálogo voltar), mas, se
    // existe, tem que estar inteiro: uma abertura, um fecho, nessa ordem.
    if (inicios !== 1 || fins !== 1 || css.indexOf(INICIO_FECHADO) > css.indexOf(FIM_FECHADO)) {
      throw new Error(`Bloco ESTADO FECHADO malformado em ${nome}: ${inicios} abertura(s), ${fins} fecho(s).`);
    }
    temFechado = true;
    if (aberta) css = semEstadoFechado(css);
  }
  partes.push(css);
}
const fechada = temFechado && !aberta;

const resultado = await transform(partes.join("\n"), {
  loader: "css",
  minify: true,
  charset: "utf8",
  // Sem isto o minificador devolve #rrggbbaa e inset, que o painel apaga.
  supported: { "hex-rgba": false, "inset-property": false },
});
const css = resultado.code.trim();

// O que não pode faltar, com o motivo.
exige(css, "bg-ceu.webp", "o céu único");
exige(css, 'html body:before{content:"";position:fixed', "o céu parado atrás do conteúdo");
exige(css, ".js-item-product:not([data-product-id]){display:none!important}", "produto de exemplo nunca aparece");
exige(css, "#product-example>*{display:none!important}", "404 sem produto de exemplo");
exige(css, 'content:"Esta página não existe."', "404 com mensagem");
exige(css, ".nimbus-project-modal:target{display:flex!important}", "modal dos projetos abre por âncora");
exige(
  css,
  ".nimbus-project-modal{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important",
  "modal dos projetos cobre a tela sem inset",
);
exige(css, ":nth-of-type(n+9)", "links de suporte fora do menu principal");
exige(css, "footer.js-footer>.text-left.text-md-center", "linha legal do rodapé");
exige(css, "@media (max-width: 767px)", "regras de celular");
exige(css, "@media (min-width: 768px)", "regras de desktop");
// Regra do dono (11/11/2026): imagem nunca esticada. Largura fixa pede altura
// automática, no logo do topo (img) e no do rodapé (fundo).
exige(css, "background-size:168px auto", "logo do rodapé sem esticar");
if (!/\.head-main \.logo-img\{[^}]*height:auto!important/.test(css)) {
  throw new Error("Regra obrigatória ausente (logo do topo sem esticar): .head-main .logo-img com height:auto");
}
if (
  !/\.contact-page \.contact-info,[^{}]*footer\.js-footer \.js-footer-col-sticky[^{}]*\{display:none!important\}/.test(css)
) {
  throw new Error("Regra obrigatória ausente (contato pessoal escondido): .contact-info e .js-footer-col-sticky");
}
if (fechada) {
  exige(css, "section[data-store=home-banner-categories]{display:none!important}", "fechada: sem carrossel de categorias");
  exige(css, '[href*="/loja/c/"]', "fechada: sem links de coleção no menu");
  exige(css, "html body .js-item-product,", "fechada: nenhuma grade de produto");
  exige(css, "html body .head-main{top:0!important}", "fechada: topo parado sem a faixa");
}

// O que não pode existir.
recusa(css, /text-md-center[^{}]*\{[^}]*content:/, "A linha legal não se reescreve por CSS");
recusa(css, /\.js-notification-cookie-banner\{[^}]*display:/, "O aviso de cookies não leva display (o tema alterna por style inline)");
recusa(css, /chunk|encheu|la de x|lá de x/i, "Texto corrompido detectado no CSS");

const proibidos = tokensProibidos(css);
if (proibidos.length) {
  throw new Error(`Sintaxe que o painel derruba ou que nunca foi testada:\n  ${proibidos.join("\n  ")}`);
}

const abre = (css.match(/\{/g) ?? []).length;
const fecha = (css.match(/\}/g) ?? []).length;
if (abre !== fecha) {
  throw new Error(`Chaves desequilibradas: ${abre} abertas e ${fecha} fechadas`);
}
if (css.length >= LIMITE) {
  throw new Error(`CSS excede o limite seguro do painel: ${css.length} de ${LIMITE} caracteres`);
}

await fs.writeFile(saida, `${css}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      saida,
      caracteres: css.length,
      meta: META,
      dentroDaMeta: css.length < META,
      limite: LIMITE,
      estadoFechado: fechada,
      fontes,
      chaves: abre,
    },
    null,
    2,
  ),
);

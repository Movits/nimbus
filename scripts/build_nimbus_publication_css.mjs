import fs from "node:fs/promises";
import path from "node:path";
import { transform } from "esbuild";

const root = "C:\\Users\\rober\\Nimbus";
const basePath = path.join(
  root,
  "nuvemshop",
  "css-nimbus-correcoes-2026-07-17.css",
);
const responsivePath = path.join(
  root,
  "nuvemshop",
  "css-nimbus-responsive-header-footer-2026-07-20.css",
);
const outputPath = path.join(
  root,
  "nuvemshop",
  "css-nimbus-publicacao-compacta-2026-07-20.css",
);

const supersededSections = [
  "/* Cabecalho: marca a esquerda e utilitarios agrupados a direita. */",
  "/* Rodape: navegacao institucional e copyright no mesmo eixo. */",
  "/* Header mobile: logo no centro geometrico da tela, com laterais simetricas. */",
  "/* Footer editorial do preview: marca | Loja/NIMBUS | Ajuda. */",
  "/* Footer NIMBUS v2: faixa editorial, marca clara e fechamento navy. */",
  "/* Manifesto: titulo e chamada compartilham o mesmo eixo vertical. */",
  "/* Manifesto: grid real e titulo sempre quebrado, nunca recortado. */",
];

const supersededResponsiveSections = [
  "/* Mobile: o logo fica no centro",
];

function removeCommentSection(css, marker) {
  const start = css.indexOf(marker);
  if (start < 0) {
    throw new Error(`Seção não encontrada: ${marker}`);
  }

  const next = css.indexOf("/*", start + marker.length);
  if (next < 0) {
    throw new Error(`Seção sem delimitador seguinte: ${marker}`);
  }

  return css.slice(0, start) + css.slice(next);
}

function assertIncludes(css, needle) {
  if (!css.includes(needle)) {
    throw new Error(`Regra obrigatória ausente: ${needle}`);
  }
}

let base = await fs.readFile(basePath, "utf8");
let responsive = await fs.readFile(responsivePath, "utf8");

for (const marker of supersededSections) {
  base = removeCommentSection(base, marker);
}

for (const marker of supersededResponsiveSections) {
  responsive = removeCommentSection(responsive, marker);
}

const source = `${base}\n${responsive}`;
const result = await transform(source, {
  loader: "css",
  minify: true,
  charset: "utf8",
});
const css = result.code.trim();

const required = [
  ".js-product-item-image-container-private.secondary-images-disabled",
  '.item-image-secondary.js-product-item-secondary-image-private[data-srcset*="/file_name-"',
  ".nimbus-project-modal__close:hover",
  "footer.js-footer>.row:before",
  "footer.js-footer .footer-menu-item:nth-child(9):before",
  ".head-main .nav-desktop-list>.nav-main-item:nth-of-type(n+9)",
  "footer.js-footer>.text-left.text-md-center",
  "padding:18px 24px 24px!important",
  "@media (max-width: 767px)",
  "@media (min-width: 768px)",
];

for (const needle of required) {
  assertIncludes(css, needle);
}

const ids = [
  ...css.matchAll(/\[data-product-id="(\d+)"\]\s*\.item-image-secondary/g),
].map((match) => match[1]);
const uniqueIds = new Set(ids);

const openBraces = (css.match(/\{/g) ?? []).length;
const closeBraces = (css.match(/\}/g) ?? []).length;

if (openBraces !== closeBraces) {
  throw new Error(
    `Chaves desequilibradas: ${openBraces} abertas e ${closeBraces} fechadas`,
  );
}
if (uniqueIds.size !== 20) {
  throw new Error(`Esperava 20 produtos mono-cor; encontrei ${uniqueIds.size}`);
}
if (/chunk|encheu|la de x|lá de x/i.test(css)) {
  throw new Error("Texto corrompido detectado no CSS");
}
if (css.length >= 57500) {
  throw new Error(`CSS ainda excede o limite seguro: ${css.length} caracteres`);
}

await fs.writeFile(outputPath, `${css}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      chars: css.length,
      openBraces,
      closeBraces,
      monoColorProductIds: uniqueIds.size,
      removedSections:
        supersededSections.length + supersededResponsiveSections.length,
    },
    null,
    2,
  ),
);

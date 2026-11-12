#!/usr/bin/env node
/**
 * O CSS da loja tem que sobreviver ao minificador do painel da Nuvemshop.
 *
 * Por que este arquivo existe. O rodapé publicado dizia
 * "feito no Brasil.ਐ% do lucro". Aquele ਐ é GURMUKHI LETTER AI, U+0A10, e
 * apareceu assim: a regra tinha `content:"...Brasil.\A 10% do lucro..."`, onde
 * `\A` é a quebra de linha e o espaço depois dele é o DELIMITADOR do escape, não
 * texto. O minificador do painel come espaço, entregou `\A10%`, e o navegador
 * leu `A10` como hexadecimal. Um caractere punjabi no meio da frase mais
 * importante do rodapé, a dos 10% para projeto social.
 *
 * O conserto não é tirar a quebra de linha, é escrever o escape com SEIS
 * dígitos: `\00000A`. A especificação encerra o escape depois de seis dígitos
 * hexadecimais, então ele dispensa delimitador e não sobra espaço para o
 * minificador comer. Medido em Chromium: `\A 10%` e `\00000A10%` produzem
 * exatamente a mesma string, e a versão de seis dígitos continua igual depois de
 * minificada.
 *
 * O teste não confere padrão de escrita, confere COMPORTAMENTO: pega todo
 * `content:` dos CSS da loja, simula o que o painel faz (apagar o espaço depois
 * do escape), e compara a string calculada pelo navegador nos dois casos. Se
 * divergir, o painel vai publicar coisa diferente do que está versionado.
 *
 * Este CSS NÃO sobe por Git. A Nuvemshop não faz deploy por repositório: o dono
 * cola no painel, em Loja online > Layout > Edição de CSS avançada. Por isso o
 * teste roda contra o arquivo versionado, que é o que vai ser colado.
 *
 * Segunda conferência, de 11/11/2026: a sintaxe que o painel derruba. Medido
 * naquele dia, o arquivo versionado tinha 50.721 caracteres e o que a loja
 * servia tinha 47.579: o sanitizador apagou, sem avisar, toda regra com
 * :focus-visible, os blocos de prefers-reduced-motion e cada declaração com
 * clamp(), inset, aspect-ratio, hex de 8 dígitos, var(), custom property,
 * text-underline-offset e text-decoration-thickness. O hover da sacola, o
 * fundo do modal dos projetos e o tamanho do título no celular nunca chegaram
 * ao site. O portão agora recusa essa sintaxe, e a que nunca foi testada no
 * painel, no arquivo canônico, que é o que se cola. A lista é a mesma de
 * scripts/build_nimbus_publication_css.mjs: mudou uma, mude a outra.
 *
 *   node scripts/verifica-css-loja.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// O playwright local (node_modules) vale em qualquer máquina; o caminho
// absoluto é o da sessão na nuvem, que não tem o pacote instalado no projeto.
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs"));
}

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "nuvemshop");
// Cobre também as FONTES do build (16/07 e 17/07): regenerar o consolidado a
// partir de fonte com escape curto reintroduziria o bug que este portão mata.
// Janela ampliada em 12/08: QUALQUER css-nimbus-*.css no nível de nuvemshop/
// entra no portão — CSS novo com data nova entrava cego na regra antiga.
const ARQUIVOS = /^css-nimbus-.*\.css$/;

/** O que o painel faz com o CSS colado, MEDIDO em produção (03-04/08): além de
 *  comer o espaço que delimita o escape, ele TAMBÉM remove os zeros à esquerda
 *  (\00000A vira \A), então até o escape de 6 dígitos gruda no que vem depois
 *  quando o próximo caractere é hexadecimal (\00000A10 servido como ਐ, e
 *  \00000AC como ¬). Conclusão gravada aqui: escape seguido de hex é inusável
 *  neste pipeline; quebra de linha antes de dígito vira espaço e texto corrido. */
const comoOPainelEntrega = (css) => css
  .replace(/\\([0-9A-Fa-f]{1,5}) /g, "\\$1")
  .replace(/\\0+([0-9A-Fa-f])/g, "\\$1");

/** O arquivo que se cola no painel, e o teto de tamanho que o painel aceita. */
const CANONICO = "css-nimbus-publicacao-compacta-2026-07-20.css";
const LIMITE = 57500;

/** Sintaxe que o painel derruba (medida) ou que nunca foi testada nele.
 *  Espelho de PROIBIDO em scripts/build_nimbus_publication_css.mjs. */
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
  // Escape em content é inusável no painel (a história está no topo).
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
    if (/#(?:[0-9a-f]{8}|[0-9a-f]{4})(?![0-9a-f])/i.test(m[2])) achados.push(`${m[1]}:${m[2].slice(0, 60)}`);
  }
  return achados;
}

const falhasDeSintaxe = [];
const colado = readFileSync(join(DIR, CANONICO), "utf8");
for (const [nome, re] of PROIBIDO) {
  const m = colado.match(re);
  if (m) {
    const i = Math.max(0, m.index - 40);
    falhasDeSintaxe.push(`${CANONICO}: ${nome}\n     ...${colado.slice(i, m.index + 60).replace(/\s+/g, " ")}...`);
  }
}
for (const h of hexComAlfa(colado)) falhasDeSintaxe.push(`${CANONICO}: hex com alfa\n     ${h}`);
if (colado.trim().length >= LIMITE) {
  falhasDeSintaxe.push(`${CANONICO}: ${colado.trim().length} caracteres, acima do limite de ${LIMITE} do painel`);
}

const chromiumDaNuvem = "/opt/pw-browsers/chromium";
const navegador = await chromium.launch({
  ...(existsSync(chromiumDaNuvem) ? { executablePath: chromiumDaNuvem } : {}),
  args: ["--no-sandbox"],
});
const pagina = await navegador.newPage();

const falhas = [];
let conferidos = 0;

for (const arq of readdirSync(DIR).filter((f) => ARQUIVOS.test(f))) {
  const css = readFileSync(join(DIR, arq), "utf8");
  const strings = [...css.matchAll(/content:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

  for (let i = 0; i < strings.length; i++) {
    const original = strings[i];
    if (!/\\[0-9A-Fa-f]/.test(original)) continue; // sem escape, nada a perder
    const publicado = comoOPainelEntrega(original);

    await pagina.setContent(
      `<meta charset="utf-8"><style>` +
        `#o::after{content:"${original}"}#m::after{content:"${publicado}"}` +
        `</style><i id=o></i><i id=m></i>`,
    );
    const [antes, depois] = await pagina.evaluate(() => [
      getComputedStyle(document.getElementById("o"), "::after").content,
      getComputedStyle(document.getElementById("m"), "::after").content,
    ]);

    conferidos++;
    if (antes !== depois) {
      falhas.push(
        `${arq}, escape #${i}\n     versionado: ${antes}\n     publicado:  ${depois}\n` +
          `     conserto: escape seguido de caractere hexadecimal é INUSÁVEL no painel\n` +
          `     (ele come o espaço delimitador E os zeros à esquerda — \\00000A NÃO resolve).\n` +
          `     Reescreva o content: sem a quebra de linha (frase corrida), ou garanta que\n` +
          `     depois do escape venha caractere NÃO-hexadecimal. Doutrina de 04-05/08 no ESTADO.`,
      );
    }
  }
}

await navegador.close();

console.log(`verifica-css-loja: ${conferidos} escape(s) conferidos nos CSS da loja.`);
for (const f of falhas) console.error(`  ERRO   ${f}`);
console.log(
  `verifica-css-loja: ${PROIBIDO.length + 1} regras de sintaxe conferidas em ${CANONICO} (${colado.trim().length} caracteres).`,
);
for (const f of falhasDeSintaxe) console.error(`  ERRO   ${f}`);

if (falhas.length) {
  console.error(`\n${falhas.length} escape(s) mudam de significado ao serem colados no painel.`);
}
if (falhasDeSintaxe.length) {
  console.error(
    `\n${falhasDeSintaxe.length} trecho(s) que o painel derruba ou que nunca foram testados nele.\n` +
      `Conserte a FONTE (nuvemshop/css-nimbus-*.css) e regenere com\n` +
      `node scripts/build_nimbus_publication_css.mjs; não edite o arquivo compacto à mão.`,
  );
}
if (falhas.length || falhasDeSintaxe.length) process.exit(1);
console.log("Todo escape sobrevive ao minificador do painel e nenhuma sintaxe derrubada foi encontrada.");

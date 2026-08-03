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
const ARQUIVOS = /^css-nimbus-.*-2026-07-(16|17|20)\.css$/;

/** O que o painel faz com o CSS colado: minifica e come o espaço que delimita o
 *  escape. Escape de 6 dígitos não tem espaço, então passa intacto. */
const comoOPainelEntrega = (css) => css.replace(/\\([0-9A-Fa-f]{1,5}) /g, "\\$1");

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
          `     conserto: troque \\A por \\00000A (seis dígitos dispensam o espaço)`,
      );
    }
  }
}

await navegador.close();

console.log(`verifica-css-loja: ${conferidos} escape(s) conferidos nos CSS da loja.`);
for (const f of falhas) console.error(`  ERRO   ${f}`);

if (falhas.length) {
  console.error(`\n${falhas.length} escape(s) mudam de significado ao serem colados no painel.`);
  process.exit(1);
}
console.log("Todo escape sobrevive ao minificador do painel.");

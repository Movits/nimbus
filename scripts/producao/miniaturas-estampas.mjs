#!/usr/bin/env node
/**
 * Gera miniaturas WebP leves de TODAS as estampas de designs/prontos/
 * (NUVEM, RELIQUIA, STREET × costas, peito) para o artefato de triagem
 * do dono (Manter/Remover). Molde: scripts/vitrine/build-media.mjs.
 *
 * - ~720 px de aresta longa, WebP q70, SEM flatten (alpha preservado).
 * - Saída fora dos repositórios (arte privada não entra no público):
 *   primeiro argumento, ou $NIMBUS_MINIATURAS.
 *
 *   node scripts/producao/miniaturas-estampas.mjs <dir-saida>
 */
import { readdirSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ASSETS = process.env.NIMBUS_ASSETS || join(RAIZ, "..", "nimbus-assets");
const PRONTOS = join(ASSETS, "designs", "prontos");
const SAIDA = process.argv[2] || process.env.NIMBUS_MINIATURAS;
if (!SAIDA) { console.error("uso: miniaturas-estampas.mjs <dir-saida>"); process.exit(1); }

const COLECOES = ["NUVEM", "RELIQUIA", "STREET"];
const POSICOES = ["costas", "peito"];
mkdirSync(SAIDA, { recursive: true });

const indice = [];
for (const c of COLECOES) {
  for (const p of POSICOES) {
    const dir = join(PRONTOS, c, p);
    if (!existsSync(dir)) continue;
    for (const arq of readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png"))) {
      const origem = join(dir, arq);
      const nomeMini = `${c}-${p}-${arq.replace(/\.png$/i, "")}.webp`;
      const destino = join(SAIDA, nomeMini);
      const meta = await sharp(origem).metadata();
      await sharp(origem)
        .resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 70 })
        .toFile(destino);
      indice.push({ colecao: c, posicao: p, arquivo: arq, mini: nomeMini, w: meta.width, h: meta.height });
    }
  }
}
writeFileSync(join(SAIDA, "indice.json"), JSON.stringify(indice, null, 1));
console.log(`miniaturas-estampas: ${indice.length} miniaturas em ${SAIDA}`);

// Miniaturas das gravuras de época, derivadas do ORIGINAL do museu que já está
// em public/gravuras/img/ (não precisa do repositório privado).
//
// Por que existe. A grade das gravuras servia o arquivo de 900 a 1000 px de
// largura (314 a 466 KB cada) numa caixa de 170 a 320 px e deixava o navegador
// reduzir. Gravura em metal é feita de hachuras finíssimas: reduzida assim, as
// linhas batem com a grade de pixels e viram moiré, manchas onduladas que
// parecem defeito de imagem. A revisão de 11/11/2026 apontou no rosto do
// Cristo coroado de espinhos. Aqui a redução é feita uma vez, com filtro
// Lanczos, em três larguras; o HTML oferece as três em srcset e o navegador
// pega a mais próxima do tamanho da tela, sem reduzir de novo.
//
// Também APARA o scan na folha da gravura quando o gravuras.json traz
// "recorte": dois scans vêm com moldura (fundo branco em volta do papel, cartão
// de montagem com o número de inventário a lápis) e, lado a lado com os outros
// dois, pareciam arquivo baixado e não um conjunto preparado (revisão de
// 12/11/2026). O recorte vale para as miniaturas e para a "-grande", que é a
// imagem da página de cada gravura; o <slug>.webp fica como veio do museu.
//
// Roda à mão, e a saída vai para o git (como o build-media). O build-paginas
// NÃO gera imagem: o CI regenera as páginas e compara byte a byte, e WebP
// gerado em outra máquina não sai idêntico.
//
// Uso: node scripts/vitrine/build-gravuras-miniaturas.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const IMG = path.join(RAIZ, "public/gravuras/img");
const { gravuras } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "gravuras.json"), "utf-8"));
export const LARGURAS = [320, 480, 640];
// a imagem grande da página da gravura: a folha aparada, na largura do scan (até 1000 px)
const SAIDAS = [...LARGURAS.map((l) => [String(l), l]), ["grande", 1000]];

for (const g of gravuras) {
  const original = path.join(IMG, `${g.slug}.webp`);
  if (!fs.existsSync(original)) throw new Error(`original ausente: ${original}`);
  const m0 = await sharp(original).metadata();
  const [rx, ry, rw, rh] = g.recorte ?? [0, 0, 1, 1];
  const caixa = { left: Math.round(rx * m0.width), top: Math.round(ry * m0.height), width: Math.round(rw * m0.width), height: Math.round(rh * m0.height) };
  for (const [nome, largura] of SAIDAS) {
    const saida = path.join(IMG, `${g.slug}-${nome}.webp`);
    await sharp(original)
      .extract(caixa)
      .resize({ width: largura, kernel: "lanczos3", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(saida);
    const m = await sharp(saida).metadata();
    console.log(`${path.basename(saida)}: ${m.width}x${m.height} ${(fs.statSync(saida).size / 1024).toFixed(0)} KB`);
  }
}

import { pathToFileURL, fileURLToPath } from "node:url";
// Adaptador: le um catalogo de uma PASTA local.
//
// E o caminho padrao numa migracao de fornecedor. Nenhum POD publica tudo que o
// medidor quer, e varios escondem o mockup plano atras de login — medido em
// 25/07 com a YouDraw, onde a loja publica nao tem nenhum mockup plano e o
// catalogo do fornecedor exige sessao autenticada. Entao a forma mais confiavel
// de alimentar o medidor e o dono exportar do painel e largar aqui.
//
// Convencao de pastas, deliberadamente frouxa para nao virar mais um formato
// para alguem errar:
//
//   <raiz>/
//     <tipo-de-peca>/            "Camiseta Premium", "Moletom Canguru", ...
//       <id-do-produto>/
//         arte-costas.png        arte oficial (qualquer nome com "costas"/"back")
//         arte-frente.png        idem para frente
//         mockup-*.png|jpg|webp  mockup plano; tambem detectado por fundo branco
//         foto-*.jpg             foto lifestyle
//         medidas.json           opcional: { "back": {"w":31,"h":40}, ... }
//
// O que nao existir simplesmente falta, e o medidor degrada de forma declarada.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { whiteBorderFraction, classifyImage } from "./schema.mjs";

const IMG = /\.(png|jpe?g|webp)$/i;
const ehArte = (f) => /(arte|art|print|estampa)/i.test(f) && IMG.test(f);
const vista = (f) => (/(costas|back|verso)/i.test(f) ? "back" : /(frente|front|peito|chest)/i.test(f) ? "front" : null);

async function classificar(arquivo) {
  const r = await sharp(arquivo).resize(180, 180, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const frac = whiteBorderFraction({
    data: r.data, width: r.info.width, height: r.info.height, channels: r.info.channels,
  });
  return { whiteBorder: +frac.toFixed(3), kind: classifyImage(frac) };
}

/**
 * @param {string} raiz
 * @returns {Promise<import("./schema.mjs").ProviderCatalog>}
 */
export async function readFolder(raiz, { provider = "pasta" } = {}) {
  const products = [];
  for (const garment of fs.readdirSync(raiz, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const dirPeca = path.join(raiz, garment.name);
    for (const prod of fs.readdirSync(dirPeca, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const dir = path.join(dirPeca, prod.name);
      const arquivos = fs.readdirSync(dir);
      const art = {};
      for (const f of arquivos.filter(ehArte)) {
        const v = vista(f);
        if (v) art[v] = path.join(dir, f);
        else if (!art.back) art.back = path.join(dir, f); // sem indicacao: costas e o caso comum
      }
      let artSize_cm;
      const medidas = arquivos.find((f) => /^medidas\.json$/i.test(f));
      if (medidas) {
        try { artSize_cm = JSON.parse(fs.readFileSync(path.join(dir, medidas), "utf8")); } catch { /* segue sem */ }
      }
      const images = [];
      for (const f of arquivos.filter((x) => IMG.test(x) && !ehArte(x))) {
        const full = path.join(dir, f);
        try {
          const c = await classificar(full);
          // O nome do arquivo e uma DICA, nao a decisao: a medida de borda
          // branca decide. Nome de arquivo mente, pixel nao.
          images.push({ url: full, kind: c.kind, whiteBorder: c.whiteBorder, nome: f });
        } catch { /* arquivo ilegivel nao derruba o produto */ }
      }
      products.push({ id: prod.name, title: prod.name, garment: garment.name, art, artSize_cm, images });
    }
  }
  return { provider, fetchedAt: new Date().toISOString(), products };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const raiz = process.argv[2];
  if (!raiz) {
    console.error("uso: node scripts/geometry/provider/from-folder.mjs <pasta> [--out catalogo.json]");
    process.exit(2);
  }
  const cat = await readFolder(raiz);
  const i = process.argv.indexOf("--out");
  if (i > -1) fs.writeFileSync(process.argv[i + 1], `${JSON.stringify(cat, null, 1)}\n`);
  const planos = cat.products.filter((p) => p.images.some((im) => im.kind === "flat-mockup")).length;
  console.log(`produtos: ${cat.products.length} | com mockup plano: ${planos} | com arte: ${cat.products.filter((p) => p.art?.back || p.art?.front).length}`);
}

// DPI real de cada arte no tamanho em que ela imprime.
//
// Percorre as receitas consolidadas, pega o MAIOR tamanho de impressao usado
// por arte (pior caso) e calcula DPI = px / (cm / 2.54), reportando o menor
// dos dois eixos. Referencia de POD: 300 DPI recomendado; a IzzyPrint imprime
// no maximo 30x40 cm (3543x4724 px a 300 DPI).
import fs from "node:fs";

function dims(p) {
  const b = fs.readFileSync(p);
  if (b.toString("ascii", 12, 16) === "IHDR")
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

const receitas = JSON.parse(fs.readFileSync("nuvemshop/producao/receitas.json", "utf8"));
const artes = new Map();
for (const r of Object.values(receitas)) {
  if (!r.arte || !r.arte_cm) continue;
  const arte = r.arte.replace(/\\/g, "/");
  const [w, h] = r.arte_cm.split("x").map(Number);
  const atual = artes.get(arte);
  if (!atual || w * h > atual.w * atual.h) artes.set(arte, { w, h });
}

const itens = [];
for (const [arte, cm] of artes) {
  if (!fs.existsSync(arte)) { itens.push({ arte, erro: "nao encontrada" }); continue; }
  const d = dims(arte);
  if (!d) { itens.push({ arte, erro: "formato nao lido" }); continue; }
  const dpi = Math.min(d.w / (cm.w / 2.54), d.h / (cm.h / 2.54));
  itens.push({ arte, cm: `${cm.w}x${cm.h}`, px: `${d.w}x${d.h}`, dpi: Math.round(dpi) });
}

const ok = itens.filter((i) => i.dpi >= 300).length;
const meio = itens.filter((i) => i.dpi >= 240 && i.dpi < 300).length;
const ruim = itens.filter((i) => i.dpi < 240).length;
console.log(`artes: ${itens.length} | >=300 DPI: ${ok} | 240-299: ${meio} | <240: ${ruim}`);
console.log("\nDa pior para a melhor:");
for (const i of itens.filter((x) => x.dpi).sort((a, b) => a.dpi - b.dpi))
  console.log(`  ${String(i.dpi).padStart(3)} DPI  ${i.px.padEnd(10)} ${i.cm.padEnd(10)} ${i.arte.split("/").pop()}`);

fs.writeFileSync("nuvemshop/auditoria/2026-07-28-dpi-artes.json", JSON.stringify({ gerado_em: new Date().toISOString(), itens }, null, 1));
console.log("\nRelatorio: nuvemshop/auditoria/2026-07-28-dpi-artes.json");

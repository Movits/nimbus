// QUANTO O CAPUZ COBRE DA ESTAMPA, em cada Moletom Canguru ja produzido.
//
// O placement oficial e medido no MOCKUP PLANO, onde o capuz esta deitado
// ACIMA da costura da gola. Numa peca VESTIDA o capuz cai e ocupa alguns
// centimetros ABAIXO dessa costura, entao ele invade o topo da estampa. Isso
// e propriedade do produto real, nao defeito da foto — mas precisa ser
// medido, porque a diferenca entre "cobre uma margem" e "cobre a coroa" e a
// diferenca entre entregar e escalar para o dono.
//
// Medida: a mascara da oclusao (pixels onde o `-semcapuz` tinha tinta e o
// final voltou a ser igual ao blank) contra o total de pixels de tinta.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const D = "nuvemshop/assets/producao-capas";

const cru = (p) => sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });

const linhas = [];
for (const d of fs.readdirSync(D)) {
  const dir = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/-semcapuz\.png$/.test(f)) continue;
    const final = path.join(dir, f.replace("-semcapuz.png", ".png"));
    if (!fs.existsSync(final)) continue;
    const cor = f.replace(`${d}-`, "").replace(/-v\d+-semcapuz\.png$/, "");
    const blank = path.join(dir, `${d}-${cor}-blank.png`);
    if (!fs.existsSync(blank)) { linhas.push({ id: d, cor, erro: "sem blank" }); continue; }
    try {
      const [b, sc, fi] = await Promise.all([cru(blank), cru(path.join(dir, f)), cru(final)]);
      const { width: W, height: H } = b.info;
      const dif = (x, y, i) => Math.abs(x.data[i] - y.data[i]) + Math.abs(x.data[i + 1] - y.data[i + 1]) + Math.abs(x.data[i + 2] - y.data[i + 2]);
      let tinta = 0, coberto = 0, topoTinta = H, topoCoberto = H, baseCoberto = -1;
      for (let p = 0; p < W * H; p += 1) {
        const i = p * 3;
        if (dif(sc, b, i) <= 24) continue;
        tinta += 1;
        const y = Math.floor(p / W);
        if (y < topoTinta) topoTinta = y;
        if (dif(fi, b, i) < 10) {
          coberto += 1;
          if (y < topoCoberto) topoCoberto = y;
          if (y > baseCoberto) baseCoberto = y;
        }
      }
      linhas.push({
        id: d, cor, arquivo: path.basename(final),
        pct_coberto: +((100 * coberto) / Math.max(1, tinta)).toFixed(1),
        faixa_coberta_pct: baseCoberto >= 0 ? `${(100 * topoCoberto / H).toFixed(1)}–${(100 * baseCoberto / H).toFixed(1)}` : "-",
        topo_tinta_pct: +((100 * topoTinta) / H).toFixed(1),
      });
    } catch (e) { linhas.push({ id: d, cor, erro: e.message.slice(0, 50) }); }
  }
}

linhas.sort((a, b) => (b.pct_coberto ?? -1) - (a.pct_coberto ?? -1));
console.log("produto     cor        % da tinta coberta pelo capuz   faixa coberta (y%)   topo da tinta");
for (const l of linhas) {
  const flag = l.pct_coberto >= 15 ? "  <-- COBRE MUITO" : l.pct_coberto >= 5 ? "  (margem larga)" : "";
  console.log(`${l.id}  ${String(l.cor).padEnd(10)} ${String(l.pct_coberto ?? l.erro).padStart(8)}%${" ".repeat(18)}${String(l.faixa_coberta_pct ?? "-").padStart(12)}   ${String(l.topo_tinta_pct ?? "-").padStart(6)}%${flag}`);
}
const graves = linhas.filter((l) => l.pct_coberto >= 15);
console.log(`\ntotal ${linhas.length} capas com capuz | cobrindo 15% ou mais da tinta: ${graves.length}`);

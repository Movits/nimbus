// Recria as capas da fila pelo metodo IA aprovado (28/07):
// 3 refs (arte + blank + mockup registrado), 3 candidatas, auditoria por
// registro, rodada de correcao dirigida quando a auditoria acusa, selecao
// landmark-primeiro (estabilidade do centro entre candidatas) + escala.
//
// Resumivel: pula o que ja tem candidatas/veredito. Estado em
// nuvemshop/producao/recriacao-2026-07-28.json (por variante).
//
// Uso: node scripts/producao/recriar-fila-ia.mjs [--so <id-cor>] [--max N]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { gen } from "../gemini/generate.mjs";
import { registerArt } from "../geometry/register-art.mjs";
import { getGarmentSpec } from "../geometry/garment-specs.mjs";

const N = process.cwd();
const OUT = "nuvemshop/assets/producao-capas/_RECRIACAO";
const ESTADO = "nuvemshop/producao/recriacao-2026-07-28.json";
const REFS = "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references";
const fila = JSON.parse(fs.readFileSync("/tmp/fila-total.json", "utf8")).filter((f) => f.metodo === "ia");

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i === -1 ? d : process.argv[i + 1]; };
const so = arg("--so"); const max = Number(arg("--max", "999"));
const norm = (c) => c.toLowerCase().replace(/-/g, "");

const PROMPT = `The first image is the artwork. The second image is a person wearing the blank garment, with no print. The third image is the official product photo, showing the real print on the back of this same garment.

Add the print to the person's garment in the second image. Use the artwork from the first image, at the same size and the same position on the garment as shown in the third image. Keep the person, pose, folds, lighting and background of the second image exactly as they are. The garment keeps the color it has in the second image.

Reproduce the lettering and every line of the artwork exactly as drawn, without redrawing or thickening them.`;
const CORR_MENOR = "\n\nImportant: make the print clearly smaller than your instinct and place it exactly as in the third image (the product photo).";
const CORR_BAIXO = "\n\nImportant: place the print lower on the back, exactly as in the third image (the product photo).";

const estado = fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, "utf8")) : {};
fs.mkdirSync(OUT, { recursive: true });
const salvar = () => fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 1));

const raw = async (p, m = 900) => {
  const r = await sharp(p).resize(m, m, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: r.data, width: r.info.width, height: r.info.height, channels: 3 };
};

async function auditar(f, rec, arteRaw, G) {
  const [, ahCm] = String(rec.arte_cm).split("x").map(Number);
  const cena = await raw(f);
  const reg = registerArt(cena, arteRaw, { scaleRange: [0.10, 0.75] });
  if (!reg) return { erro: "sem registro" };
  const golaPx = rec.gola * cena.height;
  const pecaPx = (rec.barra - rec.gola) * cena.height;
  const pxCm = pecaPx / G;
  return {
    score: +reg.score.toFixed(3),
    escala: +(((reg.height_px / pecaPx) / (ahCm / G) - 1) * 100).toFixed(1),
    dV: +(((reg.cy - reg.height_px / 2 - golaPx) / pxCm) - rec.placement).toFixed(2),
    cf: +(reg.cx / cena.width).toFixed(3),
  };
}

let feitos = 0;
for (const item of fila) {
  const chave = `${item.id}-${norm(item.cor)}`;
  if (so && chave !== so) continue;
  if (feitos >= max) break;
  const st = estado[chave] ?? (estado[chave] = { fase: "inicio" });
  if (st.fase === "pronto" || st.fase === "impossivel") continue;
  feitos += 1;

  const rec = JSON.parse(fs.readFileSync(`nuvemshop/assets/producao-capas/${item.id}/${item.rec}`, "utf8"));
  const foto = String(rec.foto).replace(/\\/g, "/");
  if (!fs.existsSync(foto)) { st.fase = "impossivel"; st.motivo = "blank ausente: " + foto; salvar(); continue; }
  const refDir = fs.readdirSync(REFS).find((d) => d.startsWith(item.id + "-"));
  if (!refDir) { st.fase = "impossivel"; st.motivo = "sem pasta de mockup"; salvar(); continue; }
  const mockSrc = path.join(REFS, refDir, item.mockup);
  const mockPng = path.join(OUT, `${chave}-mockup.png`);
  if (!fs.existsSync(mockPng)) await sharp(mockSrc).png().toFile(mockPng);
  const spec = getGarmentSpec(rec.peca);
  // Blusao nao tem tabela YouDraw: 78,4 cm estimado (docs/verdades/medidas-pecas.md, ressalva registrada)
  const ESTIMADAS = { "Blusão Moletom": 78.4 };
  const G = (spec.hasTable ? spec.sizes.find((s) => s.size === "G")?.length_cm : null) ?? ESTIMADAS[rec.peca];
  if (!G) { st.fase = "impossivel"; st.motivo = "sem tabela da peca"; salvar(); continue; }
  const arteRaw = await raw(rec.arte, 420);

  // rodada 1 (candidatas 1-3), correcao (4-6) se precisar
  const rodada = async (ns, extra) => {
    for (const n of ns) {
      const prefix = `${chave}-c${n}`;
      if (fs.existsSync(path.join(OUT, `${prefix}-01.png`))) continue;
      const r = await gen({ model: "gemini-3.1-flash-image", prompt: PROMPT + (extra || ""), refs: [rec.arte, foto, mockPng], outDir: OUT, prefix, n: 1 });
      if (!r[0]?.ok) console.log(chave, "gen falhou:", (r[0]?.error || "?").slice(0, 90));
      await new Promise((x) => setTimeout(x, 800));
    }
    const auds = [];
    for (const n of ns) {
      const f = path.join(OUT, `${chave}-c${n}-01.png`);
      if (!fs.existsSync(f)) continue;
      auds.push({ n, ...(await auditar(f, rec, arteRaw, G)) });
    }
    return auds;
  };

  st.auditorias = st.auditorias ?? [];
  if (st.fase === "inicio") {
    st.auditorias = await rodada([1, 2, 3]);
    st.fase = "rodada1";
    salvar();
  }
  let ok = st.auditorias.filter((a) => !a.erro && Math.abs(a.escala) <= 7 && Math.abs(a.dV) <= 1.6);
  if (!ok.length && st.fase === "rodada1") {
    const mediaEscala = st.auditorias.filter((a) => !a.erro).reduce((s, a) => s + a.escala, 0) / Math.max(1, st.auditorias.filter((a) => !a.erro).length);
    const mediaDv = st.auditorias.filter((a) => !a.erro).reduce((s, a) => s + a.dV, 0) / Math.max(1, st.auditorias.filter((a) => !a.erro).length);
    const extra = (mediaEscala > 7 ? CORR_MENOR : "") + (mediaDv < -1.6 ? CORR_BAIXO : "");
    st.auditorias.push(...await rodada([4, 5, 6], extra || CORR_MENOR));
    st.fase = "rodada2";
    salvar();
    ok = st.auditorias.filter((a) => !a.erro && Math.abs(a.escala) <= 7 && Math.abs(a.dV) <= 1.6);
  }
  if (!ok.length) {
    // sem candidata dentro da toleran­cia: registra a melhor por |escala|+|dV| e marca revisar
    const v = st.auditorias.filter((a) => !a.erro).sort((a, b) => (Math.abs(a.escala) + Math.abs(a.dV) * 4) - (Math.abs(b.escala) + Math.abs(b.dV) * 4));
    st.escolhida = v[0]?.n ?? null;
    st.fase = st.escolhida ? "revisar" : "impossivel";
    if (!st.escolhida) st.motivo = "nenhum registro valido";
    salvar();
    console.log(chave, "-> REVISAR", JSON.stringify(v[0] ?? {}));
    continue;
  }
  // selecao landmark-primeiro: centro mais proximo da MEDIANA dos centros
  // (a IA e estavel no meridiano; o outlier de posicao e o suspeito), depois |escala|
  const cfs = st.auditorias.filter((a) => !a.erro).map((a) => a.cf).sort((a, b) => a - b);
  const mediana = cfs[Math.floor(cfs.length / 2)];
  ok.sort((a, b) => (Math.abs(a.cf - mediana) * 100 + Math.abs(a.escala) * 0.3) - (Math.abs(b.cf - mediana) * 100 + Math.abs(b.escala) * 0.3));
  st.escolhida = ok[0].n;
  st.resultado = ok[0];
  st.fase = "pronto";
  salvar();
  console.log(chave, "-> PRONTO c" + st.escolhida, JSON.stringify(ok[0]));
}
console.log("fim; estado em", ESTADO);

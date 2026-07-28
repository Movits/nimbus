// Recria as capas de Moletom Canguru (capuz) pela via geometrica aprovada:
// 1) IA-agrimensor: 1 candidata Nano Banana por blank SO para medir
//    - o meridiano do corpo (centro da estampa que a IA escolhe; validado
//      contra a regra do rosto em todos os casos medidos), e
//    - a fronteira do capuz (o topo da estampa da IA = ate onde o capuz cobre;
//      a IA nunca pinta sob o capuz).
// 2) estimar-yaw com o meridiano -> yaw da receita.
// 3) Poligono de oclusao padrao ancorado no bico do capuz medido.
// 4) produce-cover compor com a receita + yaw + oclusao (tecido 180/8, arte pura).
// 5) qa-capa; resultado para revisao visual e aprovacao do dono.
//
// Uso: node scripts/producao/recriar-fila-moletom.mjs [--so <id-cor>] [--max N]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { gen } from "../gemini/generate.mjs";
import { registerArt } from "../geometry/register-art.mjs";
import { getGarmentSpec } from "../geometry/garment-specs.mjs";

const OUT = "nuvemshop/assets/producao-capas/_RECRIACAO";
const ESTADO = "nuvemshop/producao/recriacao-moletom-2026-07-28.json";
const REFS = "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references";
const fila = JSON.parse(fs.readFileSync("/tmp/fila-total.json", "utf8")).filter((f) => f.metodo === "geometrica");
const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i === -1 ? d : process.argv[i + 1]; };
const so = arg("--so"); const max = Number(arg("--max", "999"));
const norm = (c) => c.toLowerCase().replace(/-/g, "");
const estado = fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, "utf8")) : {};
const salvar = () => fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 1));
fs.mkdirSync(OUT, { recursive: true });

const PROMPT = `The first image is the artwork. The second image is a person wearing the blank garment, with no print. The third image is the official product photo, showing the real print on the back of this same garment.

Add the print to the person's garment in the second image. Use the artwork from the first image, at the same size and the same position on the garment as shown in the third image. Keep the person, pose, folds, lighting and background of the second image exactly as they are. The garment keeps the color it has in the second image.`;

const raw = async (p, m = 900) => {
  const r = await sharp(p).resize(m, m, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: r.data, width: r.info.width, height: r.info.height, channels: 3 };
};

let feitos = 0;
for (const item of fila) {
  const chave = `${item.id}-${norm(item.cor)}`;
  if (so && chave !== so) continue;
  if (feitos >= max) break;
  const st = estado[chave] ?? (estado[chave] = { fase: "inicio" });
  if (st.fase === "composta" || st.fase === "impossivel") continue;
  feitos += 1;

  const rec = JSON.parse(fs.readFileSync(`nuvemshop/assets/producao-capas/${item.id}/${item.rec}`, "utf8"));
  const foto = String(rec.foto).replace(/\\/g, "/");
  const refDir = fs.readdirSync(REFS).find((d) => d.startsWith(item.id + "-"));
  const mockPng = path.join(OUT, `${chave}-mockup.png`);
  if (!fs.existsSync(mockPng)) await sharp(path.join(REFS, refDir, item.mockup)).png().toFile(mockPng);

  // 1) agrimensor
  const agrPng = path.join(OUT, `${chave}-agr-01.png`);
  if (!fs.existsSync(agrPng)) {
    const r = await gen({ model: "gemini-3.1-flash-image", prompt: PROMPT, refs: [rec.arte, foto, mockPng], outDir: OUT, prefix: `${chave}-agr`, n: 1 });
    if (!r[0]?.ok) { console.log(chave, "agrimensor falhou:", (r[0]?.error || "").slice(0, 90)); continue; }
    await new Promise((x) => setTimeout(x, 800));
  }
  const spec = getGarmentSpec(rec.peca);
  const G = spec.hasTable ? spec.sizes.find((s) => s.size === "G")?.length_cm : 65;
  const cena = await raw(agrPng);
  const arteRaw = await raw(rec.arte, 420);
  const reg = registerArt(cena, arteRaw, { scaleRange: [0.10, 0.75] });
  if (!reg) { st.fase = "revisar"; st.motivo = "agrimensor sem registro"; salvar(); continue; }
  const cf = reg.cx / cena.width;
  const topoFrac = (reg.cy - reg.height_px / 2) / cena.height;   // fronteira do capuz
  st.agrimensor = { cf: +cf.toFixed(3), topoFrac: +topoFrac.toFixed(3), score: +reg.score.toFixed(3) };

  // 2) yaw via estimar-yaw (meridiano = cf)
  const recTmp = `/tmp/rec-${chave}.json`;
  fs.writeFileSync(recTmp, JSON.stringify(rec));
  const yawOut = JSON.parse(execFileSync("node", ["scripts/geometry/estimar-yaw.mjs", "--receita", recTmp, "--costura-x", String(cf)], { encoding: "utf8" }));
  const yaw = yawOut.yaw_medido;
  st.yaw = yaw;

  // 3) poligono de oclusao ancorado no bico (so se a arte alcanca o capuz)
  const artTopFrac = rec.gola + (rec.placement / G) * (rec.barra - rec.gola);
  let oclusao = null;
  if (artTopFrac < topoFrac + 0.01) {
    const tipX = cf, tipY = Math.min(0.45, topoFrac);
    oclusao = [
      [tipX - 0.14, 0.14], [tipX + 0.14, 0.14], [tipX + 0.17, 0.22],
      [tipX + 0.12, tipY - 0.02], [tipX + 0.04, tipY], [tipX, tipY + 0.005],
      [tipX - 0.05, tipY - 0.01], [tipX - 0.11, tipY - 0.05], [tipX - 0.16, 0.24],
    ].map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ");
  }
  st.oclusao = !!oclusao;

  // 4) compor
  const vAtual = Number((item.rec.match(/-v(\d+)\.receita/) || [0, 0])[1]);
  const saida = `nuvemshop/assets/producao-capas/${item.id}/${item.id}-${norm(item.cor)}-v${vAtual + 1}-recriada.png`;
  const args = ["scripts/produce-cover.mjs", "compor", "--produto", item.id,
    "--foto", foto, "--arte", rec.arte, "--arte-cm", rec.arte_cm, "--peca", rec.peca,
    "--gola", String(rec.gola), "--barra", String(rec.barra), "--centro", String(rec.centro ?? 0.5),
    "--torso", String(rec.torso ?? 0.35), "--yaw", String(yaw), "--placement", String(rec.placement),
    "--opacidade", "0.93", "--sombra-min", "0.6", "--sombra-max", "1.35", "--relevo", "8",
    "--sombra-tecido", "0.9", "--sombra-global", "1", "--dobra-larga", "180", "--ss", "2", "--out", saida];
  if (oclusao) args.push("--oclusao", oclusao);
  execFileSync("node", args, { stdio: "ignore" });
  st.saida = saida;
  st.fase = "composta";
  salvar();
  console.log(chave, "-> COMPOSTA", JSON.stringify({ yaw, cf: st.agrimensor.cf, topo: st.agrimensor.topoFrac, oclusao: st.oclusao }));
}
console.log("fim; estado em", ESTADO);

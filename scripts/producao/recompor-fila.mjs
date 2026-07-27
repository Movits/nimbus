// EXECUTOR DA FILA DE RECOMPOSICAO — receita fechada de 27/07.
//
// Para cada variante da fila: compoe com placement registrado, tecido
// dobra 180 / relevo 8 / sombra-global 1, yaw resolvido da costura quando
// houver leitura (ajustes-fila.json), e roda gate + compressao. O relatorio e
// gravado incrementalmente para a passada visual (Pass B) marcar o que
// recompor com yaw medido.
//
// Oclusao: procura poligono em QUALQUER receita do mesmo blank — o poligono e
// propriedade da foto, e ficou guardado em receitas-irma (piloto/par).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";
import { artMesh } from "../geometry/render.mjs";

const D = "nuvemshop/assets/producao-capas";
const { fila } = JSON.parse(fs.readFileSync("nuvemshop/producao/fila-recomposicao.json", "utf8"));
const ajustes = fs.existsSync("nuvemshop/producao/ajustes-fila.json")
  ? JSON.parse(fs.readFileSync("nuvemshop/producao/ajustes-fila.json", "utf8")) : {};
const placemGar = new Map(JSON.parse(fs.readFileSync("nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json", "utf8")).itens.map((i) => [i.product_id, i.garment]));

// oclusoes por blank
const oclusaoPorBlank = new Map();
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    if (!/\.receita\.json$/.test(f)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(p, f), "utf8"));
    if (r.oclusao) oclusaoPorBlank.set(String(r.foto).replace(/\\/g, "/"), r.oclusao);
  }
}

function proximaVersao(id, cor) {
  const dir = path.join(D, id);
  let v = 0;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(new RegExp(`^${id}-${cor}(?:-[a-z]+)*-v(\\d+)`));
    if (m) v = Math.max(v, Number(m[1]));
  }
  return v + 1;
}

async function resolverYaw(item, costuraX) {
  const meta = await sharp(item.blank).metadata();
  const [aw, ah] = item.arte_cm.split("x").map(Number);
  const merid = (yaw) => {
    const plano = planejar({ golaFrac: item.gola, barraFrac: item.barra, centroFrac: item.centro ?? 0.5,
      imgW: meta.width, imgH: meta.height, artW_cm: aw, artH_cm: ah, peca: item.peca,
      torsoFrac: item.torso ?? null, yawDeg: yaw, placementCm: item.placement });
    const { cols, rows, pts } = artMesh(plano.params);
    const i = Math.floor(cols / 2); const xs = [];
    for (let j = 0; j < rows; j += 1) { const q = pts[j * cols + i]; if (q) xs.push(q[0]); }
    return xs.reduce((s, v2) => s + v2, 0) / xs.length;
  };
  const alvo = costuraX * meta.width;
  let melhor = { yaw: 0, erro: Infinity };
  for (let y = -40; y <= 40; y += 0.25) { const e = Math.abs(merid(y) - alvo); if (e < melhor.erro) melhor = { yaw: y, erro: e }; }
  return melhor.yaw;
}

const REL = "nuvemshop/producao/relatorio-recomposicao.json";
const rel = fs.existsSync(REL) ? JSON.parse(fs.readFileSync(REL, "utf8")) : {};
const run = (args) => { try { return execFileSync("node", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); } catch (e) { const s = String(e.stdout ?? ""); if (s.trim().startsWith("{")) return s; throw e; } };

for (const item0 of fila) {
  const k = `${item0.id}|${item0.cor}`;
  const aj = ajustes[k] ?? {};
  const item = { ...item0, ...aj };
  if (placemGar.get(item.id) && placemGar.get(item.id) !== item.peca) item.peca = placemGar.get(item.id);
  if (rel[k]?.ok && !aj.refazer) continue;
  const t0 = Date.now();
  try {
    let yaw = aj.yaw ?? 0;
    if (aj.costura_x != null) yaw = await resolverYaw(item, aj.costura_x);
    const oclusao = aj.oclusao ?? item.oclusao ?? oclusaoPorBlank.get(item.blank) ?? null;
    const v = proximaVersao(item.id, item.cor);
    const out = path.join(D, item.id, `${item.id}-${item.cor}-v${v}.png`);
    const args = ["scripts/produce-cover.mjs", "compor", "--produto", item.id, "--peca", item.peca,
      "--foto", item.blank, "--arte", item.arte, "--arte-cm", item.arte_cm,
      "--gola", String(item.gola), "--barra", String(item.barra), "--centro", String(item.centro ?? 0.5),
      "--placement", String(item.placement), "--yaw", String(yaw),
      "--relevo", "8", "--dobra-larga", "180", "--sombra-global", "1",
      "--opacidade", "0.93", "--sombra-min", "0.6", "--sombra-max", "1.35", "--sombra-tecido", "0.9",
      "--out", out];
    if (item.torso) args.push("--torso", String(item.torso));
    if (oclusao) args.push("--oclusao", oclusao);
    const comp = JSON.parse(run(args));
    const arco = comp.alvo?.arco_meio_rad;
    const qargs = ["scripts/geometry/qa-capa.mjs", "--blank", item.blank, "--composta", out,
      "--arte", item.arte, "--arte-cm", item.arte_cm, "--peca", item.peca,
      "--gola", String(item.gola), "--barra", String(item.barra), "--placement", String(item.placement)];
    if (arco) qargs.push("--arco", String(arco));
    if (yaw) qargs.push("--yaw", String(yaw));
    const qa = JSON.parse(run(qargs));
    let compr = null;
    try {
      compr = JSON.parse(run(["scripts/geometry/compressao-malha.mjs", "--receita", out.replace(/\.png$/, ".receita.json")]));
    } catch { /* pecas estimadas podem falhar */ }
    rel[k] = { ok: true, out: path.basename(out), yaw, oclusao: Boolean(oclusao),
      gate: qa.veredito, falhas: qa.falhas, alertas: qa.alertas,
      escala_pct: qa.checks.escala?.desvio_pct, posicao_cm: qa.checks.posicao?.erro_cm,
      compressao: compr ? `${compr.compressao_medida_pct}/${compr.compressao_esperada_tabela_pct}` : null,
      chapada: compr?.chapada ?? null, releitura: item0.precisa_releitura.length > 0,
      s: Math.round((Date.now() - t0) / 1000) };
  } catch (e) {
    rel[k] = { ok: false, erro: String(e.message ?? e).split("\n")[0].slice(0, 200) };
  }
  fs.writeFileSync(REL, JSON.stringify(rel, null, 1));
  console.log(`${k} ${rel[k].ok ? rel[k].gate : "ERRO"} yaw=${rel[k].yaw ?? "-"} ${rel[k].s ?? ""}s`);
}
const vals = Object.values(rel);
console.log(`\nfeitas ${vals.filter((r) => r.ok).length} | erro ${vals.filter((r) => !r.ok).length} | reprovadas ${vals.filter((r) => r.gate === "REPROVADO").length}`);

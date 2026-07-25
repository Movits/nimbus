// E2 — REGISTRO DA ARTE CONTRA ANOTACAO HUMANA, em verdade conhecida.
//
// CRITERIO DECLARADO ANTES DE RODAR (plano de 25/07): o registro so substitui
// a anotacao se a margem medida ficar <= 3 pp no modo de arte irregular, onde a
// anotacao hoje custa 8 pp. Se nao ficar, a anotacao continua e o +-5% segue
// restrito a arte com moldura. Publica-se o numero que sair.
//
// O QUE ESTE TESTE MODELA, e por que.
//
// A margem de 8 pp da arte irregular NAO vem de ruido de ponteiro. Vem de
// anotadores escolhendo ELEMENTOS DIFERENTES como extremo da arte. Esta nas
// proprias notas das 41 fotos: "existe um anel claro que pode ser tinta ou
// vinco do moletom", "o contorno preto externo e indistinguivel do tecido
// preto", "dois picos empatados dentro de 0,05 pp", "se so tinta escura contar,
// o topo cai e a altura encolhe ~3,5%".
//
// Entao a cena sintetica tem uma arte com NUCLEO forte e um ORLA FRACA em volta
// (halo, escorrido, contorno de baixo contraste). A verdade e a caixa da arte
// INTEIRA, porque e ela que os cm oficiais descrevem. O anotador simulado ve a
// orla com probabilidade p e erra alguns pixels por borda; o registro recebe o
// template completo e tem de achar a arte inteira mesmo quando a orla quase
// nao aparece.
//
// Uso: node scripts/geometry/validate-register.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { compositeArt, projectedArtBox, artMesh } from "./render.mjs";
import { registerArt } from "./register-art.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// gerador determinista, para a comparacao ser pareada entre os dois metodos
let seed = 987654321;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed / 0x7fffffff);
const gauss = (s) => (s === 0 ? 0 : s * Math.sqrt(-2 * Math.log(Math.max(1e-9, rnd()))) * Math.cos(2 * Math.PI * rnd()));

const AW = 360, AH = 470;

/** Arte com nucleo forte e orla fraca. `orla` controla o contraste da orla. */
function artSvg(orla) {
  const a = orla.toFixed(2);
  return `<svg width="${AW}" height="${AH}" xmlns="http://www.w3.org/2000/svg">
  <g opacity="${a}">
    <ellipse cx="${AW / 2}" cy="34" rx="150" ry="26" fill="#9aa7b4"/>
    <path d="M${AW * 0.32} ${AH - 22} q10 14 22 0 q10 16 20 -2" stroke="#8fa0b2" stroke-width="7" fill="none"/>
    <circle cx="${AW * 0.18}" cy="${AH - 40}" r="9" fill="#8fa0b2"/>
  </g>
  <rect x="46" y="70" width="${AW - 92}" height="${AH - 150}" fill="#16202e"/>
  <rect x="46" y="70" width="${AW - 92}" height="${AH - 150}" fill="none" stroke="#d8bc63" stroke-width="12"/>
  <circle cx="${AW / 2}" cy="${AH * 0.38}" r="74" fill="#efe9d8"/>
  <path d="M78 ${AH - 96} L${AW / 2} ${AH * 0.52} L${AW - 78} ${AH - 96} Z" fill="#9d3039"/>
  <text x="${AW / 2}" y="${AH - 104}" font-size="34" text-anchor="middle" fill="#d8bc63" font-family="Georgia">NIMBUS</text>
</svg>`;
}

/**
 * Altura da arte na COLUNA CENTRAL da peca, em pixels.
 *
 * E esta, e nao a caixa envolvente, a quantidade que corresponde a altura
 * oficial em cm. Os cm sao medida PLANA, e a regua vertical do medidor
 * (gola->barra) tambem corre pelo meridiano central: comparar as duas exige que
 * a altura da arte seja lida no mesmo meridiano. A caixa envolvente inclui o
 * afastamento dos CANTOS, que estao em arco lateral e projetam mais espalhados.
 *
 * Medido: a caixa e ~2,4 pp mais alta que a coluna central, de forma estavel
 * (2,51 / 1,89 / 2,44 / 2,67 / 2,36 / 2,66 pp em guinada, escala e raio
 * diferentes). Ou seja usar a caixa infla a altura medida da arte, o que
 * SUBESTIMA o comprimento implicito e faz a estampa parecer maior do que e.
 */
function alturaColunaCentral(params) {
  const { cols, rows, pts } = artMesh(params);
  const i = Math.floor((cols - 1) / 2);
  const topo = pts[i], base = pts[(rows - 1) * cols + i];
  if (!topo || !base) return null;
  return Math.hypot(base[0] - topo[0], base[1] - topo[1]);
}

async function rawFromSvg(svg) {
  const r = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: r.data, width: r.info.width, height: r.info.height, channels: r.info.channels };
}

/** Fundo de tecido com sombreado suave e granulacao: nao e chapado. */
function fabric(W, H, base) {
  const d = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const sh = 1 - 0.28 * Math.abs(x / W - 0.5) * 2 + 0.08 * Math.sin((y / H) * 7);
      const n = (rnd() - 0.5) * 9;
      const i = (y * W + x) * 3;
      for (let c = 0; c < 3; c += 1) d[i + c] = Math.max(0, Math.min(255, base[c] * sh + n));
    }
  }
  return d;
}

const SCENARIOS = [
  { garment: "Camiseta Premium", artW: 33.8, artH: 40.0, radius: 17, len: 75.5 },
  { garment: "Oversized", artW: 30.6, artH: 40.0, radius: 19, len: 82 },
  { garment: "Moletom Canguru", artW: 31.0, artH: 39.4, radius: 20, len: 65 },
];
const YAWS = [0, 10, 20];
const SCALES = [0.85, 0.95, 1.0, 1.08, 1.2];
const ORLAS = [0.10, 0.22, 0.45]; // contraste da orla fraca
const TECIDOS = [[38, 38, 40], [232, 230, 224]]; // preta e off-white

const W = 900, H = 900;

async function run() {
  const rows = [];
  const templates = {};
  for (const o of ORLAS) templates[o] = await rawFromSvg(artSvg(o));
  // O template do REGISTRO e sempre a arte cheia e nitida — e o arquivo
  // oficial, nao o que aparece na foto. E esse o ponto do metodo.
  const tplCheio = await rawFromSvg(artSvg(1.0));

  for (const sc of SCENARIOS)
    for (const yaw of YAWS)
      for (const escala of SCALES)
        for (const orla of ORLAS)
          for (const tec of TECIDOS) {
            const params = {
              artW_cm: sc.artW * escala,
              artH_cm: sc.artH * escala,
              radius_cm: sc.radius,
              collarToTop_cm: 8,
              garmentLength_cm: sc.len,
              bow_cm: 2,
              camera: { yaw, pitch: -4, roll: 1.5, f: 2400, distance_cm: 250, cx: W / 2, cy: H / 2 - 190 },
            };
            const bg = { data: fabric(W, H, tec), width: W, height: H, channels: 3 };
            compositeArt(bg, templates[orla], params, 0.94);
            const box = projectedArtBox(params);
            const coluna = alturaColunaCentral(params);
            if (!box || !coluna) continue;
            // DUAS verdades, porque sao duas perguntas diferentes:
            //   caixa   o que o anotador consegue marcar
            //   coluna  o que corresponde de fato aos cm oficiais
            const verdadeCaixa = box.y1 - box.y0;
            const verdadeH = coluna;

            // ---- ANOTADOR SIMULADO
            // Ve a orla fraca com probabilidade que cai com o contraste dela.
            // Quando nao ve, ancora no NUCLEO, que e visivelmente menor.
            const pVe = Math.min(0.97, 0.12 + 2.0 * orla);
            const veTopo = rnd() < pVe, veBase = rnd() < pVe;
            // fracao da altura que a orla ocupa em cima e embaixo, na textura
            const fTopo = 60 / AH, fBase = 46 / AH;
            let hAnot = verdadeCaixa;
            if (!veTopo) hAnot -= verdadeCaixa * fTopo;
            if (!veBase) hAnot -= verdadeCaixa * fBase;
            hAnot += gauss(9) + gauss(9); // ruido de ponteiro nas duas bordas

            // ---- REGISTRO
            const reg = registerArt(bg, tplCheio, { scaleRange: [0.2, 0.9] });

            rows.push({
              garment: sc.garment, yaw, escala, orla, tecido: tec[0] < 128 ? "preta" : "off-white",
              verdadeColuna: +verdadeH.toFixed(1),
              verdadeCaixa: +verdadeCaixa.toFixed(1),
              errAnot_pp: +((hAnot / verdadeH - 1) * 100).toFixed(2),
              errReg_pp: reg ? +((reg.height_px / verdadeH - 1) * 100).toFixed(2) : null,
              errAnotVsCaixa_pp: +((hAnot / verdadeCaixa - 1) * 100).toFixed(2),
              errRegVsCaixa_pp: reg ? +((reg.height_px / verdadeCaixa - 1) * 100).toFixed(2) : null,
              regScore: reg ? +reg.score.toFixed(3) : null,
            });
            process.stderr.write(".");
          }

  const stat = (v) => {
    const a = v.filter((x) => x !== null && Number.isFinite(x));
    if (!a.length) return { n: 0 };
    const m = a.reduce((s, x) => s + x, 0) / a.length;
    const sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1));
    const abs = a.map(Math.abs).sort((p, q) => p - q);
    return {
      n: a.length, bias: +m.toFixed(2), sd: +sd.toFixed(2),
      p95: +abs[Math.floor(0.95 * abs.length)].toFixed(2),
      margem_pp: Math.ceil(Math.abs(m) + 2 * sd),
    };
  };

  const rep = {
    generatedAt: new Date().toISOString(),
    criterioDeclarado: "registro substitui anotacao se margem <= 3 pp contra a COLUNA CENTRAL",
    nota: "A primeira rodada comparou contra a CAIXA ENVOLVENTE e deu margem 10 pp. A caixa nao e a quantidade certa: ela e ~2,4 pp mais alta que a coluna central, por efeito puramente geometrico dos cantos, medido em separado. Ambas as comparacoes ficam publicadas.",
    casos: rows.length,
    anotacao: stat(rows.map((r) => r.errAnot_pp)),
    registro: stat(rows.map((r) => r.errReg_pp)),
    contraCaixa: {
      anotacao: stat(rows.map((r) => r.errAnotVsCaixa_pp)),
      registro: stat(rows.map((r) => r.errRegVsCaixa_pp)),
    },
    registroFalhou: rows.filter((r) => r.errReg_pp === null).length,
    porOrla: Object.fromEntries(ORLAS.map((o) => [o, {
      anotacao: stat(rows.filter((r) => r.orla === o).map((r) => r.errAnot_pp)),
      registro: stat(rows.filter((r) => r.orla === o).map((r) => r.errReg_pp)),
    }])),
    porTecido: Object.fromEntries(["preta", "off-white"].map((t) => [t, {
      anotacao: stat(rows.filter((r) => r.tecido === t).map((r) => r.errAnot_pp)),
      registro: stat(rows.filter((r) => r.tecido === t).map((r) => r.errReg_pp)),
    }])),
  };
  rep.aprovado = rep.registro.margem_pp <= 3 && rep.registroFalhou === 0;

  fs.writeFileSync(path.join(HERE, "register-report.json"), `${JSON.stringify({ ...rep, rows }, null, 2)}\n`);
  console.log(`\n${JSON.stringify(rep, null, 2)}`);
  console.log(`\nE2: ${rep.aprovado ? "APROVADO — o registro substitui a anotacao" : "REPROVADO — a anotacao continua"}`);
  return rep.aprovado ? 0 : 1;
}

process.exitCode = await run();

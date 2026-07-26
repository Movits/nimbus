// VARREDURA ESTATICA DAS RECEITAS, atras de `torso` e `centro` errados.
//
// Nao gera imagem, nao chama IA, nao compoe nada: le as receitas, os blanks
// (so os metadados) e a tabela de medidas, e diz ONDE OLHAR PRIMEIRO. E uma
// TRIAGEM para ordenar o retrabalho uma capa por vez, nao um veredito.
//
// Por que ela existe. Em 26/07 o dono reprovou o lote de 77. Um dos tres
// defeitos foi estampa achatada: a receita do 352718999 usava `torso 0.44`,
// que e a largura MANGA A MANGA e nao a largura do tronco na altura da arte.
// `planejar()` resolve o raio efetivo pela projecao da silhueta, entao um
// torso inflado dobra o raio e a arte se enrola num cilindro grande demais —
// sai chapada. O piloto aprovado do mesmo produto usa `torso 0.292`.
//
// COMO ELA MEDE. Nao reimplementa a geometria: chama o proprio `planejar()`
// de compose-art.mjs, o mesmo que o compositor usa. O numero que sai daqui e
// literalmente o raio que a composicao usaria. Dai compara com o raio da
// tabela (R = largura_plana / pi, largura plana = meia circunferencia).
//
//   inflacao = raio_efetivo / raio_tabela
//
// Tecido vestido cai mais plano que um cilindro justo, entao inflacao > 1 e
// ESPERADA. Os tres pilotos que o dono aprovou dao a faixa de referencia, e
// ela e impressa no cabecalho a cada rodada em vez de ficar chumbada aqui.
//
// O SEGUNDO CHECK, e o mais duro: `centro` e `torso` sao propriedades DA FOTO.
// Duas receitas sobre o MESMO blank tem obrigatoriamente o mesmo eixo e a
// mesma largura de tronco. Quando divergem, uma das duas esta errada — isso e
// contradicao provada, nao estimativa. E o unico veredito que esta pagina
// emite.
//
// O QUE ELA NAO ENXERGA (ler docs/verdades/limites-conhecidos.md):
//   - se o `centro` bate com os vincos de cava. Isso e leitura visual do
//     blank; aqui so se detecta divergencia entre receitas e o default 0,5.
//   - se `gola` e `barra` estao certos. Um par gola/barra errado desloca
//     pxPorCm e portanto a inflacao, e esta varredura culparia o torso.
//   - fidelidade de traco, sinal do yaw e integracao com o tecido.
//
// Uso: node scripts/producao/auditar-receitas.mjs [--todas] [--json]
//   --todas  inclui as receitas antigas de cada variante, nao so a final
//   --json   escreve nuvemshop/producao/auditoria-receitas.json

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";
import { getGarmentSpec } from "../geometry/garment-specs.mjs";
import { CANONICAL_SIZE } from "../geometry/measure.mjs";
import { lerNome, melhor } from "./nomes-de-capa.mjs";

const D = "nuvemshop/assets/producao-capas";
const TODAS = process.argv.includes("--todas");
const JSON_OUT = process.argv.includes("--json");

/* ---------------------------------------------------------------- fontes */

// Sidecar vence o consolidado: e o que a composicao gravou de fato.
const receitas = new Map();
for (const [arq, r] of Object.entries(JSON.parse(fs.readFileSync("nuvemshop/producao/receitas.json", "utf8")))) {
  receitas.set(arq, { ...r, fonte: r.fonte ?? "consolidado" });
}
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    if (!/\.receita\.json$/.test(f)) continue;
    receitas.set(f.replace(".receita.json", ".png"), {
      ...JSON.parse(fs.readFileSync(path.join(p, f), "utf8")), fonte: "sidecar",
    });
  }
}

const tabela = JSON.parse(fs.readFileSync("nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json", "utf8"));
const PL = (id) => tabela.itens.find((t) => t.product_id === id) ?? null;
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const cmDoPlano = (id, cor) => {
  const p = plano.find((x) => x.product_id === id && x.cor.toLowerCase().replace(/-/g, "") === cor.replace(/-/g, ""));
  return p ? `${p.art_cm.w}x${p.art_cm.h}` : null;
};

// As receitas colhidas dos diarios guardaram caminho do PowerShell ("$d/...")
// ou separador de Windows. Normaliza antes de tocar o disco.
const normPath = (s) => (s ? s.replace(/\\/g, "/") : s);
function resolverFoto(rec, id, cor) {
  const p = normPath(rec.foto);
  if (p && fs.existsSync(p)) return p;
  const tentativa = path.join(D, id, `${id}-${cor}-blank.png`);
  return fs.existsSync(tentativa) ? tentativa : null;
}

/* ------------------------------------------------------- quais variantes */

// Mesma regra do recompor-catalogo: a capa final de cada produto+cor.
const finais = new Map();
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    const r = lerNome(f.replace(/\.receita\.json$/, ".png"));
    if (!r) continue;
    const k = `${r.id}|${r.cor}`;
    if (melhor(finais.get(k), r) === r) finais.set(k, r);
  }
}

const alvos = [];
for (const [arq, rec] of receitas) {
  const r = lerNome(arq);
  if (!r) continue;
  const fin = finais.get(`${r.id}|${r.cor}`);
  const ehFinal = fin && fin.arquivo === r.arquivo;
  if (!TODAS && !ehFinal) continue;
  alvos.push({ arq, rec, ...r, ehFinal: Boolean(ehFinal) });
}
alvos.sort((a, b) => a.arq.localeCompare(b.arq));

/* ------------------------------------------------------------- a medicao */

const dims = new Map();
async function dimensoes(foto) {
  if (!dims.has(foto)) {
    const m = await sharp(foto).metadata();
    dims.set(foto, { w: m.width, h: m.height });
  }
  return dims.get(foto);
}

const linhas = [];
for (const a of alvos) {
  const { rec, id, cor } = a;
  const base = { arquivo: a.arq, id, cor, fonte: rec.fonte, final: a.ehFinal };
  const t = PL(id);
  const peca = rec.peca ?? t?.garment ?? null;
  const arteCm = rec.arte_cm ?? cmDoPlano(id, cor);
  const foto = resolverFoto(rec, id, cor);

  if (!peca) { linhas.push({ ...base, status: "SEM PECA" }); continue; }
  if (!arteCm) { linhas.push({ ...base, status: "SEM ARTE-CM" }); continue; }
  if (!foto) { linhas.push({ ...base, status: "SEM BLANK" }); continue; }

  const [aw, ah] = String(arteCm).split("x").map(Number);
  let spec;
  try { spec = getGarmentSpec(peca); } catch { linhas.push({ ...base, peca, status: "SEM TABELA" }); continue; }
  const tamG = spec.sizes.find((s) => s.size === CANONICAL_SIZE);
  const raioTabela = tamG.width_cm / Math.PI;

  const { w: imgW, h: imgH } = await dimensoes(foto);

  // Duas passadas pelo MESMO `planejar` da producao: com e sem o torso da
  // receita. A diferenca entre as duas e exatamente o que o torso fez.
  const comum = { golaFrac: rec.gola, barraFrac: rec.barra, centroFrac: rec.centro ?? 0.5,
    imgW, imgH, artW_cm: aw, artH_cm: ah, peca, yawDeg: rec.yaw ?? 0, placementCm: rec.placement };
  let comTorso, semTorso;
  try {
    comTorso = planejar({ ...comum, torsoFrac: rec.torso ?? null });
    semTorso = planejar({ ...comum, torsoFrac: null });
  } catch (e) {
    linhas.push({ ...base, peca, status: "ERRO", erro: String(e.message).slice(0, 120) });
    continue;
  }

  const raioEfetivo = comTorso.alvo.raio_cm;
  const inflacao = raioEfetivo / raioTabela;

  linhas.push({
    ...base, peca, foto: path.basename(foto),
    gola: rec.gola, barra: rec.barra, centro: rec.centro ?? null, torso: rec.torso ?? null,
    arte_cm: arteCm, placement: rec.placement ?? null,
    raio_tabela_cm: +raioTabela.toFixed(2),
    raio_efetivo_cm: +raioEfetivo.toFixed(2),
    inflacao: +inflacao.toFixed(3),
    arco_meio_rad: comTorso.alvo.arco_meio_rad,
    arco_sem_torso: semTorso.alvo.arco_meio_rad,
    estimado: Boolean(spec.estimado),
    status: "MEDIDO",
  });
}

/* ------------------------------------------- faixa de referencia (pilotos) */

// Os tres pilotos que o dono aprovou em 26/07. A faixa sai deles, medida a
// cada rodada — chumbar o numero aqui seria a segunda copia de uma verdade.
const PILOTOS = ["352718999-branca-piloto-v1.png", "352889132-preta-piloto-v1.png", "352618878-preta-piloto-v1.png"];
const medidosPiloto = [];
for (const p of PILOTOS) {
  const rec = receitas.get(p);
  if (!rec) continue;
  const r = lerNome(p);
  const peca = rec.peca ?? PL(r.id)?.garment;
  const foto = resolverFoto(rec, r.id, r.cor);
  const [aw, ah] = String(rec.arte_cm).split("x").map(Number);
  if (!peca || !foto) continue;
  const { w: imgW, h: imgH } = await dimensoes(foto);
  const spec = getGarmentSpec(peca);
  const raioTabela = spec.sizes.find((s) => s.size === CANONICAL_SIZE).width_cm / Math.PI;
  const plan = planejar({ golaFrac: rec.gola, barraFrac: rec.barra, centroFrac: rec.centro,
    imgW, imgH, artW_cm: aw, artH_cm: ah, peca, torsoFrac: rec.torso, yawDeg: rec.yaw ?? 0,
    placementCm: rec.placement });
  medidosPiloto.push({ arquivo: p, peca, torso: rec.torso, centro: rec.centro,
    inflacao: +(plan.alvo.raio_cm / raioTabela).toFixed(3) });
}
const infPiloto = medidosPiloto.map((p) => p.inflacao);
const TETO = infPiloto.length ? +(Math.max(...infPiloto) * 1.15).toFixed(3) : 1.45;

/* ------------------------------------------------------------- suspeitas */

const medidos = linhas.filter((l) => l.status === "MEDIDO");

for (const l of medidos) {
  l.suspeitas = [];
  if (l.inflacao > TETO) {
    l.suspeitas.push(`torso infla o raio ${l.inflacao}x a tabela (teto dos pilotos ${TETO}x) — estampa achatada`);
  }
  if (l.torso == null) {
    l.suspeitas.push("sem torso: o raio veio da tabela, que modela cilindro justo");
  }
  if (l.centro == null) {
    l.suspeitas.push("sem centro: caiu no default 0,5, que e o MEIO DA IMAGEM e nao o eixo do painel");
  } else if (l.centro === 0.5) {
    l.suspeitas.push("centro exatamente 0,5: meio da imagem, provavelmente nao medido nos vincos de cava");
  }
}

// Contradicao entre receitas do MESMO blank. Eixo e largura de tronco sao
// propriedades da foto: se duas receitas discordam, uma esta errada.
const porFoto = new Map();
for (const l of medidos) {
  if (!l.foto) continue;
  if (!porFoto.has(l.foto)) porFoto.set(l.foto, []);
  porFoto.get(l.foto).push(l);
}
const conflitos = [];
for (const [foto, grupo] of porFoto) {
  if (grupo.length < 2) continue;
  for (const campo of ["centro", "torso"]) {
    const vals = grupo.map((g) => g[campo]).filter((v) => v != null);
    if (vals.length < 2) continue;
    const spread = Math.max(...vals) - Math.min(...vals);
    // 0,005 da largura da imagem e ruido de leitura; acima disso e discordancia.
    if (spread > 0.005) {
      conflitos.push({ foto, campo, spread: +spread.toFixed(4),
        valores: grupo.filter((g) => g[campo] != null).map((g) => ({ arquivo: g.arquivo, valor: g[campo] })) });
      for (const g of grupo) {
        if (g[campo] != null) g.suspeitas.push(`${campo} conflita com outra receita do mesmo blank (${foto}): espalhamento ${spread.toFixed(4)}`);
      }
    }
  }
}

/* --------------------------------------------------------------- relatorio */

const suspeitos = medidos.filter((l) => l.suspeitas.length).sort((a, b) => b.inflacao - a.inflacao);
const limpos = medidos.filter((l) => !l.suspeitas.length);
const semMedida = linhas.filter((l) => l.status !== "MEDIDO");

console.log("FAIXA DE REFERENCIA — pilotos aprovados pelo dono em 26/07");
for (const p of medidosPiloto) {
  console.log(`  ${p.arquivo.padEnd(34)} ${String(p.peca).padEnd(28)} torso ${String(p.torso).padEnd(7)} inflacao ${p.inflacao}x`);
}
console.log(`  teto usado nesta varredura: ${TETO}x (maior piloto + 15%)\n`);

console.log("SUSPEITAS — ordem de retrabalho, uma capa por vez");
console.log("inflacao  produto    cor        peca                          torso   centro   motivo");
for (const l of suspeitos) {
  console.log(`${String(l.inflacao).padStart(7)}x  ${l.id} ${String(l.cor).padEnd(10)} ${String(l.peca).padEnd(28)} ${String(l.torso ?? "-").padEnd(7)} ${String(l.centro ?? "-").padEnd(8)} ${l.suspeitas[0]}`);
  for (const s of l.suspeitas.slice(1)) console.log(`${" ".repeat(9)}  ${" ".repeat(48)}${s}`);
}

if (conflitos.length) {
  console.log("\nCONTRADICOES PROVADAS — mesmo blank, receitas discordantes");
  for (const c of conflitos) {
    console.log(`  ${c.foto}  ${c.campo}  espalhamento ${c.spread}`);
    for (const v of c.valores) console.log(`      ${v.arquivo.padEnd(40)} ${c.campo} ${v.valor}`);
  }
}

if (semMedida.length) {
  console.log("\nSEM MEDIDA");
  for (const l of semMedida) console.log(`  ${String(l.status).padEnd(12)} ${l.arquivo}  ${l.erro ?? ""}`);
}

console.log(`\ntotal ${linhas.length} | medidas ${medidos.length} | suspeitas ${suspeitos.length} | sem suspeita ${limpos.length} | sem medida ${semMedida.length}`);
console.log("Isto e TRIAGEM, nao veredito. Cada capa ainda passa por composicao, gate e olho.");

if (JSON_OUT) {
  const saida = "nuvemshop/producao/auditoria-receitas.json";
  fs.writeFileSync(saida, JSON.stringify({
    gerado_em: new Date().toISOString(), teto_inflacao: TETO, pilotos: medidosPiloto,
    conflitos, linhas,
  }, null, 1));
  console.log(`\nJSON: ${saida}`);
}

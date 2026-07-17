// Monta as listas de tarefas do gerador v2 a partir de:
//  - review/plano-fotos-v2.1-2026-07-17.json  (decisoes e geracoes por produto)
//  - catalog/gallery-classification-2026-07-17.json  (qual imagem e frente/costas de cada cor)
//  - generation-state.json  (familia, modelo, vista, saida do lote de 16/07)
//  - review/fotos-a-refazer-2026-07-17.json  (defeitos a nao repetir, viram notas de prompt)
//  - catalog/art-map-2026-07-17.json  (opcional: arte por familia+cor quando ha par de cor)
//
// Saidas (na pasta review/):
//  - tasks-correcoes.json   (fase A: refazer a capa dos 10 reprovados)
//  - tasks-cores.json       (fase B: cores novas pro hover; usa a foto da capa como ref de cena)
//  - art-pendencias.json    (pares familia+cor sem arte resolvida, pra conferir a olho)
//
// Rodar a fase A antes da B: a B referencia as saidas da A como cena.

import fs from "node:fs";
import path from "node:path";

const R = "C:\\Users\\rober\\Nimbus";
const L = path.join(R, "nuvemshop", "assets", "product-lifestyle", "2026-07-16");

const plano = JSON.parse(fs.readFileSync(path.join(L, "review", "plano-fotos-v2.1-2026-07-17.json"), "utf8"));
const cls = JSON.parse(fs.readFileSync(path.join(L, "catalog", "gallery-classification-2026-07-17.json"), "utf8"));
const st = JSON.parse(fs.readFileSync(path.join(L, "generation-state.json"), "utf8"));
const prods = Object.values(st.products || st);
const audit = JSON.parse(fs.readFileSync(path.join(L, "review", "fotos-a-refazer-2026-07-17.json"), "utf8"));
const cat = JSON.parse(fs.readFileSync(path.join(L, "catalog", "nuvemshop-products.json"), "utf8"));
const catArr = Array.isArray(cat) ? cat : cat.products || Object.values(cat);
const artMapPath = path.join(L, "catalog", "art-map-2026-07-17.json");
const artMap = fs.existsSync(artMapPath) ? JSON.parse(fs.readFileSync(artMapPath, "utf8")) : {};

const slug = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const classByProduct = new Map();
for (const p of cls.produtos || []) classByProduct.set(String(p.productId), p.imagens || []);

const notasPorId = new Map();
for (const e of audit.lista || []) {
  notasPorId.set(String(e.id), (e.problemas || []).map((p) => `${p.tipo}: ${String(p.detalhe).slice(0, 140)}`));
}

function garmentDescription(piece, color) {
  if (/Ecobag/i.test(piece)) return "natural cotton canvas ecobag with realistic handles and structure";
  if (/Oversized/i.test(piece)) return `${color} heavyweight premium oversized T-shirt, boxy silhouette, dropped shoulders and long wide sleeves`;
  if (/Camiseta Premium/i.test(piece)) return `${color} premium regular-fit T-shirt, standard silhouette and shorter sleeves`;
  if (/Canguru/i.test(piece)) return `${color} pullover kangaroo hoodie with hood, kangaroo pocket and ribbed cuffs`;
  if (/Blusão/i.test(piece)) return `${color} premium crewneck sweatshirt with ribbed collar, cuffs and hem`;
  return `${color} premium streetwear garment`;
}

// arte por (familia, cor): 1 arte na pasta -> ela; senao art-map; senao pendencia (fica null)
function resolveArtwork(family, color, defaultArtwork) {
  if (!defaultArtwork) return { ref: null, pendente: false };
  const dir = path.dirname(defaultArtwork);
  let costas = [];
  try {
    costas = fs.readdirSync(dir).filter((f) => /\.png$/i.test(f) && !/^peito/i.test(f));
  } catch {
    return { ref: defaultArtwork, pendente: false };
  }
  if (costas.length <= 1) return { ref: defaultArtwork, pendente: false };
  const key = `${family}|${color}`;
  if (artMap[key]) return { ref: path.isAbsolute(artMap[key]) ? artMap[key] : path.join(dir, artMap[key]), pendente: false };
  return { ref: null, pendente: true, candidatos: costas.map((f) => path.join(dir, f)) };
}

const correcoes = [];
const cores = [];
const pendencias = [];
const gaps = [];

for (const d of plano.decisoes) {
  if (!d.geracoes || !d.geracoes.length || d.acao === "adiar") continue;
  const p = prods.find((x) => String(x.productId) === String(d.id));
  if (!p) { gaps.push({ id: d.id, problema: "sem entrada no generation-state" }); continue; }
  const c = catArr.find((x) => String(x.productId) === String(d.id)) || {};
  const refDir = c.referenceDirectory ? path.join(R, c.referenceDirectory) : null;
  const imgs = classByProduct.get(String(d.id)) || [];
  const acha = (vista, cor) => {
    const hit = imgs.find((i) => i.vista === vista && slug(i.corDaPeca) === slug(cor));
    return hit && refDir ? path.join(refDir, hit.arquivo) : null;
  };

  for (const g of d.geracoes) {
    const cor = g.cor;
    const front = acha("frente", cor);
    const back = acha("costas", cor);
    let view = p.view || "back";
    let mockupRef = view === "back" ? back : front;
    // O que manda e o que o mockup da COR mostra. Ex.: Monograma Oversized e "front" no
    // state de 16/07, mas as duas imagens da galeria sao de costas (monograma grande atras).
    if (!mockupRef && view === "front" && back) {
      view = "back";
      mockupRef = back;
    }
    const garmentRef = front || back;
    if (!mockupRef) {
      gaps.push({ id: d.id, produto: d.produto, cor, problema: `sem mockup ${view === "back" ? "de costas" : "de frente"} classificado nessa cor` });
      continue;
    }
    const art = resolveArtwork(p.family, cor, p.artwork);
    if (art.pendente) pendencias.push({ id: d.id, familia: p.family, cor, candidatos: art.candidatos, mockupRef });

    const out = path.join(L, "final", slug(p.collection), slug(p.family), `${d.id}-${slug(p.piece)}-${slug(cor)}.png`);
    const task = {
      productId: d.id, title: p.title, collection: p.collection, family: p.family,
      piece: p.piece, color: cor, view, isEcobag: /ecobag/i.test(p.piece),
      model: p.model, modelBoard: p.modelBoard,
      garment: garmentDescription(p.piece, cor),
      garmentRef, mockupRef,
      artworkRef: art.ref,
      sceneRef: null,
      tipo: g.tipo,
      notes: g.tipo === "correcao" ? notasPorId.get(String(d.id)) || [] : [],
      output: out,
    };

    if (g.tipo === "correcao") {
      correcoes.push(task);
    } else {
      // cena: a foto valida que o produto ja tem (mantida/reatribuida/ok) ou a capa refeita na fase A
      let cena = null;
      if (d.acao === "refazer") {
        cena = path.join(L, "final", slug(p.collection), slug(p.family), `${d.id}-${slug(p.piece)}-${slug(d.capa)}.png`);
      } else if (p.output && fs.existsSync(p.output)) {
        cena = p.output;
      }
      task.sceneRef = cena;
      cores.push(task);
    }
  }
}

fs.writeFileSync(path.join(L, "review", "tasks-correcoes.json"), JSON.stringify({ fase: "A-correcoes", tasks: correcoes }, null, 1));
fs.writeFileSync(path.join(L, "review", "tasks-cores.json"), JSON.stringify({ fase: "B-cores", tasks: cores }, null, 1));
fs.writeFileSync(path.join(L, "review", "art-pendencias.json"), JSON.stringify({ pendencias }, null, 1));

console.log(`fase A (correcoes): ${correcoes.length} tarefas`);
console.log(`fase B (cores)    : ${cores.length} tarefas`);
console.log(`artes pendentes de escolha (par de cor): ${pendencias.length}`);
pendencias.forEach((x) => console.log(`   ${x.familia} | ${x.cor}  (${x.candidatos.length} candidatas)`));
console.log(`lacunas: ${gaps.length}`);
gaps.forEach((x) => console.log(`   ${x.id} ${x.produto || ""} ${x.cor || ""}: ${x.problema}`));

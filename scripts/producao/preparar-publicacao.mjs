// Monta a pasta _PUBLICAR com as capas finais, em nomes que o dono consegue
// ler ao arrastar para o chat: ordem, produto, peca, cor e o product_id.
//
// A capa final de cada variante e o arquivo de maior versao SEM o sufixo
// `-semcapuz` (esse e o intermediario, antes da oclusao do capuz).
import fs from "node:fs";
import path from "node:path";
import { lerNome, melhor } from "./nomes-de-capa.mjs";

const D = "nuvemshop/assets/producao-capas";
const SAIDA = path.join(D, "_PUBLICAR");
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const rel = fs.existsSync("nuvemshop/producao/relatorio-gate.json")
  ? JSON.parse(fs.readFileSync("nuvemshop/producao/relatorio-gate.json", "utf8")) : [];

const norm = (s) => s.toLowerCase().replace(/-/g, "");
const limpo = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^A-Za-z0-9]+/g, "");

// Aprovacao explicita do dono vence qualquer heuristica de nome.
const aprovadas = fs.existsSync("nuvemshop/producao/capas-aprovadas.json")
  ? JSON.parse(fs.readFileSync("nuvemshop/producao/capas-aprovadas.json", "utf8")) : {};

// capa final por produto+cor
const finais = new Map();
for (const d of fs.readdirSync(D)) {
  const dir = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const r = lerNome(f);
    if (!r) continue;
    const k = `${r.id}|${r.cor}`;
    if (aprovadas[k]) continue;              // essa variante tem aprovacao explicita
    const atual = finais.get(k);
    if (melhor(atual, r) === r) finais.set(k, { ...r, dir, f });
  }
}
for (const [k, f] of Object.entries(aprovadas)) {
  if (k.startsWith("_")) continue;
  const id = k.split("|")[0];
  const caminho = path.join(D, id, f);
  if (!fs.existsSync(caminho)) { console.error(`AVISO: aprovada ausente em disco: ${caminho}`); continue; }
  finais.set(k, { id, cor: k.split("|")[1], dir: path.join(D, id), f, aprovada: true });
}

if (fs.existsSync(SAIDA)) for (const f of fs.readdirSync(SAIDA)) fs.unlinkSync(path.join(SAIDA, f));
else fs.mkdirSync(SAIDA, { recursive: true });

const ordenado = [...plano].sort((a, b) =>
  a.collection.localeCompare(b.collection) || a.title.localeCompare(b.title) || a.cor.localeCompare(b.cor));

let n = 0;
const faltando = [], copiados = [];
for (const p of ordenado) {
  const o = finais.get(`${p.product_id}|${norm(p.cor)}`);
  if (!o) { faltando.push(`${p.product_id} ${p.cor} — ${p.title}`); continue; }
  n += 1;
  const arte = p.title.split("|")[0].trim();
  const nome = `${String(n).padStart(2, "0")}_${p.collection}_${limpo(arte)}_${limpo(p.garment)}_${limpo(p.cor)}_${p.product_id}.png`;
  fs.copyFileSync(path.join(o.dir, o.f), path.join(SAIDA, nome));
  const r = rel.find((x) => x.id === p.product_id && norm(x.cor) === norm(p.cor));
  copiados.push({ nome, origem: o.f, veredito: r?.status ?? "-", escala: r?.escala_pct ?? null, posicao: r?.posicao_cm ?? null });
}

const mb = copiados.reduce((s, c) => s + fs.statSync(path.join(SAIDA, c.nome)).size, 0) / 1048576;
fs.writeFileSync(path.join(SAIDA, "_INDICE.json"), JSON.stringify({ total: copiados.length, faltando, capas: copiados }, null, 1));
console.log(`_PUBLICAR: ${copiados.length} de ${plano.length} capas | ${mb.toFixed(1)} MB`);
if (faltando.length) { console.log(`\nFALTAM ${faltando.length}:`); for (const f of faltando) console.log(`   ${f}`); }
const semVeredito = copiados.filter((c) => c.veredito !== "APROVADO");
if (semVeredito.length) { console.log(`\nSEM VEREDITO APROVADO no ultimo relatorio (${semVeredito.length}):`); for (const c of semVeredito) console.log(`   ${c.nome}  ${c.veredito}`); }

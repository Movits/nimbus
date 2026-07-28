// Publica as capas APROVADAS na Nuvemshop via API (app NIMBUS Capas, 28/07).
//
// Regra de classificacao da galeria, conferida na loja real:
//   - imagens `file_name-*`  -> mockups oficiais YouDraw importados. PRESERVAR
//     (decisao do dono 25/07; os vinculos variante->imagem apontam para eles).
//   - imagens `{product_id}-*` -> capas de modelo nossas (antigas). A da MESMA
//     cor que esta sendo publicada e substituida; as de outras cores ficam ate
//     serem refeitas. Sem cor no nome e produto multi-cor -> nao mexe, reporta.
//
// Uso:
//   node scripts/loja/publicar-capas-api.mjs            # dry-run (so mostra o plano)
//   node scripts/loja/publicar-capas-api.mjs --publicar # executa
import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(fs.readFileSync(".env", "utf8").split("\n")
  .filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const TOKEN = env.NUVEMSHOP_ACCESS_TOKEN, SID = env.NUVEMSHOP_STORE_ID;
if (!TOKEN || !SID) { console.error("faltam NUVEMSHOP_ACCESS_TOKEN/STORE_ID no .env"); process.exit(1); }
const HDR = { Authentication: `bearer ${TOKEN}`, "User-Agent": "NIMBUS Capas (nimbuswearbr@gmail.com)", "Content-Type": "application/json" };
const API = `https://api.nuvemshop.com.br/v1/${SID}`;
const EXECUTAR = process.argv.includes("--publicar");

const aprovadas = JSON.parse(fs.readFileSync("nuvemshop/producao/capas-aprovadas.json", "utf8"));
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const D = "nuvemshop/assets/producao-capas";

const corNoNome = (f) => {
  const s = f.toLowerCase();
  if (/off[-_]?white/.test(s)) return "offwhite";
  for (const c of ["preta", "branca", "bege"]) if (s.includes(c)) return c;
  return null;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(caminho, metodo = "GET", corpo = null) {
  for (let tent = 0; tent < 4; tent += 1) {
    const r = await fetch(API + caminho, { method: metodo, headers: HDR, body: corpo ? JSON.stringify(corpo) : undefined });
    if (r.status === 429) { await espera(1500 * (tent + 1)); continue; }
    if (metodo === "DELETE") return { status: r.status };
    const txt = await r.text();
    return { status: r.status, json: txt ? JSON.parse(txt) : null };
  }
  throw new Error("rate limit persistente em " + caminho);
}

const relatorio = [];
const porProduto = new Map();
for (const [k, f] of Object.entries(aprovadas)) {
  if (k.startsWith("_")) continue;
  const [id, cor] = k.split("|");
  if (!porProduto.has(id)) porProduto.set(id, []);
  porProduto.get(id).push({ cor, arquivo: f });
}

for (const [id, capas] of porProduto) {
  const p = plano.find((x) => x.product_id === id);
  const cores = new Set(plano.filter((x) => x.product_id === id).map((x) => x.cor.toLowerCase().replace(/-/g, "")));
  const r = await api(`/products/${id}?fields=id,name,images`);
  if (r.status !== 200) { relatorio.push({ id, erro: `GET ${r.status}` }); continue; }
  const imagens = r.json.images ?? [];
  const linha = { id, produto: p?.title ?? id, acoes: [] };

  for (const { cor, arquivo } of capas) {
    const caminho = path.join(D, id, arquivo);
    if (!fs.existsSync(caminho)) { linha.acoes.push({ cor, erro: "arquivo ausente: " + arquivo }); continue; }
    const nossas = imagens.filter((im) => {
      const nome = (im.src || "").split("/").pop() || "";
      return nome.startsWith(`${id}-`);
    });
    const daCor = nossas.filter((im) => corNoNome((im.src || "").split("/").pop()) === cor);
    const semCor = nossas.filter((im) => corNoNome((im.src || "").split("/").pop()) === null);
    // alvo de substituicao: mesma cor; ou sem-cor quando o produto tem UMA cor
    const alvos = daCor.length ? daCor : (cores.size === 1 ? semCor : []);
    const posicao = alvos.length ? Math.min(...alvos.map((a) => a.position)) : 1;
    const ambiguas = !daCor.length && cores.size > 1 ? semCor : [];

    if (EXECUTAR) {
      const b64 = fs.readFileSync(caminho).toString("base64");
      const up = await api(`/products/${id}/images`, "POST", {
        attachment: b64, filename: `${id}-${cor}-capa-2026-07-28.png`, position: posicao,
      });
      if (up.status !== 201) { linha.acoes.push({ cor, erro: `upload ${up.status}: ${JSON.stringify(up.json).slice(0, 120)}` }); continue; }
      const removidas = [];
      for (const a of alvos) {
        const del = await api(`/products/${id}/images/${a.id}`, "DELETE");
        removidas.push(`${(a.src || "").split("/").pop().slice(0, 40)} (${del.status === 200 || del.status === 204 ? "ok" : del.status})`);
        await espera(300);
      }
      linha.acoes.push({ cor, nova: `pos ${posicao}, image_id ${up.json.id}`, removidas, mantidas_ambiguas: ambiguas.map((a) => (a.src || "").split("/").pop().slice(0, 40)) });
      await espera(400);
    } else {
      linha.acoes.push({
        cor, plano_upload: `${arquivo} -> pos ${posicao}`,
        plano_remover: alvos.map((a) => (a.src || "").split("/").pop().slice(0, 44)),
        ambiguas_ficam: ambiguas.map((a) => (a.src || "").split("/").pop().slice(0, 44)),
        youdraw_preservadas: imagens.filter((im) => ((im.src || "").split("/").pop() || "").startsWith("file_name-")).length,
      });
    }
  }
  relatorio.push(linha);
  console.log(JSON.stringify(linha));
}

fs.writeFileSync("nuvemshop/producao/publicacao-2026-07-28.json", JSON.stringify({ executado: EXECUTAR, quando: "2026-07-28", relatorio }, null, 1));
console.log(`\n${EXECUTAR ? "PUBLICADO" : "DRY-RUN"} — relatorio em nuvemshop/producao/publicacao-2026-07-28.json`);

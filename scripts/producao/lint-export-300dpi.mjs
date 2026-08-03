// Portão da receita de export a 300 DPI (P1-1c do conselho r4, 03/08/2026).
// Receita pinada em docs/verdades/receita-export-300dpi.md: toda arte NOVA
// nasce com pixel para 300 DPI no MAIOR tamanho em que pode imprimir
// (costas de 40 cm de altura = 4724 px; caixa IzzyPrint 30x40 cm =
// 3543x4724 px). Serve YouDraw e IzzyPrint. Ampliar depois NÃO cria detalhe:
// o finalize-prints só declara a densidade e evita reamostragem do RIP.
//
// O que ele faz: varre os PNGs de designs/prontos/<COLECAO>/<posicao>/,
// encaixa a proporção de cada arte na caixa máxima de impressão da posição
// (teto real do catálogo, auditoria 2026-07-22, a mesma tabela do
// finalize-prints) e calcula o DPI nesse pior caso. Abaixo de 300, falha.
//
// Baseline datada (export-300dpi.baseline.json): as artes que JÁ EXISTIAM em
// 03/08, exportadas no padrão antigo de 3500 px (~222 DPI), ficam listadas com
// as dimensões congeladas como pendência de re-export (ESTADO, pendência 0:
// aguarda a decisão de plataforma). A lista só encolhe: arquivo que passou a
// cumprir 300 DPI derruba o build até sair da baseline, e arquivo novo ou
// redimensionado nunca entra por ela.
//
// Este portão precisa dos assets privados mesclados (node scripts/setup-assets.mjs);
// os PNGs de designs/prontos não vivem no repo público, então ele roda na
// máquina local (npm run vitrine:portoes), não no deploy.yml. SKIP_ASSETS=1
// pula em ambiente declaradamente sem assets, como SKIP_REDE no link-check.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const DIR = path.join(RAIZ, "designs", "prontos");
const BASELINE = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "export-300dpi.baseline.json"), "utf-8"));
const DPI_MIN = 300;

// caixa máxima de impressão por posição, em cm (largura x altura) — o teto
// real do catálogo, conferido em nuvemshop/auditoria/2026-07-22-dimensoes-arte/
const CAIXA_CM = {
  costas: { w: 35.2, h: 40.0 },
  frente: { w: 35.2, h: 35.1 },
  peito: { w: 9.4, h: 14.6 },
  manga: { w: 9.0, h: 9.0 },
  laser: { w: 15.0, h: 15.0 },
};
const IGNORAR = new Set(["mockups", "_mestres", "_inbox"]);

function dimsPng(p) {
  const b = fs.readFileSync(p);
  if (b.toString("ascii", 12, 16) !== "IHDR") return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

if (process.env.SKIP_ASSETS) {
  console.log("lint-export-300dpi: SKIP_ASSETS=1, ambiente sem os assets privados; portão pulado DE PROPÓSITO (rode sem a flag na máquina com setup-assets)");
  process.exit(0);
}

const alvos = [];
if (fs.existsSync(DIR))
  for (const colecao of fs.readdirSync(DIR, { withFileTypes: true })) {
    if (!colecao.isDirectory()) continue;
    for (const pos of fs.readdirSync(path.join(DIR, colecao.name), { withFileTypes: true })) {
      if (!pos.isDirectory() || IGNORAR.has(pos.name) || !CAIXA_CM[pos.name]) continue;
      for (const f of fs.readdirSync(path.join(DIR, colecao.name, pos.name)))
        if (f.toLowerCase().endsWith(".png"))
          alvos.push({ rel: `designs/prontos/${colecao.name}/${pos.name}/${f}`, caixa: CAIXA_CM[pos.name] });
    }
  }

if (!alvos.length) {
  console.error(
    "LINT-EXPORT-300DPI FALHOU:\n  - nenhum PNG em designs/prontos/*/(costas|frente|peito|manga)/.\n" +
    "    Os assets privados não estão mesclados: rode `node scripts/setup-assets.mjs`.\n" +
    "    Em ambiente sem os assets (CI do repo público), use SKIP_ASSETS=1 explicitamente."
  );
  process.exit(1);
}

const erros = [];
let ok = 0, legado = 0;
const vistas = new Set();
for (const { rel, caixa } of alvos) {
  const d = dimsPng(path.join(RAIZ, rel));
  if (!d) { erros.push(`${rel}: PNG ilegível (IHDR não encontrado)`); continue; }
  // encaixa a proporção na caixa máxima e mede o DPI nesse pior caso
  const impW = Math.min(caixa.w, caixa.h * (d.w / d.h));
  const impH = impW * (d.h / d.w);
  const dpi = Math.min(d.w / (impW / 2.54), d.h / (impH / 2.54));
  const congelada = BASELINE[rel];
  if (congelada) vistas.add(rel);
  if (dpi >= DPI_MIN) {
    ok++;
    if (congelada)
      erros.push(`${rel}: agora cumpre ${Math.round(dpi)} DPI; remova a entrada da baseline (a lista só encolhe)`);
    continue;
  }
  if (congelada && congelada === `${d.w}x${d.h}`) { legado++; continue; } // legado datado de 03/08, re-export pendente
  const fator = DPI_MIN / dpi;
  const alvoPx = `${Math.ceil(d.w * fator)}x${Math.ceil(d.h * fator)} px`;
  erros.push(
    `${rel}: ${d.w}x${d.h} px = ${Math.round(dpi)} DPI no maior uso (${impW.toFixed(1)}x${impH.toFixed(1)} cm); ` +
    `mínimo ${DPI_MIN} DPI = ${alvoPx}. Exporte da FONTE nesse tamanho; ampliar não cria detalhe` +
    (congelada ? " (o arquivo mudou de tamanho e continua abaixo do mínimo; a baseline não cobre re-export incompleto)" : "")
  );
}
for (const rel of Object.keys(BASELINE)) {
  if (rel === "_comentario" || vistas.has(rel)) continue;
  // entrada sem arquivo no disco não derruba: máquinas com assets desatualizados
  // não podem quebrar o portão dos outros; a limpeza acontece na máquina do dono.
}

if (erros.length) {
  console.error("LINT-EXPORT-300DPI FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`lint-export-300dpi OK: ${alvos.length} artes conferidas, ${ok} a 300 DPI ou mais, ${legado} legadas na baseline de 03/08 (re-export pendente, ESTADO pendência 0); arte nova só nasce a 300 DPI`);

// Gera public/loja/catalogo.json a partir das fontes já auditadas.
//
// Fontes e papel de cada uma (não misturar):
//   matriz-variantes-nuvemshop-parcial.csv  -> verdade comercial: preço, cor,
//     tamanho, SKU, variant_id, URL da loja
//   catalog/nuvemshop-products.json         -> APENAS slug e URLs de imagem da
//     família file_name-* (cor e preço dele estão vencidos, é de 16/07)
//   descricoes-e-seo-draft.csv              -> copy, meta e o status que decide
//     quem entra
//   matriz-produtos-conteudo-tecnico.csv    -> ficha técnica
//
// Normalizações que valem como regra:
//   toda URL vira https (o build FALHA se sobrar http://)
//   todo sufixo de imagem vira -640-0.webp (o maior que a CDN entrega: 500x500)
//   as capas da família -vitrine-nimbus- (lote reprovado em 26/07) nunca entram
//
// Uso: node scripts/vitrine/build-catalogo.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

// Campos de planilha vêm com "Não se aplica" quando a peça não tem aquele
// atributo (a Ecobag não tem gola). Isso é marcador de tabela, não copy.
const MARCADORES_FICHA = /^\s*(n[aã]o se aplica|n\/a|-|—)\s*\.?\s*$/i;
const limpaFicha = (v) => (MARCADORES_FICHA.test(String(v || "")) ? "" : v);

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const IMPL = path.join(RAIZ, "nuvemshop/auditoria/2026-07-21/implementacao");
const SAIDA = path.join(RAIZ, "public/loja/catalogo.json");
const DRY = process.argv.includes("--dry");

// Os 8 heroes aprovados no plano (cobrem as 3 coleções e 4 faixas de preço).
// Desde 30/07 (ordem do dono: "adicione todos os outros produtos") o catálogo
// inclui TODO produto com copy PRONTO; os heroes viram os destaques da home.
const HEROES = [
  "355581274", // NIMBUS Wildstyle | Ecobag            STREET   49,90
  "352723243", // São Miguel Celeste | Camiseta        NUVEM   149,90
  "352718999", // São Jorge Neobarroco | Camiseta      RELÍQUIA 149,90 piloto
  "352889132", // Aparecida Spray | Camiseta           STREET  149,90 piloto
  "352718943", // São Jorge Neobarroco | Oversized     RELÍQUIA 179,90
  "352721633", // NIMBUS Wildstyle | Oversized         STREET  179,90
  "352722685", // São Miguel Celeste | Moletom Canguru NUVEM   299,90
  "352618878", // São Jorge Vintage | Moletom Canguru  RELÍQUIA 299,90 piloto
];

const ROTULO = { STREET: "STREET", RELIQUIA: "RELÍQUIA", NUVEM: "NUVEM" };
const ORDEM_TAM = ["Único", "P", "M", "G", "GG", "EG"];

function lerCsv(arquivo) {
  const texto = fs.readFileSync(arquivo, "utf-8");
  const linhas = [];
  let campo = "", linha = [], dentro = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentro) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') dentro = false;
      else campo += c;
    } else if (c === '"') dentro = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); campo = ""; linha = []; }
      if (c === "\r" && texto[i + 1] === "\n") i++;
    } else campo += c;
  }
  if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }
  const cab = linhas.shift();
  return linhas.map((l) => Object.fromEntries(cab.map((k, i) => [k, l[i] ?? ""])));
}

function urlImagem(u) {
  if (!u) return null;
  let s = u.trim();
  if (s.startsWith("//")) s = "https:" + s;
  s = s.replace(/^http:\/\//, "https://");
  // força o maior tamanho real da CDN
  s = s.replace(/-\d+-\d+(\.webp)$/, "-640-0$1");
  return s;
}

// Marcador de trabalho interno ("Confirmar no painel ...") não pode viajar para
// o catálogo público: ele é servido em /loja/catalogo.json e entrega processo e
// fornecedor para quem lê. Campo vazio é melhor que campo mentiroso.
const semMarcador = (v) => (/confirmar no painel|aguardam? confirmação/i.test(v || "") ? "" : v || "");

const CURADORIA = JSON.parse(fs.readFileSync(path.join(RAIZ, "scripts/vitrine/curadoria-fotos.json"), "utf-8"));
// capa padronizada = COSTAS (dono, 31/07): curadoria gerada por análise de
// pixel + revisão visual para os produtos fora da curadoria manual.
const CAPAS = JSON.parse(fs.readFileSync(path.join(RAIZ, "scripts/vitrine/capas-costas.json"), "utf-8"));
const variantes = lerCsv(path.join(IMPL, "matriz-variantes-nuvemshop-parcial.csv"));
const copy = new Map(lerCsv(path.join(IMPL, "descricoes-e-seo-draft.csv")).map((r) => [r.product_id, r]));
const tecnico = new Map(lerCsv(path.join(IMPL, "matriz-produtos-conteudo-tecnico.csv")).map((r) => [r.product_id, r]));
const galeria = new Map(
  JSON.parse(fs.readFileSync(path.join(RAIZ, "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/nuvemshop-products.json"), "utf-8"))
    .products.map((p) => [String(p.productId), p])
);

const brl = (n) => "R$" + n.toFixed(2).replace(".", ",");
const erros = [];
const produtos = [];

// entram: heroes primeiro (na ordem do plano), depois todo PRONTO restante.
// BLOQUEADO fica fora (hoje: 5 Blusão Moletom, sem tabela de medidas YouDraw).
const RESTANTES = [...copy.keys()]
  .filter((pid) => !HEROES.includes(pid) && copy.get(pid).status.startsWith("PRONTO"))
  .sort((a, b) => {
    const ga = galeria.get(a), gb = galeria.get(b);
    const ka = `${ga?.collection || ""} ${ga?.title || ""}`, kb = `${gb?.collection || ""} ${gb?.title || ""}`;
    return ka.localeCompare(kb, "pt");
  });
const ENTRAM = [...HEROES, ...RESTANTES];

for (const pid of ENTRAM) {
  const vs = variantes.filter((v) => v.product_id === pid);
  if (!vs.length) { erros.push(`${pid}: sem variantes no CSV`); continue; }
  const c = copy.get(pid);
  if (!c) { erros.push(`${pid}: sem copy`); continue; }
  if (!c.status.startsWith("PRONTO")) { erros.push(`${pid}: copy nao esta PRONTO (${c.status})`); continue; }
  const t = tecnico.get(pid) || {};
  const g = galeria.get(pid);
  if (!g) { erros.push(`${pid}: sem galeria no products.json`); continue; }

  const v0 = vs[0];
  const ehEcobag = v0.garment === "Ecobag";
  // A Ecobag tem UM eixo só na loja, chamado Cor, com o valor "Bege". O CSV
  // registra isso como size="Bege" e color="". Antes eu sintetizava "Único" e
  // "Crua", rótulos que não existem em lugar nenhum: o POST mandava dois eixos
  // para um produto de um eixo e o item NÃO ENTRAVA no carrinho, sem erro
  // nenhum na tela (conferido no carrinho real em 01/08/2026). Era o único dos
  // 44 quebrado, e justamente o brinde do frete grátis.
  const cores = ehEcobag ? ["Bege"] : [...new Set(vs.map((v) => v.color).filter(Boolean))];
  const tamanhos = ehEcobag ? []   // um eixo só: o de Cor
    : [...new Set(vs.map((v) => v.size).filter(Boolean))].sort((a, b) => ORDEM_TAM.indexOf(a) - ORDEM_TAM.indexOf(b));

  // imagens: só família file_name-* (a -vitrine-nimbus- é o lote reprovado)
  const fotos = (g.gallery || []).map(urlImagem).filter((u) => u && u.includes("file_name-"));
  // curadoria manual (29/07): frente/costas POR COR, corrigindo os rótulos trocados do
  // products.json. Regra: capa = COSTAS da cor padrão (a arte), hover = FRENTE da MESMA cor.
  // Sem curadoria (curadoria por cor está adiada por ordem do dono, 30/07):
  // a foto da cor é a colorImages do products.json, a MESMA que a loja usa como
  // capa daquela cor; sem hover, para não piscar foto de outra cor no card.
  const cur = CURADORIA[pid] || CAPAS[pid] || {};
  const temCuradoria = Object.keys(cur).length > 0;
  const corImg = g.colorImages || {};
  const porCor = {};
  for (const cor of cores) {
    const frag = cur[cor] || {};
    let frente = frag.frente ? fotos.find((u) => u.includes(frag.frente)) : null;
    const costas = frag.costas ? fotos.find((u) => u.includes(frag.costas)) : null;
    if (!frente && !costas && corImg[cor]) {
      const u = urlImagem(corImg[cor]);
      if (u && u.includes("file_name-")) frente = fotos.find((f) => f === u) || u;
    }
    porCor[cor] = { frente: frente || null, costas: costas || null };
  }
  const pc0 = porCor[cores[0]] || {};
  const capa = pc0.costas || pc0.frente || fotos[0] || null;
  const hover = temCuradoria && capa && pc0.costas && pc0.frente ? pc0.frente : null;
  if (!capa) { erros.push(`${pid}: nenhuma foto da familia file_name-*`); continue; }
  if (temCuradoria && cores.some((c) => !porCor[c].costas && !porCor[c].frente))
    erros.push(`${pid}: curadoria nao casou com a galeria`);

  const preco = Number(v0.price_brl);
  const [arte, peca] = v0.product_title.split(" | ");
  const resumo = (c.description_html.match(/<p>(.*?)<\/p>/s)?.[1] || "").replace(/<[^>]+>/g, "").trim();

  const dispPorCor = {};
  for (const cor of cores) {
    dispPorCor[cor] = vs.filter((v) => (ehEcobag || v.color === cor) && v.available === "true")
      .map((v) => ({ variant_id: v.nuvemshop_variant_id, sku: v.sku, tamanho: ehEcobag ? "Único" : v.size, preco: Number(v.price_brl) }));
  }
  const padrao = (dispPorCor[cores[0]] || []).find((v) => ["M", "G", "P", "Único"].includes(v.tamanho)) || (dispPorCor[cores[0]] || [])[0];

  produtos.push({
    id: pid,
    destaque: HEROES.includes(pid),
    slug: g.slug,
    nome: v0.product_title,
    arte, peca,
    colecao: v0.collection.toLowerCase(),
    colecao_rotulo: ROTULO[v0.collection],
    preco,
    preco_formatado: brl(preco),
    url_loja: v0.product_url,
    resumo: resumo.slice(0, 180),
    descricao_html: c.description_html,
    meta_title: c.meta_title,
    meta_description: c.meta_description,
    ficha: {
      material: limpaFicha(t.material) || "", modelagem: limpaFicha(t.fit) || "", gola: limpaFicha(t.collar) || "",
      estampa: semMarcador(t.print), cuidados: semMarcador(t.care), medidas: semMarcador(t.measurements),
    },
    imagens: { capa, hover, galeria: fotos, por_cor: porCor, fonte_px: 500, caixa_max_css: 400 },
    opcoes: { tamanhos, cores },
    variantes_por_cor: dispPorCor,
    variante_padrao: padrao ? padrao.variant_id : null,
  });
}

const catalogo = {
  gerado_em: new Date().toISOString(),
  loja: { base: "https://loja.nimbuswear.com.br", frete_gratis_acima_de: 199 },
  colecoes: [
    { id: "street", rotulo: "STREET", resumo: "Grafite, spray e stencil. Fé com energia de rua." },
    { id: "reliquia", rotulo: "RELÍQUIA", resumo: "Band-tee devocional: halftone, barroco e ouro." },
    { id: "nuvem", rotulo: "NUVEM", resumo: "Céu, nuvens e auréolas. O DNA da marca." },
  ],
  produtos,
};

// gates
const json = JSON.stringify(catalogo, null, 1);
if (/http:\/\//.test(json)) erros.push("sobrou http:// no JSON");
if (produtos.length !== ENTRAM.length) erros.push(`esperava ${ENTRAM.length} produtos, saiu ${produtos.length}`);

if (erros.length) {
  console.error("ERROS:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
if (DRY) {
  for (const p of produtos)
    console.log(`${p.id} ${p.colecao_rotulo.padEnd(8)} ${p.preco_formatado.padEnd(9)} cores=${p.opcoes.cores.join("/")} fotos=${p.imagens.galeria.length} ${p.nome}`);
  console.log(`\nOK (dry): ${produtos.length} produtos, nada gravado`);
} else {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, json);
  console.log(`OK: ${SAIDA} com ${produtos.length} produtos`);
}

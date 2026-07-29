// Gera o HTML da vitrine a partir de public/loja-preview/catalogo.json.
// Nada em index.html, c/ ou p/ é editado à mão; o template é este arquivo.
//
// Uso: node scripts/vitrine/build-paginas.mjs
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const BASE = path.join(RAIZ, "public/loja-preview");
const cat = JSON.parse(fs.readFileSync(path.join(BASE, "catalogo.json"), "utf-8"));

const URL_BASE = "https://nimbuswear.com.br/loja-preview";
const PREFIXO = "/loja-preview";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------------------------------------------------------------- parciais */
const head = (titulo, descricao, opts = {}) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="robots" content="noindex">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
${opts.ogImage ? `<meta property="og:image" content="${esc(opts.ogImage)}">` : ""}
${opts.canonical ? `<link rel="canonical" href="${esc(opts.canonical)}">` : ""}
<link rel="icon" href="/img/favicon-48.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${PREFIXO}/css/tokens.css">
<link rel="stylesheet" href="${PREFIXO}/css/loja.css">
${opts.jsonld ? `<script type="application/ld+json">${opts.jsonld}</script>` : ""}
</head>
<body>`;

const header = `
<div class="announcement"><b>10% do lucro</b> do seu pedido vai para o projeto social que você escolher &nbsp;·&nbsp; frete grátis acima de R$199</div>
<header class="header">
  <nav class="header__nav">
    <a href="${PREFIXO}/c/street/">Street</a>
    <a href="${PREFIXO}/c/reliquia/">Relíquia</a>
    <a href="${PREFIXO}/c/nuvem/">Nuvem</a>
  </nav>
  <a class="header__logo" href="${PREFIXO}/"><img src="/img/wordmark-nimbus.webp" alt="NIMBUS" height="30"></a>
  <div class="header__tools">
    <a href="https://nimbuswear.com.br/" data-manifesto>Manifesto</a>
    <a href="https://loja.nimbuswear.com.br/carrinho/">Sacola</a>
  </div>
</header>`;

const footer = `
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__grid">
      <div class="footer__logo"><img src="/img/wordmark-nimbus.webp" alt="NIMBUS"><p class="note" style="color:#b8c6e6;margin-top:1em;max-width:26em">Streetwear católico premium brasileiro. Acima de tudo.</p></div>
      <div><h4>Loja</h4><a href="${PREFIXO}/c/street/">STREET</a><a href="${PREFIXO}/c/reliquia/">RELÍQUIA</a><a href="${PREFIXO}/c/nuvem/">NUVEM</a></div>
      <div><h4>A marca</h4><a href="https://nimbuswear.com.br/">Manifesto</a><a href="https://loja.nimbuswear.com.br/projetos-sociais/">Projetos sociais</a></div>
      <div><h4>Ajuda</h4><a href="https://loja.nimbuswear.com.br/carrinho/">Sacola</a><a href="https://loja.nimbuswear.com.br/">Loja oficial</a></div>
    </div>
    <div class="footer__meta">
      <span>© 2026 NIMBUS · nimbuswear.com.br</span>
      <span>Imagens de campanha. As fotos definitivas de produto estão em produção.</span>
    </div>
  </div>
</footer>`;

const card = (p) => `
<a class="card reveal" href="${PREFIXO}/p/${p.slug}/" data-peca="${esc(p.peca)}" data-preco="${p.preco}">
  <div class="card__midia">
    <img src="${esc(p.imagens.capa)}" alt="${esc(p.nome)}" width="500" height="500" loading="lazy" decoding="async">
    ${p.imagens.hover ? `<img class="card__hover" src="${esc(p.imagens.hover)}" alt="" width="500" height="500" loading="lazy" decoding="async">` : ""}
    <span class="card__pill">${esc(p.colecao_rotulo)}</span>
  </div>
  <div class="card__meta">
    <div><div class="card__nome">${esc(p.arte)}</div><div class="card__peca">${esc(p.peca)}</div></div>
    <div class="card__preco">${esc(p.preco_formatado)}</div>
  </div>
</a>`;

/* -------------------------------------------------------------------- home */
const PROJETOS = [
  { id: "fazenda", nome: "Fazenda da Esperança", img: "/img/projects/fazenda-esperanca.webp", desc: "Recuperação de dependentes químicos em comunidades por todo o Brasil." },
  { id: "caritas", nome: "Cáritas Brasileira", img: "/img/projects/caritas-brasileira.webp", desc: "Rede da Igreja no combate à fome e à pobreza, presente no país inteiro." },
  { id: "cotolengo", nome: "Pequeno Cotolengo", img: "/img/projects/pequeno-cotolengo.webp", desc: "Acolhimento de pessoas com deficiência em situação de abandono." },
];

const home = () => `${head("NIMBUS | Streetwear católico premium", "Fé reverente, design autoral e acabamento premium. STREET, RELÍQUIA e NUVEM. 10% do lucro vai para o projeto social que você escolher.")}
${header}
<main>
  <section class="hero">
    <img class="hero__bg" src="${PREFIXO}/media/hero-editorial-1600.webp" alt="" fetchpriority="high">
    <div class="hero__copy">
      <div class="kicker kicker--gold reveal in">Acima de tudo</div>
      <h1 class="display reveal in">Entre o concreto e o céu.</h1>
      <p class="lede reveal in" style="margin-top:1em">Streetwear católico premium, desenhado e produzido no Brasil. Fé que se veste bem.</p>
      <div class="hero__cta reveal in">
        <a class="btn btn--primary" href="#colecoes">Ver as coleções</a>
        <a class="btn btn--ghost" href="https://nimbuswear.com.br/">O manifesto</a>
      </div>
    </div>
  </section>

  <div class="trust"><div class="trust__inner">
    <span>Produção brasileira sob demanda</span>
    <span>Pix, boleto e cartão na loja oficial</span>
    <span>10% do lucro doado ao projeto que você escolher</span>
  </div></div>

  <section class="secao" id="colecoes"><div class="secao__inner">
    <div class="secao__head">
      <div><div class="kicker">Três coleções, um mesmo horizonte</div><h2 class="display--md display">Coleções</h2></div>
    </div>
    <div class="colecoes">
      ${cat.colecoes.map((c) => `
      <a class="tile reveal" data-colecao="${c.id}" href="${PREFIXO}/c/${c.id}/">
        <img class="tile__bg" src="${PREFIXO}/media/colecao-${c.id}-900.webp" alt="" loading="lazy">
        <div class="tile__copy"><div class="tile__nome">${esc(c.rotulo)}</div><div class="tile__resumo">${esc(c.resumo)}</div></div>
      </a>`).join("")}
    </div>
  </div></section>

  <section class="secao" style="padding-top:0"><div class="secao__inner">
    <div class="secao__head">
      <div><div class="kicker">Essenciais</div><h2 class="display--md display">O começo de tudo</h2></div>
    </div>
    <div class="grade">${cat.produtos.map(card).join("")}</div>
  </div></section>

  <section class="secao" style="background:#fff"><div class="secao__inner banda">
    <div class="banda__midia reveal"><img src="${PREFIXO}/media/caimento-costas-1400.webp" alt="Estudo de caimento e área de estampa da modelagem oversized" loading="lazy"></div>
    <div class="reveal">
      <div class="kicker">A peça</div>
      <h2 class="display display--md">Cada peça é arquitetura.</h2>
      <p class="lede" style="margin-top:0.8em">Modelagem oversized de ombro caído, malha pesada de algodão penteado e estampa posicionada com medida, não no olho. O caimento é projeto.</p>
      <p class="note" style="margin-top:1em">Estudo de caimento e área de estampa da modelagem oversized.</p>
    </div>
  </div></section>

  <section class="secao banda--manifesto"><div class="secao__inner banda">
    <div class="reveal">
      <div class="kicker kicker--gold">Fé que se veste bem</div>
      <h2 class="display display--md">Reverência não é sussurro.</h2>
      <p class="lede" style="margin-top:0.8em;color:#dcebfa">A NIMBUS nasce entre o concreto modernista e o céu do Brasil. Cada estampa trata a fé com a seriedade de quem acredita e o acabamento de quem respeita quem veste.</p>
    </div>
    <div class="banda__midia reveal"><img src="${PREFIXO}/media/editorial-street-1200.webp" alt="Casting NIMBUS" loading="lazy"></div>
  </div></section>

  <section class="secao"><div class="secao__inner">
    <div class="impacto reveal">
      <div class="kicker">Impacto</div>
      <h2 class="display display--md">Acima de tudo, o próximo.</h2>
      <p class="lede" style="margin-top:0.8em">10% do lucro de cada pedido vai para um projeto social escolhido por você, no checkout. Repasse mensal, com comprovação.</p>
      <div class="impacto__grid">
        ${PROJETOS.map((pr) => `
        <div class="impacto__card">
          <h3>${pr.nome}</h3>
          <p class="note">${pr.desc}</p>
          <button class="btn btn--ghost" style="margin-top:0.9em;padding:0.5em 1.2em;font-size:0.8rem" data-abre-dialog="dlg-${pr.id}">Conhecer</button>
        </div>`).join("")}
      </div>
    </div>
  </div></section>

  ${PROJETOS.map((pr) => `
  <dialog class="projeto" id="dlg-${pr.id}">
    <img src="${pr.img}" alt="" style="border-radius:12px;margin-bottom:1em">
    <h3 class="display display--md" style="font-size:1.6rem">${pr.nome}</h3>
    <p class="note" style="margin:0.8em 0 1.2em">${pr.desc} Você escolhe este projeto no campo de mensagem do checkout, e o repasse de 10% do lucro é feito mensalmente, com comprovação pública.</p>
    <form method="dialog"><button class="btn btn--primary">Fechar</button></form>
  </dialog>`).join("")}
</main>
${footer}
<script src="${PREFIXO}/js/ui.js" defer></script>
</body></html>`;

/* ----------------------------------------------------------------- colecao */
const colecao = (c) => {
  const produtos = cat.produtos.filter((p) => p.colecao === c.id);
  const pecas = [...new Set(produtos.map((p) => p.peca))];
  return `${head(`${c.rotulo} | NIMBUS`, c.resumo, { canonical: `${URL_BASE}/c/${c.id}/` })}
${header}
<main>
  <section class="cabecalho-colecao" data-colecao="${c.id}">
    <img class="cabecalho-colecao__bg" src="${PREFIXO}/media/colecao-${c.id}-900.webp" alt="">
    <div class="cabecalho-colecao__copy">
      <div class="kicker kicker--gold">Coleção</div>
      <h1 class="display">${esc(c.rotulo)}</h1>
      <p class="lede" style="margin-top:0.5em">${esc(c.resumo)}</p>
    </div>
  </section>
  <section class="secao" style="padding-top:1.5em"><div class="secao__inner" style="max-width:var(--maxw-listagem)">
    <div class="filtros">
      <button class="chip" data-peca="todas" aria-pressed="true">Todas</button>
      ${pecas.map((pc) => `<button class="chip" data-peca="${esc(pc)}" aria-pressed="false">${esc(pc.replace("Camiseta ", "").replace(" Premium", ""))}</button>`).join("")}
      <select data-ordenar aria-label="Ordenar">
        <option value="destaque">Destaques</option>
        <option value="menor">Menor preço</option>
        <option value="maior">Maior preço</option>
      </select>
    </div>
    <div class="grade" data-grade>${produtos.map(card).join("")}</div>
  </div></section>
</main>
${footer}
<script src="${PREFIXO}/js/ui.js" defer></script>
<script src="${PREFIXO}/js/vitrine.js" defer></script>
</body></html>`;
};

/* ----------------------------------------------------------------- produto */
const produto = (p) => {
  const dados = {
    url_loja: p.url_loja, imagens: p.imagens, opcoes: p.opcoes,
    variantes_por_cor: p.variantes_por_cor,
  };
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product",
    name: p.nome, image: p.imagens.galeria, description: p.resumo,
    brand: { "@type": "Brand", name: "NIMBUS" },
    offers: { "@type": "Offer", priceCurrency: "BRL", price: p.preco, availability: "https://schema.org/InStock", url: p.url_loja },
  });
  const CORES_HEX = { Preta: "#16181d", Branca: "#f4f4f2", "Off-White": "#ece5d8", Bege: "#d9c9a8", Crua: "#e6dcc4" };
  return `${head(p.meta_title, p.meta_description, { ogImage: p.imagens.capa, canonical: `${URL_BASE}/p/${p.slug}/`, jsonld })}
${header}
<main>
  <section class="secao" style="padding-top:2em"><div class="secao__inner pdp">
    <div class="pdp__palco" data-colecao="${p.colecao}">
      <div class="pdp__quadro"><img src="${esc(p.imagens.capa)}" alt="${esc(p.nome)}" width="500" height="500" fetchpriority="high"></div>
      ${p.imagens.galeria.length > 1 ? `<div class="pdp__thumbs">
        ${p.imagens.galeria.map((g, i) => `<button data-src="${esc(g)}" aria-pressed="${i === 0}"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join("")}
      </div>` : ""}
      <figure class="pdp__arte">
        <img src="${PREFIXO}/media/colecao-${p.colecao}-900.webp" alt="Detalhe da linguagem gráfica da coleção ${esc(p.colecao_rotulo)}" loading="lazy">
        <figcaption>A linguagem da coleção ${esc(p.colecao_rotulo)}</figcaption>
      </figure>
    </div>
    <div class="pdp__info">
      <div class="kicker kicker--gold">${esc(p.colecao_rotulo)}</div>
      <h1>${esc(p.arte)}</h1>
      <div class="pdp__peca">${esc(p.peca)}</div>
      <div class="pdp__preco">${esc(p.preco_formatado)}</div>
      <p class="pdp__resumo note" style="font-size:0.95rem">${esc(p.resumo)}</p>

      ${p.opcoes.cores.length > 1 || p.opcoes.cores[0] !== "Crua" ? `
      <div class="opcao"><div class="opcao__rotulo">Cor</div>
        <div class="swatches">
          ${p.opcoes.cores.map((c, i) => `<button class="swatch" data-cor="${esc(c)}" aria-pressed="${i === 0}" aria-label="${esc(c)}" title="${esc(c)}" style="background:${CORES_HEX[c] || "#ccc"}"></button>`).join("")}
        </div>
      </div>` : ""}

      <div class="opcao"><div class="opcao__rotulo">Tamanho</div>
        <div class="tamanhos">
          ${p.opcoes.tamanhos.map((t) => `<button class="tamanho" data-tamanho="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("")}
        </div>
      </div>

      <a class="btn btn--primary pdp__comprar" href="${esc(p.url_loja)}">Comprar na loja</a>
      <div class="pdp__notas">
        <span class="note">Frete grátis acima de R$199.</span>
        <span class="note">Produzida sob demanda no Brasil.</span>
      </div>
      <a class="pdp__loja" href="${esc(p.url_loja)}">Ver na loja oficial</a>

      <div class="pdp__detalhes">
        ${p.ficha.material ? `<details open><summary>A peça</summary><p class="note">${esc(p.ficha.material)}. ${esc(p.ficha.modelagem)}. ${esc(p.ficha.gola)}.</p></details>` : ""}
        ${p.ficha.medidas ? `<details><summary>Medidas</summary><p class="note">${esc(p.ficha.medidas)}</p></details>` : ""}
        ${p.ficha.cuidados ? `<details><summary>Cuidados</summary><p class="note">${esc(p.ficha.cuidados)}</p></details>` : ""}
        <details><summary>Produção e envio</summary><p class="note">Produção sob demanda em até alguns dias úteis, mais o prazo do frete do seu CEP. O prazo exato aparece no checkout da loja oficial.</p></details>
      </div>

      <div class="pdp__impacto"><b>Esta peça destina 10% do lucro</b> ao projeto social da sua escolha, no checkout.</div>
    </div>
  </div></section>
</main>
${footer}
<script type="application/json" id="produto-dados">${JSON.stringify(dados)}</script>
<script src="${PREFIXO}/js/ui.js" defer></script>
<script src="${PREFIXO}/js/produto.js" defer></script>
</body></html>`;
};

/* ------------------------------------------------------------------ grava */
fs.writeFileSync(path.join(BASE, "index.html"), home());
for (const c of cat.colecoes) {
  const dir = path.join(BASE, "c", c.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), colecao(c));
}
for (const p of cat.produtos) {
  const dir = path.join(BASE, "p", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), produto(p));
}
console.log(`OK: home + ${cat.colecoes.length} coleções + ${cat.produtos.length} produtos gerados em public/loja-preview/`);

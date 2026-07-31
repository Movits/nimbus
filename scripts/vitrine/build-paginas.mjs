// Gera o HTML da vitrine a partir de public/loja/catalogo.json.
// Nada em index.html, c/ ou p/ é editado à mão; o template é este arquivo.
//
// Uso: node scripts/vitrine/build-paginas.mjs
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const BASE = path.join(RAIZ, "public/loja");
const cat = JSON.parse(fs.readFileSync(path.join(BASE, "catalogo.json"), "utf-8"));

const URL_BASE = "https://nimbuswear.com.br/loja";
const PREFIXO = "/loja";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Todo link para a loja carrega UTM (condição do conselho, 29/07), preservando
// o que a URL já tiver (?variant= etc.). medium = de onde partiu o clique.
const utm = (url, medium, campanha = "vitrine") => {
  const u = new URL(url);
  u.searchParams.set("utm_source", "vitrine");
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", campanha);
  return u.toString();
};
const SACOLA = (medium) => utm("https://loja.nimbuswear.com.br/comprar/", medium);

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

// header/footer são funções do medium para o UTM sair certo por tipo de página
const header = (medium) => `
<div class="announcement"><b>10% do lucro</b> do seu pedido vai para o projeto social que você escolher &nbsp;·&nbsp; frete grátis acima de R$199</div>
<header class="header">
  <a class="header__logo" href="${PREFIXO}/"><img src="/img/wordmark-nimbus.webp" alt="NIMBUS"></a>
  <nav class="header__nav">
    <a href="${PREFIXO}/c/street/">Street</a>
    <a href="${PREFIXO}/c/reliquia/">Relíquia</a>
    <a href="${PREFIXO}/c/nuvem/">Nuvem</a>
  </nav>
  <div class="header__tools">
    <a href="https://nimbuswear.com.br/" data-manifesto>Manifesto</a>
    <a class="header__cta" href="${esc(SACOLA(medium))}">Sacola<span class="sacola-n" data-sacola-n hidden></span></a>
  </div>
</header>`;

// réplica do rodapé da loja publicada: corpo claro com borda dourada, colunas
// com título serif, faixa legal navy. Tagline idêntica à da loja.
const footer = (medium) => `
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__grid">
      <div class="footer__logo"><img src="/img/wordmark-nimbus.webp" alt="NIMBUS"><p class="footer__tagline">Streetwear católico premium, feito no Brasil. 10% do lucro é destinado ao projeto social escolhido por você.</p></div>
      <div><h4>Loja</h4><a href="${PREFIXO}/c/street/">STREET</a><a href="${PREFIXO}/c/reliquia/">RELÍQUIA</a><a href="${PREFIXO}/c/nuvem/">NUVEM</a><a href="${esc(SACOLA(medium))}">Sacola</a></div>
      <div><h4>Nimbus</h4><a href="https://nimbuswear.com.br/">Manifesto</a><a href="${esc(utm("https://loja.nimbuswear.com.br/projetos-sociais/", medium))}">Projetos Sociais</a></div>
      <div><h4>Ajuda</h4><a href="${esc(utm("https://loja.nimbuswear.com.br/contato/", medium))}">Trocas e devoluções</a><a href="${esc(utm("https://loja.nimbuswear.com.br/contato/", medium))}">Envios e prazos</a><a href="mailto:nimbuswearbr@gmail.com">Fale com a NIMBUS</a></div>
    </div>
  </div>
  <div class="footer__legal">
    <span>© 2026 NIMBUS · nimbuswear.com.br</span>
    <span>Imagens de campanha. As fotos definitivas de produto estão em produção.</span>
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
const home = () => `${head("NIMBUS | Streetwear católico premium", "Fé reverente, design autoral e acabamento premium. STREET, RELÍQUIA e NUVEM. 10% do lucro vai para o projeto social que você escolher.")}
${header("home")}
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
    <span>Feita no Brasil, para você</span>
    <span>Pagamento seguro: Pix, boleto e cartão em até 12x</span>
    <span>10% do lucro doado ao projeto que você escolher</span>
  </div></div>

  <section class="secao" id="colecoes"><div class="secao__inner">
    <div class="secao__head">
      <div><div class="kicker">Três coleções, um mesmo horizonte</div><h2 class="display--md display">Coleções</h2></div>
    </div>
    <div class="colecoes">
      ${cat.colecoes.map((c) => `
      <a class="tile reveal" data-colecao="${c.id}" href="${PREFIXO}/c/${c.id}/">
        <img class="tile__bg" src="${PREFIXO}/media/cenario-${c.id}-1600.webp" alt="" loading="lazy">
        <div class="tile__copy"><div class="tile__nome">${esc(c.rotulo)}</div><div class="tile__resumo">${esc(c.resumo)}</div></div>
      </a>`).join("")}
    </div>
  </div></section>

  <section class="secao" style="padding-top:0"><div class="secao__inner">
    <div class="secao__head">
      <div><div class="kicker">Essenciais</div><h2 class="display--md display">O começo de tudo</h2></div>
      <a class="btn btn--ghost" href="${PREFIXO}/c/street/">Ver tudo por coleção</a>
    </div>
    <div class="grade">${cat.produtos.filter((p) => p.destaque).map(card).join("")}</div>
  </div></section>

  <section class="secao banda--manifesto"><div class="secao__inner banda">
    <div class="reveal" style="max-width:44em">
      <div class="kicker kicker--gold">Fé que se veste bem</div>
      <h2 class="display display--md">Reverência não é sussurro.</h2>
      <p class="lede" style="margin-top:0.8em;color:#dcebfa">A NIMBUS nasce entre o concreto modernista e o céu do Brasil. Cada estampa trata a fé com a seriedade de quem acredita e o acabamento de quem respeita quem veste.</p>
    </div>
    <div class="banda__midia reveal"><img src="${PREFIXO}/media/manifesto-1600.webp" alt="Camiseta preta oversized num beco de concreto em São Paulo" loading="lazy"></div>
  </div></section>

  <section class="secao"><div class="secao__inner">
    <div class="secao__head reveal">
      <div><div class="kicker">Do pedido à porta</div><h2 class="display display--md">Como a sua peça nasce</h2></div>
    </div>
    <ol class="passos">
      <li class="reveal"><b>Você escolhe.</b><p>A arte, a peça, a cor e o tamanho, aqui na vitrine. O pagamento fecha na loja, com Pix, boleto ou cartão em até 12x.</p></li>
      <li class="reveal"><b>Ela é feita no Brasil, para você.</b><p>Estampa posicionada com medida, não no olho, e acabamento premium, peça a peça.</p></li>
      <li class="reveal"><b>Chega com rastreio.</b><p>E 10% do lucro do pedido vai para o projeto social que você escolher no checkout, com repasse mensal e comprovação.</p></li>
    </ol>
  </div></section>
</main>
${footer("home")}
<script src="${PREFIXO}/js/ui.js" defer></script>
</body></html>`;

/* ----------------------------------------------------------------- colecao */
const colecao = (c) => {
  const produtos = cat.produtos.filter((p) => p.colecao === c.id);
  const pecas = [...new Set(produtos.map((p) => p.peca))];
  return `${head(`${c.rotulo} | NIMBUS`, c.resumo, { canonical: `${URL_BASE}/c/${c.id}/` })}
${header("colecao")}
<main>
  <section class="cabecalho-colecao" data-colecao="${c.id}">
    <img class="cabecalho-colecao__bg" src="${PREFIXO}/media/cenario-${c.id}-1600.webp" alt="">
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
${footer("colecao")}
<script src="${PREFIXO}/js/ui.js" defer></script>
<script src="${PREFIXO}/js/vitrine.js" defer></script>
</body></html>`;
};

/* ----------------------------------------------------------------- produto */
const produto = (p) => {
  const urlLoja = utm(p.url_loja, "pdp", p.slug);
  const dados = {
    url_loja: urlLoja, url_carrinho: SACOLA("pdp"), imagens: p.imagens,
    opcoes: p.opcoes, variantes_por_cor: p.variantes_por_cor,
  };
  // galeria com a cor padrão primeiro (costas = arte, depois frente), para os
  // thumbs abrirem coerentes com a capa
  const pc0 = p.imagens.por_cor[p.opcoes.cores[0]] || {};
  const galeria = [pc0.costas, pc0.frente, ...p.imagens.galeria.filter((u) => u !== pc0.costas && u !== pc0.frente)].filter(Boolean);
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product",
    name: p.nome, image: p.imagens.galeria, description: p.resumo,
    brand: { "@type": "Brand", name: "NIMBUS" },
    offers: { "@type": "Offer", priceCurrency: "BRL", price: p.preco, availability: "https://schema.org/InStock", url: p.url_loja },
  });
  const CORES_HEX = { Preta: "#16181d", Branca: "#f4f4f2", "Off-White": "#ece5d8", Bege: "#d9c9a8", Crua: "#e6dcc4" };
  return `${head(p.meta_title, p.meta_description, { ogImage: p.imagens.capa, canonical: `${URL_BASE}/p/${p.slug}/`, jsonld })}
${header("pdp")}
<main>
  <section class="secao" style="padding-top:2em"><div class="secao__inner pdp">
    <div class="pdp__palco" data-colecao="${p.colecao}">
      <div class="pdp__quadro"><img src="${esc(p.imagens.capa)}" alt="${esc(p.nome)}" width="500" height="500" fetchpriority="high"></div>
      ${galeria.length > 1 ? `<div class="pdp__thumbs">
        ${galeria.map((g, i) => `<button data-src="${esc(g)}" aria-pressed="${i === 0}"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join("")}
      </div>` : ""}
      <figure class="pdp__cenario">
        <img src="${PREFIXO}/media/cenario-${p.colecao}-1600.webp" alt="Cenário da coleção ${esc(p.colecao_rotulo)}" loading="lazy">
        <figcaption>O território da coleção ${esc(p.colecao_rotulo)}</figcaption>
      </figure>
    </div>
    <div class="pdp__info">
      <div class="kicker kicker--gold">${esc(p.colecao_rotulo)}</div>
      <h1>${esc(p.arte)}</h1>
      <div class="pdp__peca">${esc(p.peca)}</div>
      <div class="pdp__preco">${esc(p.preco_formatado)}</div>
      <p class="pdp__resumo note" style="font-size:0.95rem">${esc(p.resumo)}</p>

      ${p.opcoes.cores.length > 1 || p.opcoes.cores[0] !== "Crua" ? `
      <div class="opcao"><div class="opcao__rotulo">Cor<span class="opcao__valor" data-cor-nome>${esc(p.opcoes.cores[0])}</span></div>
        <div class="swatches">
          ${p.opcoes.cores.map((c, i) => `<button class="swatch" data-cor="${esc(c)}" aria-pressed="${i === 0}" aria-label="${esc(c)}" title="${esc(c)}" style="background:${CORES_HEX[c] || "#ccc"}"></button>`).join("")}
        </div>
      </div>` : ""}

      <div class="opcao"><div class="opcao__rotulo">Tamanho</div>
        <div class="tamanhos">
          ${p.opcoes.tamanhos.map((t) => `<button class="tamanho" data-tamanho="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("")}
        </div>
      </div>

      <!-- mesmo POST do formulário oficial da loja (fluxo do dono, 30/07):
           adiciona à sacola sem sair da vitrine; o handoff acontece na Sacola.
           Sem JS, o POST abre o carrinho da loja em aba nova, já com o item. -->
      <form class="pdp__form" method="post" action="${esc(utm("https://loja.nimbuswear.com.br/comprar/", "pdp", p.slug))}" target="_blank" data-sacola-form>
        <input type="hidden" name="add_to_cart" value="${esc(p.id)}">
        <input type="hidden" name="variation[0]" value="${esc(p.opcoes.tamanhos[0])}" data-var-tamanho>
        <input type="hidden" name="variation[1]" value="${esc(p.opcoes.cores[0])}" data-var-cor>
        <input type="hidden" name="quantity" value="1">
        <button type="submit" class="btn btn--primary pdp__comprar">Adicionar à sacola</button>
      </form>
      <span class="avisa-tamanho" data-avisa-tamanho>Escolha um tamanho para adicionar.</span>
      <div class="pdp__notas">
        <span class="note">Frete grátis acima de R$199. Pix, boleto e cartão em até 12x.</span>
        <span class="note">Feita no Brasil, para você.</span>
      </div>

      <div class="pdp__detalhes">
        ${p.ficha.material ? `<details open><summary>A peça</summary><p class="note">${esc(p.ficha.material)}. ${esc(p.ficha.modelagem)}. ${esc(p.ficha.gola)}.</p></details>` : ""}
        ${p.ficha.medidas ? `<details><summary>Medidas</summary><p class="note">${esc(p.ficha.medidas)}</p></details>` : ""}
        ${p.ficha.cuidados ? `<details><summary>Cuidados</summary><p class="note">${esc(p.ficha.cuidados)}</p></details>` : ""}
        <details><summary>Prazo e envio</summary><p class="note">Feita no Brasil, com rastreio. Chega, após a confirmação do pagamento: São Paulo, 3 a 5 dias úteis; Sudeste, 4 a 6; Sul e Centro-Oeste, 5 a 7; Norte e Nordeste, 6 a 12. O prazo do checkout para o seu CEP prevalece.</p></details>
      </div>

      <div class="pdp__impacto"><b>Esta peça destina 10% do lucro</b> ao projeto social da sua escolha, no checkout.</div>
    </div>
  </div></section>
</main>
${footer("pdp")}
<script type="application/json" id="produto-dados">${JSON.stringify(dados)}</script>
<script src="${PREFIXO}/js/ui.js" defer></script>
<script src="${PREFIXO}/js/produto.js" defer></script>
</body></html>`;
};

/* ------------------------------------------------------------------- gates */
// Sala de aprovação do dono: fora do menu, noindex, um lote por rodada.
// O conteúdo vem de scripts/vitrine/gates.json; imagem só entra nas páginas
// da loja depois de aprovada aqui.
const gates = () => {
  const g = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "gates.json"), "utf-8"));
  return `${head("Gates | NIMBUS (interno)", "Lote de imagens da rodada, para aprovação.")}
${header("gates")}
<main>
  <section class="secao"><div class="secao__inner">
    <div class="secao__head">
      <div><div class="kicker">Interno · ${esc(g.rodada)}</div><h1 class="display display--md">Sala de aprovação</h1></div>
    </div>
    <p class="note" style="max-width:52em">${esc(g.nota)}</p>
    <div class="gates">
      ${g.itens.map((i) => `
      <figure class="gate reveal">
        <img src="${PREFIXO}/media/${esc(i.media)}" alt="${esc(i.titulo)}" loading="lazy">
        <figcaption>
          <div class="gate__titulo">${esc(i.titulo)} <span class="card__pill">${esc(i.situacao)}</span></div>
          <p class="note">${esc(i.pergunta)}</p>
        </figcaption>
      </figure>`).join("")}
    </div>
  </div></section>
</main>
${footer("gates")}
<script src="${PREFIXO}/js/ui.js" defer></script>
</body></html>`;
};

/* ------------------------------------------------------------------ grava */
// A vitrine viveu em /loja-preview/ até 30/07; links antigos (WhatsApp, menu da
// loja) continuam chegando lá. Cada página ganha um stub de redirect no caminho
// antigo (o 404.html cobre qualquer rota que escapar).
const stub = (rel) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url=${PREFIXO}/${rel}">
<link rel="canonical" href="${URL_BASE}/${rel}">
<script>location.replace("${PREFIXO}/${rel}" + location.search + location.hash);</script>
<title>NIMBUS</title>
</head>
<body><p>A vitrine mudou de endereço. <a href="${PREFIXO}/${rel}">Continuar para a loja</a>.</p></body></html>`;
const ANTIGO = path.join(RAIZ, "public/loja-preview");
const relForStub = ["", "gates/", "teste-carrinho/",
  ...cat.colecoes.map((c) => `c/${c.id}/`),
  ...cat.produtos.map((p) => `p/${p.slug}/`)];
for (const rel of relForStub) {
  const dir = path.join(ANTIGO, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), stub(rel));
}

fs.writeFileSync(path.join(BASE, "index.html"), home());
fs.mkdirSync(path.join(BASE, "gates"), { recursive: true });
fs.writeFileSync(path.join(BASE, "gates", "index.html"), gates());
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
console.log(`OK: home + gates + ${cat.colecoes.length} coleções + ${cat.produtos.length} produtos gerados em public/loja/`);

// Gera o HTML da vitrine a partir de public/loja/catalogo.json.
// Nada em index.html, c/ ou p/ é editado à mão; o template é este arquivo.
//
// Uso: node scripts/vitrine/build-paginas.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");

// Versão dos ativos: todo deploy com CSS/JS mudado troca a URL e fura o cache
// de 10 min do GitHub Pages e o cache do navegador (dono viu CSS velho, 31/07).
const ATIVOS = ["css/tokens.css", "css/loja.css", "js/ui.js", "js/vitrine.js", "js/produto.js"]
  .map((f) => path.resolve(import.meta.dirname, "..", "..", "public/loja", f));
// Hash sobre o conteúdo com fim de linha normalizado: o checkout Windows
// materializa CRLF (autocrlf) e o do CI materializa LF; hashear os bytes crus
// dava um ?v= diferente por plataforma e derrubava o portão de
// reprodutibilidade do deploy.
const V = crypto.createHash("md5")
  .update(ATIVOS.map((f) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n")).join("\n"), "utf8")
  .digest("hex").slice(0, 8);
const BASE = path.join(RAIZ, "public/loja");
const cat = JSON.parse(fs.readFileSync(path.join(BASE, "catalogo.json"), "utf-8"));

const URL_BASE = "https://nimbuswear.com.br/loja";
const PREFIXO = "/loja";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Todo link interno para a loja leva ref=vitrine, parâmetro NEUTRO para o GA4
// (P0-1 do conselho r4, 03/08). Era utm_* desde 29/07; com a tag entrando no
// domínio da loja, utm interno reatribuiria a "vitrine" cada compra vinda de
// campanha, no exato clique do checkout. utm_* fica reservado a campanha
// externa. Preserva o que a URL já tiver (?variant= etc.).
const refInterno = (url) => {
  const u = new URL(url);
  u.searchParams.set("ref", "vitrine");
  return u.toString();
};
const SACOLA = refInterno("https://loja.nimbuswear.com.br/comprar/");

/* A vitrine fica FORA do índice do Google enquanto a loja não vende: o dono só
   abre quando tiver fotos com modelo. Esta chave governa as duas pontas ao mesmo
   tempo, o <meta robots> de cada página e o que entra no sitemap. Antes elas
   eram independentes e se contradiziam: o sitemap convidava o Google para 52
   páginas que respondiam noindex, o que renderia 52 erros no Search Console.
   Para abrir a loja ao Google, basta virar esta linha para true. */
const VITRINE_INDEXAVEL = false;
// VITRINE FECHADA (ordem do dono, 14/08/2026): catálogo YouDraw fora do ar
// durante a remontagem IzzyPrint. Home vira página de remontagem; header e
// footer perdem coleções e Sacola; institucionais continuam no ar. Reabrir =
// true aqui + restaurar ENTRAM no build-catalogo.mjs + npm run vitrine.
const VITRINE_ABERTA = false;

/* ---------------------------------------------------------------- parciais */
const head = (titulo, descricao, opts = {}) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${VITRINE_INDEXAVEL && !opts.semIndice ? "" : '<meta name="robots" content="noindex">\n'}<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:type" content="${opts.ogType || "website"}">
<meta property="og:site_name" content="NIMBUS">
<meta property="og:locale" content="pt_BR">
${opts.canonical ? `<meta property="og:url" content="${esc(opts.canonical)}">` : ""}
<meta property="og:image" content="${esc(opts.ogImage || "https://nimbuswear.com.br/img/hero-desktop.webp")}">
<meta name="twitter:card" content="summary_large_image">
${opts.canonical ? `<link rel="canonical" href="${esc(opts.canonical)}">` : ""}
<link rel="icon" href="/img/favicon-48.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script>document.documentElement.className+=" js";setTimeout(function(){document.querySelectorAll(".reveal:not(.in)").forEach(function(e){e.classList.add("in")})},2000)</script>
<link rel="stylesheet" href="${PREFIXO}/css/tokens.css?v=${V}">
<link rel="stylesheet" href="${PREFIXO}/css/loja.css?v=${V}">
${opts.jsonld ? `<script type="application/ld+json">${opts.jsonld}</script>` : ""}${ga4()}${pixels()}
</head>
<body>`;

// GA4: ID de métricas da propriedade Nimbus, criada pelo dono em 31/07. A
// página de privacidade entrou no ar antes (condição do conselho r3).
const GA4_ID = "G-E041S3ZHWB";
const ga4 = () => GA4_ID ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA4_ID}');</script>` : "";

// Meta Pixel e TikTok Pixel (condição 4 do conselho r5, 12/08, Marina Duarte).
// Os IDs vivem nas contas do dono (Gerenciador de Eventos da Meta e TikTok Ads
// Manager) e ainda não chegaram: com a constante VAZIA nada é injetado, `fbq` e
// `ttq` não existem na página e os disparos de ui.js viram no-op. Preencher a
// constante é o único passo que falta do lado do código; a partir daí o portão
// vitrine:tracking passa a exigir as linhas dos eventos de pixel como `ativo`
// no tracking-plan, no mesmo commit (scripts/vitrine/lint-tracking.mjs).
// Os eventos de conversão saem de ui.js (NIMBUS.pixel), com o MESMO item_id do
// GA4 (condição 29). O pixel da LOJA e a API de Conversões são do dono:
// docs/fluxos/pixels-meta-tiktok.md.
const META_PIXEL_ID = "";
const TIKTOK_PIXEL_ID = "";
const pixels = () => `${META_PIXEL_ID ? `
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');</script>` : ""}${TIKTOK_PIXEL_ID ? `
<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(o,m){o[m]=function(){o.callMethod?o.callMethod.apply(o,arguments):o.queue.push([m].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(e){var o=ttq._i[e]||[];for(var n=0;n<ttq.methods.length;n++)ttq.setAndDefer(o,ttq.methods[n]);return o};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK_PIXEL_ID}');ttq.page()}(window,document,'ttq');</script>` : ""}`;

// O cabeçalho de coleção é uma faixa larga sobre foto panorâmica: sem foco por
// coleção, o cover de tela larga corta o assunto (a igreja da RELÍQUIA virava
// laje de parede a 1920). Cada valor mira o assunto da respectiva arte.
const FOCO_COLECAO = { street: "50% 62%", reliquia: "50% 40%", nuvem: "50% 70%" };

const header = () => `
<div class="announcement"><a href="${PREFIXO}/impacto/"><b>10% do lucro</b> do seu pedido vai para o projeto social que você escolher</a>${VITRINE_ABERTA ? ` &nbsp;·&nbsp; frete grátis a partir de R$399,90` : ""}</div>
<header class="header">
  <a class="header__logo" href="${PREFIXO}/"><img src="/img/wordmark-nimbus.webp" alt="NIMBUS"></a>
  ${VITRINE_ABERTA ? `<nav class="header__nav">
    <a href="${PREFIXO}/c/street/">Street</a>
    <a href="${PREFIXO}/c/reliquia/">Relíquia</a>
    <a href="${PREFIXO}/c/nuvem/">Nuvem</a>
  </nav>` : ""}
  <div class="header__tools">
    <a href="${PREFIXO}/manifesto/" data-manifesto>Manifesto</a>
    ${VITRINE_ABERTA ? `<a class="header__cta" href="${esc(SACOLA)}" data-abre-sacola>Sacola<span class="sacola-n" data-sacola-n hidden></span></a>` : ""}
  </div>
</header>`;

// A celebração da gaveta (ui.js) oferece as Ecobags do catálogo com foto e
// botão de adicionar (P0-3 do conselho r4, decisão do dono em 03/08). Os dados
// saem daqui, do catalogo.json, para o ui.js não duplicar id, preço nem foto.
const ECOBAGS = cat.produtos.filter((p) => p.peca === "Ecobag").map((p) => ({
  slug: p.slug, id: p.id, nome: p.nome, cor: p.opcoes.cores[0] || "",
  preco: p.preco, preco_formatado: p.preco_formatado,
  img: p.imagens.capa, url: `${PREFIXO}/p/${p.slug}/`,
}));

// réplica do rodapé da loja publicada: corpo claro com borda dourada, colunas
// com título serif, faixa legal navy. Tagline idêntica à da loja.
const footer = () => `
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__grid">
      <div class="footer__logo"><img src="/img/wordmark-nimbus.webp" alt="NIMBUS"><p class="footer__tagline">Streetwear católico premium, feito no Brasil. 10% do lucro é destinado ao projeto social escolhido por você.</p></div>
      ${VITRINE_ABERTA ? `<div><h4>Loja</h4><a href="${PREFIXO}/c/street/">STREET</a><a href="${PREFIXO}/c/reliquia/">RELÍQUIA</a><a href="${PREFIXO}/c/nuvem/">NUVEM</a><a href="${esc(SACOLA)}" data-abre-sacola>Sacola</a></div>` : ""}
      <div><h4>Nimbus</h4><a href="${PREFIXO}/manifesto/">Manifesto</a><a href="${PREFIXO}/impacto/">10% do lucro</a><a href="https://instagram.com/nimbuswear.br" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@nimbuswear.br" rel="noopener">TikTok</a></div>
      <div><h4>Ajuda</h4><a href="${PREFIXO}/trocas/">Trocas e devoluções</a><a href="${PREFIXO}/envios/">Envios e prazos</a><a href="https://loja.nimbuswear.com.br/account/login/?ref=vitrine" rel="noopener">Acompanhar pedido</a><a href="${PREFIXO}/privacidade/">Privacidade</a><a href="https://loja.nimbuswear.com.br/contato/?ref=vitrine" rel="noopener">Fale com a NIMBUS</a></div>
    </div>
  </div>
  <div class="footer__legal">
    <span>© 2026 NIMBUS · CNPJ 53.977.834/0001-18 · Brasília DF · nimbuswear.com.br</span>
  </div>
</footer>
<script type="application/json" id="ecobags-dados">${JSON.stringify(ECOBAGS)}</script>`;

const card = (p) => `
<a class="card reveal" href="${PREFIXO}/p/${p.slug}/" data-peca="${esc(p.peca)}" data-preco="${p.preco}">
  <div class="card__midia">
    <img src="${esc(p.imagens.capa)}" alt="${esc(p.nome)}" width="500" height="500" loading="lazy" decoding="async">
    ${p.imagens.hover ? `<img class="card__hover" data-verso="${esc(p.imagens.hover)}" alt="" width="500" height="500" decoding="async">` : ""}
    <span class="card__pill">${esc(p.colecao_rotulo)}</span>
  </div>
  <div class="card__meta">
    <div><div class="card__nome">${esc(p.arte)}</div><div class="card__peca">${esc(p.peca)}</div></div>
    <div class="card__preco">${esc(p.preco_formatado)}</div>
  </div>
</a>`;

/* -------------------------------------------------------------------- home */
const home = () => `${head("NIMBUS | Streetwear católico premium", "Fé reverente, design autoral e acabamento premium. STREET, RELÍQUIA e NUVEM. 10% do lucro vai para o projeto social que você escolher.", { canonical: `${URL_BASE}/` })}
${header()}
<main>
  <section class="hero">
    <img class="hero__bg" src="${PREFIXO}/media/hero-editorial-1600.webp" alt="" fetchpriority="high">
    <div class="hero__copy">
      <h1 class="display reveal in">Acima de tudo.</h1>
      ${VITRINE_ABERTA
        ? `<p class="lede reveal in" style="margin-top:1em">Streetwear católico premium, feito no Brasil para você.</p>
      <div class="hero__cta reveal in">
        <a class="btn btn--primary" href="#colecoes">Ver as coleções</a>
        <a class="btn btn--ghost" href="${PREFIXO}/manifesto/">O manifesto</a>
      </div>`
        : `<p class="lede reveal in" style="margin-top:1em">Estamos remontando a coleção, peça por peça, com um novo padrão de produção e acabamento. As primeiras peças voltam em breve, feitas no Brasil, para você.</p>
      <div class="hero__cta reveal in">
        <a class="btn btn--primary" href="${PREFIXO}/manifesto/">O manifesto</a>
        <a class="btn btn--ghost" href="${PREFIXO}/impacto/">Os 10% do lucro</a>
      </div>`}
    </div>
  </section>

  <div class="trust"><div class="trust__inner">
    <span>Feita no Brasil, para você</span>
    <span>Pagamento seguro: à vista no Pix e no boleto, ou cartão em até 12x com juros</span>
    <span>10% do lucro doado ao projeto que você escolher</span>
  </div></div>

  ${VITRINE_ABERTA ? `<section class="secao" id="colecoes"><div class="secao__inner">
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
      <div><div class="kicker">Essenciais</div><h2 class="display--md display">A primeira leva da NIMBUS</h2><p class="note" style="margin-top:0.4em">Oito peças abrem a marca. Quem pede agora veste antes de todo mundo.</p></div>
      <a class="btn btn--ghost" href="${PREFIXO}/c/street/">Ver tudo por coleção</a>
    </div>
    <div class="grade">${cat.produtos.filter((p) => p.destaque).map(card).join("")}</div>
  </div></section>` : ""}

  <section class="secao banda--manifesto"><div class="secao__inner banda">
    <div class="reveal" style="max-width:44em">
      <div class="kicker kicker--gold">Fé que se veste bem</div>
      <h2 class="display display--md">Reverência não é sussurro.</h2>
      <p class="lede" style="margin-top:0.8em;color:#dcebfa">A NIMBUS nasce entre o concreto modernista e o céu do Brasil. Cada estampa trata a fé com a seriedade de quem acredita e o acabamento de quem respeita quem veste.</p>
    </div>
    <div class="banda__midia reveal"><img src="${PREFIXO}/media/manifesto-1600.webp" alt="Camiseta preta oversized num beco de concreto em São Paulo" loading="lazy"></div>
  </div></section>

  ${VITRINE_ABERTA ? `<section class="secao"><div class="secao__inner">
    <div class="secao__head reveal">
      <div><div class="kicker">Do pedido à porta</div><h2 class="display display--md">Como a sua peça nasce</h2></div>
    </div>
    <ol class="passos">
      <li class="reveal"><b>Você escolhe.</b><p>A arte, a peça, a cor e o tamanho, aqui na vitrine. O pagamento fecha na loja: à vista no Pix ou no boleto, ou no cartão em até 12x com juros.</p></li>
      <li class="reveal"><b>Ela é feita no Brasil, para você.</b><p>Estampa posicionada com medida, não no olho, e acabamento premium, peça a peça.</p></li>
      <li class="reveal"><b>Chega com rastreio.</b><p>E 10% do lucro do pedido vai para o projeto social que você escolher no checkout, com repasse mensal e comprovação. <a href="${PREFIXO}/impacto/">Veja como funciona</a>.</p></li>
    </ol>
  </div></section>` : ""}
</main>
${footer()}
<script src="${PREFIXO}/js/ui.js?v=${V}" defer></script>
</body></html>`;

/* ----------------------------------------------------------------- colecao */
// SEO por coleção: title com categoria e benefício em vez do rótulo seco, e
// description com preço e diferencial reais (auditoria de copy de 08/08).
const SEO_COLECAO = {
  street: ["Coleção STREET | Camisetas católicas com arte de rua | NIMBUS",
    "Grafite, spray e stencil sobre peças premium feitas no Brasil. Camisetas de R$149,90 a R$179,90, moletom R$299,90. 10% do lucro vai para um projeto social."],
  reliquia: ["Coleção RELÍQUIA | Estampas devocionais vintage e barrocas | NIMBUS",
    "Halftone, letra gótica e barroco dourado sobre peças premium feitas no Brasil. Camisetas a partir de R$149,90. 10% do lucro vai para um projeto social."],
  nuvem: ["Coleção NUVEM | O traço celeste da NIMBUS | NIMBUS",
    "Céu, nuvens e auréolas em traço leve, sobre peças premium feitas no Brasil. Camisetas a partir de R$149,90. 10% do lucro vai para um projeto social."],
};
const colecao = (c) => {
  const produtos = cat.produtos.filter((p) => p.colecao === c.id);
  const pecas = [...new Set(produtos.map((p) => p.peca))];
  const [seoTitulo, seoDesc] = SEO_COLECAO[c.id] || [`${c.rotulo} | NIMBUS`, c.resumo];
  return `${head(seoTitulo, seoDesc, { canonical: `${URL_BASE}/c/${c.id}/` })}
${header()}
<main>
  <section class="cabecalho-colecao" data-colecao="${c.id}">
    <img class="cabecalho-colecao__bg" style="object-position:${FOCO_COLECAO[c.id] || "50% 50%"}" src="${PREFIXO}/media/cenario-${c.id}-1600.webp" alt="">
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
${footer()}
<script src="${PREFIXO}/js/ui.js?v=${V}" defer></script>
<script src="${PREFIXO}/js/vitrine.js?v=${V}" defer></script>
</body></html>`;
};

/* ----------------------------------------------------------------- produto */
// P1 do conselho r3 (go do dono em 30/07): bloco devocional por arte. Nasceu
// como piloto nos 8 destaques e foi escalado para as 21 artes em 01/08, por
// ordem do dono: "se tiver em alguns produtos, tem que ter em todos".
// Breadcrumb, relacionados da mesma coleção, régua do frete grátis
// com a Ecobag como completa-pedido, disclaimer único na galeria e caimento.
const DEVOCIONAL = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "devocional.json"), "utf-8"));
const CAIMENTO = {
  "Camiseta Premium": "Corte reto clássico, veste fiel ao tamanho.",
  "Camiseta Oversized Premium": "Modelagem ampla de propósito. Entre dois tamanhos, o menor preserva o caimento.",
  "Moletom Canguru": "Veste confortável, com espaço. Na dúvida, fique no seu tamanho usual.",
};
// P1-4 do conselho r4 (03/08): as medidas por tamanho viram tabela HTML de
// verdade (colunas Tamanho, Largura, Altura), geradas do MESMO dado da ficha.
// Formato canônico: "P 62x78; M 64x80; ... cm (largura x altura)". Medida de
// peça sem grade (a Ecobag) segue como texto. Medida por tamanho que não
// parsear DERRUBA o build: rebaixar silenciosamente a texto corrido foi
// exatamente como este item escorregou da r3.
const tabelaMedidas = (medidas) => {
  const s = String(medidas).trim();
  const m = s.match(/^([A-Z]{1,3} [\d,]+x[\d,]+(?:; [A-Z]{1,3} [\d,]+x[\d,]+)*) cm \(largura x altura\)\.?$/);
  if (!m) {
    if (/^[A-Z]{1,3} [\d,]+x/.test(s))
      throw new Error(`medidas por tamanho fora do formato canônico, tabela impossível: "${s}"`);
    return null;
  }
  const linhas = m[1].split("; ").map((parte) => {
    const [tam, dims] = parte.split(" ");
    const [largura, altura] = dims.split("x");
    return `<tr><th scope="row">${esc(tam)}</th><td>${esc(largura)} cm</td><td>${esc(altura)} cm</td></tr>`;
  });
  return `<table class="medidas"><thead><tr><th scope="col">Tamanho</th><th scope="col">Largura</th><th scope="col">Altura</th></tr></thead><tbody>${linhas.join("")}</tbody></table>`;
};
const relacionados = (p) => {
  // Feedback do dono (31/07): ninguém compra a mesma arte em duas peças; a
  // seção mostra OUTRAS artes da mesma coleção, com a mesma peça primeiro
  // (similar de verdade: quem olha camiseta vê outras camisetas antes).
  const outras = cat.produtos.filter((x) => x.slug !== p.slug && x.colecao === p.colecao && x.arte !== p.arte);
  const lista = [...outras.filter((x) => x.peca === p.peca), ...outras.filter((x) => x.peca !== p.peca)].slice(0, 4);
  if (!lista.length) return "";
  return `
  <section class="secao" style="padding-top:0"><div class="secao__inner">
    <div class="secao__head">
      <div><div class="kicker">Da mesma coleção</div><h2 class="display display--md">Você também pode gostar</h2></div>
    </div>
    <div class="grade">${lista.map(card).join("")}</div>
  </div></section>`;
};

const produto = (p) => {
  const urlLoja = refInterno(p.url_loja);
  const dados = {
    url_loja: urlLoja, url_carrinho: SACOLA, imagens: p.imagens,
    opcoes: p.opcoes, variantes_por_cor: p.variantes_por_cor, preco: p.preco,
    slug: p.slug, nome: p.nome, peca: p.peca, id: p.id,
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
${header()}
<main>
  <nav class="migalhas"><div class="secao__inner"><a href="${PREFIXO}/">Início</a> · <a href="${PREFIXO}/c/${p.colecao}/">${esc(p.colecao_rotulo)}</a> · <span>${esc(p.arte)}</span></div></nav>
  <section class="secao" style="padding-top:1em"><div class="secao__inner pdp">
    <div class="pdp__palco" data-colecao="${p.colecao}">
      <div class="pdp__quadro"><img src="${esc(p.imagens.capa)}" alt="${esc(p.nome)}" width="500" height="500" fetchpriority="high"></div>
      ${galeria.length > 1 ? `<div class="pdp__thumbs">
        ${galeria.map((g, i) => `<button data-src="${esc(g)}" aria-pressed="${i === 0}"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join("")}
      </div>` : ""}
      <p class="note pdp__nota-fotos">Fotos de campanha.${p.opcoes.tamanhos.length > 1 ? " Nas fotos, as pessoas vestem tamanho G." : ""} Medidas e materiais exatos na ficha desta página.</p>
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

      ${p.opcoes.cores.length ? `
      <div class="opcao"><div class="opcao__rotulo">Cor<span class="opcao__valor" data-cor-nome>${esc(p.opcoes.cores[0])}</span></div>
        <div class="swatches">
          ${p.opcoes.cores.map((c, i) => `<button class="swatch" data-cor="${esc(c)}" aria-pressed="${i === 0}" aria-label="${esc(c)}" title="${esc(c)}" style="background:${CORES_HEX[c] || "#ccc"}"></button>`).join("")}
        </div>
      </div>` : ""}

      ${p.opcoes.tamanhos.length ? `
      <div class="opcao"><div class="opcao__rotulo">Tamanho</div>
        <div class="tamanhos">
          ${p.opcoes.tamanhos.map((t) => `<button class="tamanho" data-tamanho="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("")}
        </div>
      </div>` : ""}

      <!-- mesmo POST do formulário oficial da loja (fluxo do dono, 30/07):
           adiciona à sacola sem sair da vitrine; o handoff acontece na Sacola.
           Sem JS, o POST abre o carrinho da loja em aba nova, já com o item. -->
      <form class="pdp__form" method="post" action="${esc(SACOLA)}" target="_blank" data-sacola-form>
        <input type="hidden" name="add_to_cart" value="${esc(p.id)}">
        ${/* Um campo por EIXO QUE EXISTE, na ordem tamanho, cor. A Ecobag tem
             um eixo só e recebia dois: o item não entrava no carrinho e a loja
             não dizia nada. Ver build-catalogo.mjs. */""}
        ${(() => {
          const eixos = [];
          if (p.opcoes.tamanhos.length) eixos.push([esc(p.opcoes.tamanhos[0]), "data-var-tamanho"]);
          if (p.opcoes.cores.length) eixos.push([esc(p.opcoes.cores[0]), "data-var-cor"]);
          return eixos.map(([v, attr], i) => `<input type="hidden" name="variation[${i}]" value="${v}" ${attr}>`).join("\n        ");
        })()}
        <input type="hidden" name="quantity" value="1">
        <button type="submit" class="btn btn--primary pdp__comprar">Adicionar à sacola</button>
      </form>
      <span class="avisa-tamanho" data-avisa-tamanho role="alert">Escolha um tamanho para adicionar.</span>
      <div class="pdp__notas">
        <span class="note">A partir de R$399,90: frete grátis. O frete do seu CEP aparece no carrinho da loja, antes de pagar. À vista no Pix e no boleto, ou cartão em até 12x com juros.</span>
        <span class="note">7 dias para mudar de ideia: se devolver, <a href="${PREFIXO}/trocas/">devolvemos tudo o que você pagou, incluindo o frete</a>.</span>
        <span class="note">Peça feita no Brasil, para você.</span>
      </div>

      ${DEVOCIONAL[p.arte] ? `
      <div class="pdp__devocao">
        <div class="kicker kicker--gold">${esc(DEVOCIONAL[p.arte].rotulo || "A devoção")}</div>
        <h2>${esc(DEVOCIONAL[p.arte].santo)}</h2>
        <p>${esc(DEVOCIONAL[p.arte].historia)}</p>
        <p class="note">${DEVOCIONAL[p.arte].festa ? `Festa: ${esc(DEVOCIONAL[p.arte].festa)} · ` : ""}${esc(DEVOCIONAL[p.arte].estetica)}</p>
      </div>` : ""}

      <div class="pdp__detalhes">
        ${p.ficha.material ? `<details open><summary>A peça</summary><p class="note">${esc([p.ficha.material, p.ficha.modelagem, p.ficha.gola].filter(Boolean).join(". "))}.</p></details>` : ""}
        ${p.ficha.medidas || CAIMENTO[p.peca] ? (() => {
          const tabela = p.ficha.medidas ? tabelaMedidas(p.ficha.medidas) : null;
          const medidas = tabela || (p.ficha.medidas ? `<p class="note">${esc(p.ficha.medidas)}</p>` : "");
          return `<details><summary>Medidas e caimento</summary>${CAIMENTO[p.peca] ? `<p class="note"><b>Caimento:</b> ${esc(CAIMENTO[p.peca])}</p>` : ""}${medidas}</details>`;
        })() : ""}
        ${p.ficha.cuidados ? `<details><summary>Cuidados</summary><p class="note">${esc(p.ficha.cuidados)}</p></details>` : ""}
        <details><summary>Prazo e envio</summary><p class="note">Peça feita no Brasil, com rastreio. Chega, após a confirmação do pagamento: São Paulo, 3 a 5 dias úteis; Sudeste, 4 a 6; Sul e Centro-Oeste, 5 a 7; Norte e Nordeste, 6 a 12. O prazo do checkout para o seu CEP prevalece.</p></details>
      </div>

      <div class="pdp__impacto"><b>Esta peça destina 10% do lucro</b> ao projeto social da sua escolha, no checkout. <a href="${PREFIXO}/impacto/">Como funciona</a>.</div>
    </div>
  </div></section>
  ${relacionados(p)}
</main>
${footer()}
<script type="application/json" id="produto-dados">${JSON.stringify(dados)}</script>
<script src="${PREFIXO}/js/ui.js?v=${V}" defer></script>
<script src="${PREFIXO}/js/produto.js?v=${V}" defer></script>
</body></html>`;
};

/* ------------------------------------------------- páginas institucionais */
// P0 do conselho r3 (30/07), com as respostas do dono: fórmula dos 10%
// confirmada (lucro = o que sobra depois de todos os custos, inclusive
// divulgação); troca de tamanho é responsabilidade da NIMBUS, tratada caso a
// caso; CNPJ segue pendente (bloqueador de lançamento registrado no ESTADO).
// Quando a página tem mídia (o manifesto, desde 08/08), o desktop vira duas
// colunas: texto à esquerda, imagem à direita. Pedido do dono; o texto central
// sozinho deixava espaço branco demais nas laterais.
const institucional = (slug, titulo, descricao, corpo, midia) => `${head(`${titulo} | NIMBUS`, descricao, { canonical: `${URL_BASE}/${slug}/` })}
${header()}
<main>
  <section class="secao"><div class="secao__inner institucional${midia ? " institucional--com-imagem" : ""}">
    <h1 class="display display--md">${esc(titulo)}</h1>
    ${midia ? `<div class="institucional__texto">${corpo}</div>
    <figure class="institucional__midia"><img src="${PREFIXO}/media/${esc(midia.arquivo)}" alt="${esc(midia.alt)}" width="${midia.w}" height="${midia.h}" loading="lazy">${midia.legenda ? `<figcaption>${esc(midia.legenda)}</figcaption>` : ""}</figure>` : corpo}
  </div></section>
</main>
${footer()}
<script src="${PREFIXO}/js/ui.js?v=${V}" defer></script>
</body></html>`;

const INSTITUCIONAIS = {
  // P2-1 do conselho r4: a carta do fundador, escrita a pedido do dono
  // (pergunta 6) e APROVADA por ele em 03/08. Texto verbatim: não editar sem
  // nova aprovação. Sem foto por ora (decisão do dono); o link do impacto só
  // envolve palavras que já estavam na carta. CTA do hero, header e footer
  // apontam para cá desde a mesma data (antes gastavam o clique na landing).
  manifesto: ["O manifesto", "A carta do fundador da NIMBUS: por que a marca existe, no nome de quem a faz.", `
    <p class="lede">Eu me chamo Roberto. A NIMBUS nasceu de uma vontade simples: vestir a fé com a mesma dignidade com que ela me veste.</p>
    <p>Cresci vendo fé por todo lado neste país: nas igrejas, nos muros, nas pessoas. A NIMBUS junta esses mundos: santos e símbolos da nossa devoção, desenhados com estudo e feitos no Brasil, com acabamento que respeita o que eles significam.</p>
    <p>Reverência não é sussurro. Dá para amar a tradição e vestir a rua.</p>
    <p>E porque fé que não serve ao próximo é só pano, <a href="${PREFIXO}/impacto/">10% do lucro</a> de cada pedido vai para um projeto social que você escolhe. Com repasse mensal e comprovante publicado, porque promessa sem prova não entra nesta casa.</p>
    <p>A NIMBUS é pequena. Sou eu e quem caminha comigo. Se você chegou até aqui, já faz parte.</p>
    <p>Acima de tudo, obrigado.</p>
    <p><b>Roberto, fundador da NIMBUS</b></p>
    <p style="margin-top:2em">Se quiser ver o que essa vontade virou, as três coleções estão aqui.</p>
    <p><a class="btn btn--primary" href="${PREFIXO}/#colecoes">Ver as coleções</a></p>`,
    { arquivo: "manifesto-ceu-1200.webp", alt: "Curva de concreto branco modernista apontando para um céu azul com nuvens", w: 1200, h: 1600, legenda: "Entre o concreto e o céu." }],
  impacto: ["10% do lucro, de verdade", "Como funciona o repasse de 10% do lucro de cada pedido NIMBUS para o projeto social que você escolher.", `
    <p class="lede">A cada pedido, 10% do lucro vai para um projeto social que você escolhe no checkout. Esta página explica o que isso significa, sem letra miúda.</p>
    <h2>O que chamamos de lucro</h2>
    <p>Lucro é o que sobra do seu pedido depois de todos os custos: a produção da peça, a embalagem, o frete, as taxas de pagamento e a divulgação da marca. Sobre esse valor que sobra, separamos 10%.</p>
    <h2>Como funciona</h2>
    <ol>
      <li>No checkout, no campo mensagem do pedido, você escreve qual projeto recebe: Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo, ou outro que você indicar.</li>
      <li>Esperamos o prazo de arrependimento de 7 dias previsto em lei. Se o pedido ficar, o repasse dele entra na conta do mês.</li>
      <li>O repasse é mensal, somando os pedidos do período.</li>
      <li>O comprovante de cada repasse aparece nesta página, no Diário de Repasses abaixo.</li>
    </ol>
    <h2>Os projetos</h2>
    <p><b>Fazenda da Esperança</b>: recuperação de dependentes químicos pelo trabalho, espiritualidade e vida em comunidade.</p>
    <p><b>Cáritas Brasileira</b>: rede da Igreja no Brasil de combate à fome e à pobreza.</p>
    <p><b>Pequeno Cotolengo</b>: acolhimento de pessoas com deficiência em situação de abandono.</p>
    <h2>Diário de Repasses</h2>
    <p class="note">A NIMBUS está no começo. O primeiro repasse acontece no mês seguinte às primeiras vendas, e o comprovante será publicado aqui, com data e valor. Sem venda, sem promessa vazia: esta página é o registro.</p>
    <p>O diário abre com as primeiras vendas. Se quiser estar na primeira página dele, as coleções estão aqui.</p>
    <p><a class="btn btn--primary" href="${PREFIXO}/#colecoes">Ver as coleções</a></p>`],
  trocas: ["Trocas e devoluções", "Política de trocas e devoluções da NIMBUS: arrependimento em 7 dias, defeito coberto por 90 dias e troca de tamanho tratada com a gente.", `
    <p class="lede">Cada peça NIMBUS é feita no Brasil, para você. A nossa política é simples, segue a lei e cobre os três casos possíveis, sem pegadinha.</p>
    <h2>Mudou de ideia? Você tem 7 dias</h2>
    <p>A peça chegou perfeita, mas não era o que você imaginava. Você pode desistir da compra em até 7 dias corridos após o recebimento, por qualquer motivo, como garante o artigo 49 do Código de Defesa do Consumidor. Escreva para <a href="mailto:nimbuswearbr@gmail.com">nimbuswearbr@gmail.com</a> com o número do pedido e devolvemos tudo o que você pagou, incluindo o frete.</p>
    <h2>Chegou com problema? Avise assim que receber</h2>
    <p>Estampa falhada, mancha, costura aberta, peça errada: isso é defeito, não arrependimento, e a cobertura legal é de 90 dias para roupa (artigo 26 do CDC). Nos avise de preferência nos primeiros dias, com fotos e o número do pedido: quanto antes você escrever, mais rápido a nova peça sai. Você escolhe entre peça nova sem custo ou reembolso.</p>
    <h2>O problema apareceu depois?</h2>
    <p>Estampa que solta ou tecido que falha nas primeiras lavagens, seguindo os cuidados da etiqueta, também é defeito de fabricação. Nesse caso os 90 dias contam a partir do dia em que o problema apareceu. Mesmo caminho: foto e número do pedido por e-mail.</p>
    <h2>Errou o tamanho?</h2>
    <p>Escreva para a gente em até 7 dias do recebimento, com o número do pedido e o tamanho certo. Como cada peça é feita para você, tratamos caso a caso, e a gente resolve junto. A tabela de medidas de cada produto ajuda a acertar de primeira.</p>
    <h2>Como pedir</h2>
    <p>Um e-mail resolve tudo: <a href="mailto:nimbuswearbr@gmail.com">nimbuswearbr@gmail.com</a>, com o número do pedido no assunto. Respondemos rápido.</p>`],
  envios: ["Envios e prazos", "Prazos de entrega da NIMBUS por região do Brasil, com produção incluída e rastreio.", `
    <p class="lede">Cada peça é feita no Brasil, para você. Os prazos abaixo já incluem a produção, contados a partir da confirmação do pagamento.</p>
    <h2>Prazos por região</h2>
    <ul>
      <li>São Paulo: 3 a 5 dias úteis</li>
      <li>Sudeste: 4 a 6 dias úteis</li>
      <li>Sul e Centro-Oeste: 5 a 7 dias úteis</li>
      <li>Norte e Nordeste: 6 a 12 dias úteis</li>
    </ul>
    <p class="note">O prazo exato para o seu CEP aparece no checkout e prevalece sobre as faixas acima.</p>
    <h2>Rastreio</h2>
    <p>Todo pedido segue com código de rastreio, enviado por e-mail assim que a peça sai para entrega. O pedido também fica na sua conta da loja: <a href="https://loja.nimbuswear.com.br/account/login/?ref=vitrine" rel="noopener">Acompanhar pedido</a>.</p>
    <h2>Frete grátis</h2>
    <p>Pedidos a partir de R$399,90 têm frete grátis para todo o Brasil. No checkout, no campo mensagem do pedido, escreva qual projeto recebe os 10%.</p>
    <h2>Quanto custa o frete</h2>
    <p>Abaixo de R$399,90, o frete é o da Entrega NIMBUS, R$19,90 na maior parte do Brasil. O valor exato do seu CEP aparece no carrinho da loja, antes de pagar.</p>`],
  privacidade: ["Privacidade", "O que a NIMBUS coleta, para que serve e como falar com a gente sobre os seus dados.", `
    <p class="lede">O essencial, em português claro.</p>
    <h2>Quem responde pelos seus dados</h2>
    <p>O controlador dos dados tratados neste site é a NIMBUS (CNPJ 53.977.834/0001-18). Qualquer pedido sobre os seus dados chega pelo e-mail do fim desta página.</p>
    <h2>O que coletamos aqui na vitrine</h2>
    <p>A sacola vive no seu navegador: guardamos ali os itens que você adicionou e o cache das páginas, que deixa as visitas seguintes mais rápidas.</p>
    <p>Para a sacola da vitrine e o carrinho da loja mostrarem a mesma coisa, gravamos os cookies <b>nimbus_sacola_alvo</b> e <b>nimbus_sacola_loja</b> no domínio nimbuswear.com.br. Eles guardam só o retrato da sacola (itens, quantidades e a hora da última mudança), expiram em 48 horas e não identificam você.</p>
    <p>Usamos estatísticas de navegação do Google Analytics para entender quais páginas funcionam: números agregados, sem venda de dados e sem anúncio personalizado da nossa parte.</p>
    <h2>O que fica com a loja</h2>
    <p>Pagamento, endereço e dados do pedido são tratados no ambiente da loja (Nuvemshop), que tem política de privacidade e segurança próprias. A NIMBUS não armazena dados de cartão.</p>
    <h2>Seus direitos</h2>
    <p>Quer saber o que temos sobre você, corrigir ou apagar? Escreva para <a href="mailto:nimbuswearbr@gmail.com">nimbuswearbr@gmail.com</a> e resolvemos, como manda a LGPD.</p>`],
};

/* ------------------------------------------------------------------- gates */
// Sala de aprovação do dono: fora do menu, noindex, um lote por rodada.
// O conteúdo vem de scripts/vitrine/gates.json; imagem só entra nas páginas
// da loja depois de aprovada aqui.
const gates = () => {
  const g = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "gates.json"), "utf-8"));
  return `${head("Gates | NIMBUS (interno)", "Lote de imagens da rodada, para aprovação.")}
${header()}
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
${footer()}
<script src="${PREFIXO}/js/ui.js?v=${V}" defer></script>
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
for (const [slug, [titulo, descricao, corpo, midia]] of Object.entries(INSTITUCIONAIS)) {
  const dir = path.join(BASE, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), institucional(slug, titulo, descricao, corpo, midia));
}
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

// sitemap + robots (P1-7): só as páginas públicas. Gates, teste-carrinho e os
// stubs de /loja-preview/ ficam de fora (todos já levam noindex no próprio HTML).
const lastmod = cat.gerado_em.slice(0, 10);
const daVitrine = [
  `${URL_BASE}/`,
  ...Object.keys(INSTITUCIONAIS).map((s) => `${URL_BASE}/${s}/`),
  ...cat.colecoes.map((c) => `${URL_BASE}/c/${c.id}/`),
  ...cat.produtos.map((p) => `${URL_BASE}/p/${p.slug}/`),
];
// Só entra no sitemap o que o robots deixa indexar. Ver VITRINE_INDEXAVEL.
const publicas = ["https://nimbuswear.com.br/", ...(VITRINE_INDEXAVEL ? daVitrine : [])];
fs.writeFileSync(path.join(RAIZ, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicas.map((u) => `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(RAIZ, "public/robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /loja/gates/\nDisallow: /loja/teste-carrinho/\nDisallow: /loja-preview/\n${VITRINE_INDEXAVEL ? "" : "Disallow: /loja/\n"}\nSitemap: https://nimbuswear.com.br/sitemap.xml\n`);
console.log(`OK: home + gates + ${cat.colecoes.length} coleções + ${cat.produtos.length} produtos gerados em public/loja/ · sitemap com ${publicas.length} URLs`);

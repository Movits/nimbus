// Escolha de cor e tamanho e o "Adicionar à sacola", em dois lugares:
//   - a página do produto (/loja/p/<slug>/), com os dados em script#produto-dados;
//   - a janela que abre ao clicar num cartão (home, coleção, relacionados), com
//     os dados dos cartões da página em script#produtos-dados. Sem JS, o cartão
//     é um link comum para a página do produto.
// "Adicionar à sacola" grava só no navegador (NIMBUS.sacola, em ui.js), pelo
// SKU da variante escolhida; o pedido nasce em /loja/finalizar/ (loja própria,
// plano de 13/11/2026, seção 7).
// Regra de imagem (curadoria 29/07): ao trocar de cor, o quadro mostra as
// COSTAS daquela cor (onde vive a arte); frente fica nos thumbs.
// Produto de exemplo (loja em montagem, 26/11/2026) entra na sacola marcado e
// não dispara GA4 nem pixel: exemplo não é intenção de compra.
(function () {
  if (!window.NIMBUS || !NIMBUS.sacola) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // --- GA4: eventos de funil (o gtag só existe com GA4_ID no build) ----------
  // item_id é o ID do produto na Nuvemshop, não mais o slug (condição 29 do
  // conselho r5, 12/08): a loja envia o ID dela no `purchase`, e com slug de um
  // lado e ID do outro `view_item` e `purchase` nunca casavam no relatório de
  // itens. O slug continua legível em item_name.
  function eventoDe(p) {
    const ITEM_ID = String(p.id || p.slug);
    return function evento(nome, params) {
      if (p.exemplo) return;
      const dados = Object.assign({
        currency: "BRL",
        value: p.preco,
        items: [{ item_id: ITEM_ID, item_name: p.slug, price: p.preco, quantity: 1 }],
      }, params || {});
      if (typeof window.gtag === "function") window.gtag("event", nome, dados);
      // Meta e TikTok recebem o MESMO item_id (condição 4 + 29): sem os IDs dos
      // pixels no build, NIMBUS.pixel não encontra fbq/ttq e não faz nada.
      if (NIMBUS.pixel) NIMBUS.pixel(nome, dados);
    };
  }

  // --- aviso de "na sacola", sem sair da página ----------------------------
  let aviso = null;
  let avisoTimer = 0;
  function mostraAviso(texto) {
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = "sacola-aviso";
      aviso.setAttribute("role", "status");
      document.body.appendChild(aviso);
    }
    aviso.innerHTML = "";
    const txt = document.createElement("span");
    txt.textContent = texto;
    // "Ver a sacola" abre a gaveta aqui mesmo: no pico da intenção, o cliente
    // segue na vitrine
    const bt = document.createElement("button");
    bt.type = "button";
    bt.textContent = "Ver a sacola";
    bt.addEventListener("click", () => { aviso.classList.remove("on"); NIMBUS.gaveta.abre(); });
    aviso.append(txt, bt);
    aviso.classList.add("on");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("on"), 6000);
  }

  // Liga cor, tamanho, foto e o botão dentro de `raiz` (a página ou a janela).
  // `depois` roda quando a peça entra na sacola (a janela fecha).
  NIMBUS.montaProduto = function (raiz, p, depois) {
    let cor = p.opcoes.cores[0];
    let tamanho = p.opcoes.tamanhos.length === 1 ? p.opcoes.tamanhos[0] : null;
    const evento = eventoDe(p);

    const imagem = raiz.querySelector("[data-quadro] img");
    const form = raiz.querySelector("[data-sacola-form]");
    const botao = form ? form.querySelector(".pdp__comprar") : null;
    const avisaTamanho = raiz.querySelector("[data-avisa-tamanho]");
    const thumbs = raiz.querySelectorAll(".pdp__thumbs button");
    const swatches = raiz.querySelectorAll(".swatch");
    const tamanhos = raiz.querySelectorAll(".tamanho");
    const corNome = raiz.querySelector("[data-cor-nome]");
    const grupoTamanhos = raiz.querySelector(".tamanhos");

    function variante() {
      const lista = p.variantes_por_cor[cor] || [];
      if (tamanho) return lista.find((v) => v.tamanho === tamanho) || null;
      return lista[0] || null;
    }
    function mostra(src) {
      if (!src || !imagem) return;
      imagem.src = src;
      thumbs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.src === src)));
    }
    function atualiza() {
      const v = variante();
      if (botao) {
        botao.disabled = !v;
        botao.textContent = v ? "Adicionar à sacola" : "Indisponível nesta combinação";
      }
    }

    swatches.forEach((s) => s.addEventListener("click", () => {
      cor = s.dataset.cor;
      swatches.forEach((x) => x.setAttribute("aria-pressed", String(x === s)));
      if (corNome) corNome.textContent = cor;
      const pc = p.imagens.por_cor[cor] || {};
      mostra(pc.costas || pc.frente);
      // tamanhos disponíveis mudam por cor
      const disp = new Set((p.variantes_por_cor[cor] || []).map((v) => v.tamanho));
      tamanhos.forEach((t) => { t.disabled = !disp.has(t.dataset.tamanho); });
      if (tamanho && !disp.has(tamanho)) { tamanho = null; tamanhos.forEach((t) => t.setAttribute("aria-pressed", "false")); }
      atualiza();
    }));

    tamanhos.forEach((t) => t.addEventListener("click", () => {
      if (t.disabled) return;
      tamanho = t.dataset.tamanho;
      tamanhos.forEach((x) => x.setAttribute("aria-pressed", String(x === t)));
      if (avisaTamanho) avisaTamanho.classList.remove("on");
      if (grupoTamanhos) grupoTamanhos.removeAttribute("data-erro");
      atualiza();
    }));

    thumbs.forEach((b) => b.addEventListener("click", () => mostra(b.dataset.src)));

    evento("view_item");

    if (form) form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const v = variante();
      if (!v) return;
      if (!tamanho && p.opcoes.tamanhos.length > 1) {
        if (avisaTamanho) avisaTamanho.classList.add("on");
        // o grupo inteiro ganha estado de erro, não só o texto solto abaixo
        if (grupoTamanhos) grupoTamanhos.setAttribute("data-erro", "");
        return;
      }
      const pc = p.imagens.por_cor[cor] || {};
      const preco = v.preco || p.preco || 0;
      const r = NIMBUS.sacola.soma({
        sku: v.sku, slug: p.slug, nome: p.nome, cor, tamanho: tamanho || null, peca: p.peca || "",
        pid: p.id || null, preco, img: pc.costas || pc.frente || p.imagens.capa, exemplo: p.exemplo,
      });
      const rotulo = tamanho ? cor + " · " + tamanho : cor;
      if (depois) depois();
      if (r.cheio) { mostraAviso("No máximo " + NIMBUS.sacola.MAXIMO + " unidades de cada peça."); return; }
      evento("add_to_cart", {
        value: preco,
        items: [{ item_id: String(p.id || p.slug), item_name: p.slug, item_variant: rotulo.replace(" · ", "/"), price: preco, quantity: 1 }],
      });
      mostraAviso(rotulo + " na sacola.");
    });

    atualiza();
  };

  // --- página do produto -----------------------------------------------------
  const dadosPdp = document.getElementById("produto-dados");
  if (dadosPdp) NIMBUS.montaProduto(document.querySelector(".pdp"), JSON.parse(dadosPdp.textContent));

  // --- janela do produto (o cartão maior) ------------------------------------
  const dadosCartoes = document.getElementById("produtos-dados");
  if (!dadosCartoes) return;
  const porSlug = new Map(JSON.parse(dadosCartoes.textContent).map((p) => [p.slug, p]));
  let janela = null;
  let origem = null;

  function htmlDaJanela(p) {
    const cores = p.opcoes.cores.length ? `
      <div class="opcao"><div class="opcao__rotulo">Cor<span class="opcao__valor" data-cor-nome>${esc(p.opcoes.cores[0])}</span></div>
        <div class="swatches">${p.opcoes.cores.map((c, i) => `<button type="button" class="swatch" data-cor="${esc(c)}" aria-pressed="${i === 0}" aria-label="${esc(c)}" title="${esc(c)}" style="background:${esc(p.cores_hex[c] || "#ccc")}"></button>`).join("")}</div>
      </div>` : "";
    const tamanhos = p.opcoes.tamanhos.length ? `
      <div class="opcao"><div class="opcao__rotulo">Tamanho</div>
        <div class="tamanhos">${p.opcoes.tamanhos.map((t) => `<button type="button" class="tamanho" data-tamanho="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("")}</div>
      </div>` : "";
    const pc = p.imagens.por_cor[p.opcoes.cores[0]] || {};
    return `<div class="espiada__corpo">
      <button type="button" class="espiada__fecha" data-espiada-fecha aria-label="Fechar">&times;</button>
      <div class="espiada__quadro" data-quadro><img src="${esc(pc.costas || pc.frente || p.imagens.capa)}" alt="${esc(p.nome)}" width="500" height="500"></div>
      <div class="espiada__info">
        <div class="kicker kicker--gold">${esc(p.colecao_rotulo)}</div>
        <h2 id="espiada-titulo">${esc(p.arte)}</h2>
        <div class="pdp__peca">${esc(p.peca)}</div>
        <div class="pdp__preco">${esc(p.preco_formatado)}</div>
        ${p.exemplo ? `<p class="pdp__exemplo">Produto de exemplo: ainda não está à venda.</p>` : ""}
        ${cores}${tamanhos}
        <form class="pdp__form" data-sacola-form><button type="submit" class="btn btn--primary pdp__comprar">Adicionar à sacola</button></form>
        <span class="avisa-tamanho" data-avisa-tamanho role="alert">Escolha um tamanho para adicionar.</span>
        <a class="textlink espiada__detalhes" href="${esc(p.url)}">Ver detalhes do produto</a>
      </div>
    </div>`;
  }

  function fecha() { if (janela && janela.open) janela.close(); }
  function abre(p, cartao) {
    if (!janela) {
      janela = document.createElement("dialog");
      janela.className = "espiada";
      janela.setAttribute("aria-labelledby", "espiada-titulo");
      document.body.appendChild(janela);
      // clique no fundo escuro fecha; Esc o próprio <dialog> resolve
      janela.addEventListener("click", (ev) => { if (ev.target === janela || ev.target.closest("[data-espiada-fecha]")) fecha(); });
      janela.addEventListener("close", () => {
        document.body.style.overflow = "";
        if (origem && document.contains(origem)) origem.focus();
      });
    }
    origem = cartao;
    janela.innerHTML = htmlDaJanela(p);
    NIMBUS.montaProduto(janela, p, fecha);
    document.body.style.overflow = "hidden";
    janela.showModal();
  }

  document.addEventListener("click", (ev) => {
    const cartao = ev.target.closest("a.card[data-slug]");
    if (!cartao || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const p = porSlug.get(cartao.dataset.slug);
    if (!p || typeof HTMLDialogElement !== "function") return; // sem <dialog>, segue o link
    ev.preventDefault();
    abre(p, cartao);
  });
})();

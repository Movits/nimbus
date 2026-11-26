// Seletor de cor e tamanho da PDP. Os dados do produto vêm embutidos na página
// (script#produto-dados), então nada aqui depende de segunda requisição.
// "Adicionar à sacola" grava só no navegador (NIMBUS.sacola, em ui.js), pelo
// SKU da variante escolhida; o pedido nasce na finalização, em
// /loja/finalizar/ (loja própria, plano de 13/11/2026, seção 7). Até 13/11 o
// formulário replicava o POST do carrinho da Nuvemshop num iframe oculto.
// Regra de imagem (curadoria 29/07): ao trocar de cor, o quadro mostra as
// COSTAS daquela cor (onde vive a arte); frente fica nos thumbs.
(function () {
  const el = document.getElementById("produto-dados");
  if (!el) return;
  const p = JSON.parse(el.textContent);

  let cor = p.opcoes.cores[0];
  let tamanho = p.opcoes.tamanhos.length === 1 ? p.opcoes.tamanhos[0] : null;

  const imagem = document.querySelector(".pdp__quadro img");
  const form = document.querySelector("[data-sacola-form]");
  const botao = form ? form.querySelector(".pdp__comprar") : null;
  const avisaTamanho = document.querySelector("[data-avisa-tamanho]");
  const thumbs = document.querySelectorAll(".pdp__thumbs button");
  const swatches = document.querySelectorAll(".swatch");
  const tamanhos = document.querySelectorAll(".tamanho");
  const corNome = document.querySelector("[data-cor-nome]");

  function variante() {
    const lista = p.variantes_por_cor[cor] || [];
    if (tamanho) return lista.find((v) => v.tamanho === tamanho) || null;
    return lista[0] || null;
  }
  function mostra(src) {
    if (!src) return;
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
    const grupoOk = document.querySelector(".tamanhos");
    if (grupoOk) grupoOk.removeAttribute("data-erro");
    atualiza();
  }));

  thumbs.forEach((b) => b.addEventListener("click", () => mostra(b.dataset.src)));

  // --- GA4: eventos de funil (o gtag só existe com GA4_ID no build) ----------
  // item_id é o ID do produto na Nuvemshop, não mais o slug (condição 29 do
  // conselho r5, 12/08): a loja envia o ID dela no `purchase`, e com slug de um
  // lado e ID do outro `view_item` e `purchase` nunca casavam no relatório de
  // itens — não dava para saber QUAL estampa vendeu, que é a decisão da
  // remontagem na IzzyPrint. O slug continua legível em item_name.
  const ITEM_ID = String(p.id || p.slug);
  function evento(nome, params) {
    const dados = Object.assign({
      currency: "BRL",
      value: p.preco,
      items: [{ item_id: ITEM_ID, item_name: p.slug, price: p.preco, quantity: 1 }],
    }, params || {});
    if (typeof window.gtag === "function") window.gtag("event", nome, dados);
    // Meta e TikTok recebem o MESMO item_id (condição 4 + 29): sem os IDs dos
    // pixels no build, NIMBUS.pixel não encontra fbq/ttq e não faz nada.
    if (window.NIMBUS && NIMBUS.pixel) NIMBUS.pixel(nome, dados);
  }
  evento("view_item");

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

  if (form) form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const v = variante();
    if (!v || !window.NIMBUS || !NIMBUS.sacola) return;
    if (!tamanho && p.opcoes.tamanhos.length > 1) {
      if (avisaTamanho) avisaTamanho.classList.add("on");
      // o grupo inteiro ganha estado de erro, não só o texto solto abaixo
      const grupo = document.querySelector(".tamanhos");
      if (grupo) grupo.setAttribute("data-erro", "");
      return;
    }
    const pc = p.imagens.por_cor[cor] || {};
    const preco = v.preco || p.preco || 0;
    const r = NIMBUS.sacola.soma({
      sku: v.sku, slug: p.slug, nome: p.nome, cor, tamanho: tamanho || null, peca: p.peca || "",
      pid: p.id || null, preco, img: pc.costas || pc.frente || p.imagens.capa,
    });
    const rotulo = tamanho ? cor + " · " + tamanho : cor;
    if (r.cheio) { mostraAviso("No máximo " + NIMBUS.sacola.MAXIMO + " unidades de cada peça."); return; }
    evento("add_to_cart", {
      value: preco,
      items: [{ item_id: ITEM_ID, item_name: p.slug, item_variant: rotulo.replace(" · ", "/"), price: preco, quantity: 1 }],
    });
    mostraAviso(rotulo + " na sacola.");
  });

  atualiza();
})();

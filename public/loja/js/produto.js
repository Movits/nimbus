// Seletor de cor e tamanho da PDP. Os dados do produto vêm embutidos na página
// (script#produto-dados), então nada aqui depende de segunda requisição.
// Fluxo da sacola (decisão do dono, 30/07): o formulário replica o POST do
// formulário oficial da loja (add_to_cart + variation[] + quantity). Com JS, o
// envio vai para um iframe oculto e o cliente segue na vitrine; a Sacola do
// header leva ao carrinho da loja, onde vive a verdade. Sem JS, o form abre o
// carrinho da loja em aba nova, já com o item.
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
  const inpTamanho = form ? form.querySelector("[data-var-tamanho]") : null;
  const inpCor = form ? form.querySelector("[data-var-cor]") : null;
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
    if (inpCor) inpCor.value = cor;
    if (inpTamanho && v) inpTamanho.value = v.tamanho;
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
    atualiza();
  }));

  thumbs.forEach((b) => b.addEventListener("click", () => mostra(b.dataset.src)));

  // --- envio sem sair da página -------------------------------------------
  let aviso = null;
  let avisoTimer = 0;
  function mostraAviso(nome) {
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = "sacola-aviso";
      aviso.setAttribute("role", "status");
      document.body.appendChild(aviso);
    }
    aviso.innerHTML = "";
    const txt = document.createElement("span");
    txt.textContent = nome + " na sacola.";
    const link = document.createElement("a");
    link.href = p.url_carrinho;
    link.textContent = "Ver sacola";
    aviso.append(txt, link);
    aviso.classList.add("on");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("on"), 6000);
  }

  if (form) form.addEventListener("submit", (ev) => {
    const v = variante();
    if (!v) { ev.preventDefault(); return; }
    if (!tamanho && p.opcoes.tamanhos.length > 1) {
      ev.preventDefault();
      if (avisaTamanho) avisaTamanho.classList.add("on");
      return;
    }
    ev.preventDefault();
    let sink = document.getElementById("sacola-sink");
    if (!sink) {
      sink = document.createElement("iframe");
      sink.id = "sacola-sink";
      sink.name = "sacola-sink";
      sink.hidden = true;
      document.body.appendChild(sink);
    }
    form.target = "sacola-sink";
    form.submit();
    if (window.NIMBUS && NIMBUS.sacola) NIMBUS.sacola.soma(1);
    mostraAviso(tamanho ? cor + " · " + tamanho : cor);
  });

  atualiza();
})();

// Seletor de cor e tamanho da PDP. Os dados do produto vêm embutidos na página
// (script#produto-dados), então nada aqui depende de segunda requisição.
// O botão Comprar é um LINK para a página do produto na loja, com a variante
// escolhida em ?variant= (pré-seleção; a página funciona mesmo sem o parâmetro).
// Regra de imagem (curadoria 29/07): ao trocar de cor, o quadro mostra as
// COSTAS daquela cor (onde vive a arte); frente fica nos thumbs.
(function () {
  const el = document.getElementById("produto-dados");
  if (!el) return;
  const p = JSON.parse(el.textContent);

  let cor = p.opcoes.cores[0];
  let tamanho = null;

  const imagem = document.querySelector(".pdp__quadro img");
  const botao = document.querySelector(".pdp__comprar");
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
    const url = new URL(p.url_loja); // já vem com UTM; ?variant= soma sem apagar
    if (v) url.searchParams.set("variant", v.variant_id);
    botao.setAttribute("href", url.toString());
    botao.textContent = v ? "Comprar na loja" : "Indisponível nesta combinação";
    botao.classList.toggle("btn--ghost", !v);
    botao.classList.toggle("btn--primary", !!v);
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
    atualiza();
  }));

  thumbs.forEach((b) => b.addEventListener("click", () => mostra(b.dataset.src)));

  atualiza();
})();

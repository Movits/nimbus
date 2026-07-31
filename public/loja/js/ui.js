// Comportamentos comuns da vitrine: reveal por IntersectionObserver, modais
// <dialog> dos projetos sociais, e a SACOLA: espelho local em localStorage com
// gaveta lateral (itens, régua do frete grátis + brinde, checkout na loja).
// O espelho é um retrato do que foi adicionado POR AQUI; a verdade é o carrinho
// da loja (o cliente pode mudar por lá). Por isso: validade de 48h, botão de
// esvaziar e aviso na gaveta. Sem dependências.
window.NIMBUS = window.NIMBUS || {};

NIMBUS.reais = function (v) {
  return "R$ " + (Math.round(v * 100) / 100).toFixed(2).replace(".", ",").replace(",00", "");
};

NIMBUS.sacola = (function () {
  const KEY = "nimbus-sacola-v2";
  const VALIDADE = 48 * 60 * 60 * 1000;
  const META = 399.9; // mesmo teto anunciado no site
  // chaves da v1 (só contador) saem de cena; era a origem do badge fantasma
  try { localStorage.removeItem("nimbus-sacola"); localStorage.removeItem("nimbus-sacola-total"); } catch (e) { /* modo privado */ }

  function le() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!s || !Array.isArray(s.itens) || Date.now() - (s.t || 0) > VALIDADE) return { itens: [] };
      return s;
    } catch (e) { return { itens: [] }; }
  }
  function grava(s) {
    s.t = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* modo privado */ }
  }
  const somaDe = (itens) => itens.reduce((a, i) => a + (i.preco || 0) * i.qtd, 0);

  return {
    META,
    itens() { return le().itens; },
    n() { return le().itens.reduce((a, i) => a + i.qtd, 0); },
    total() { return somaDe(le().itens); },
    soma(item) {
      const s = le();
      const antes = somaDe(s.itens);
      const igual = s.itens.find((i) => i.slug === item.slug && i.cor === item.cor && i.tamanho === item.tamanho);
      if (igual) igual.qtd += 1;
      else s.itens.push({ slug: item.slug, nome: item.nome, cor: item.cor, tamanho: item.tamanho, preco: item.preco || 0, img: item.img || null, qtd: 1 });
      grava(s);
      this.pinta();
      const depois = somaDe(s.itens);
      return { total: depois, cruzou: antes < META && depois >= META };
    },
    esvazia() { grava({ itens: [] }); this.pinta(); },
    pinta() {
      const n = this.n();
      document.querySelectorAll("[data-sacola-n]").forEach((el) => {
        el.hidden = n === 0;
        el.textContent = n > 9 ? "9+" : String(n);
      });
      if (NIMBUS.gaveta) NIMBUS.gaveta.renderiza();
    },
  };
})();

// --- gaveta lateral da sacola ------------------------------------------------
NIMBUS.gaveta = (function () {
  let raiz = null;

  function ga4(nome, params) {
    if (typeof window.gtag !== "function") return;
    const itens = NIMBUS.sacola.itens().map((i) => ({ item_id: i.slug, item_name: i.nome, item_variant: i.tamanho ? i.cor + "/" + i.tamanho : i.cor, price: i.preco, quantity: i.qtd }));
    window.gtag("event", nome, Object.assign({ currency: "BRL", value: NIMBUS.sacola.total(), items: itens }, params || {}));
  }

  function urlCarrinho() {
    const cta = document.querySelector(".header__cta");
    return cta ? cta.href : "https://loja.nimbuswear.com.br/comprar/";
  }

  function monta() {
    if (raiz) return;
    raiz = document.createElement("div");
    raiz.className = "gaveta";
    raiz.innerHTML =
      '<div class="gaveta__veu" data-gaveta-fecha></div>' +
      '<aside class="gaveta__painel" role="dialog" aria-label="Sua sacola">' +
      '<div class="gaveta__cabeca"><h2>Sua sacola</h2><button class="gaveta__fecha" data-gaveta-fecha aria-label="Fechar">&times;</button></div>' +
      '<div class="gaveta__festa" hidden></div>' +
      '<div class="gaveta__itens"></div>' +
      '<div class="gaveta__regua"><div class="gaveta__trilho"><div class="gaveta__barra"></div></div><p class="gaveta__meta"></p></div>' +
      '<div class="gaveta__pe">' +
      '<a class="btn btn--primary gaveta__checkout" href="#" target="_blank" rel="noopener">Fechar pedido na loja</a>' +
      '<p class="gaveta__nota">Espelho do que você adicionou por aqui. Quantidades e valores finais aparecem na loja. <button type="button" class="gaveta__esvazia">Esvaziar</button></p>' +
      "</div></aside>";
    document.body.appendChild(raiz);
    raiz.querySelectorAll("[data-gaveta-fecha]").forEach((el) => el.addEventListener("click", fecha));
    raiz.querySelector(".gaveta__esvazia").addEventListener("click", () => { NIMBUS.sacola.esvazia(); });
    raiz.querySelector(".gaveta__checkout").addEventListener("click", () => ga4("begin_checkout"));
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") fecha(); });
  }

  function renderiza() {
    if (!raiz) return;
    const itens = NIMBUS.sacola.itens();
    const total = NIMBUS.sacola.total();
    const META = NIMBUS.sacola.META;
    const lista = raiz.querySelector(".gaveta__itens");
    lista.innerHTML = "";
    if (!itens.length) {
      const vazio = document.createElement("p");
      vazio.className = "gaveta__vazia";
      vazio.textContent = "Sua sacola está vazia. As coleções esperam por você.";
      lista.appendChild(vazio);
    }
    for (const i of itens) {
      const li = document.createElement("div");
      li.className = "gaveta__item";
      const img = document.createElement("img");
      if (i.img) img.src = i.img;
      img.alt = "";
      const info = document.createElement("div");
      const nome = document.createElement("strong");
      nome.textContent = i.nome;
      const det = document.createElement("span");
      det.textContent = (i.tamanho ? i.cor + " · " + i.tamanho : i.cor) + " · " + i.qtd + "x";
      info.append(nome, det);
      const preco = document.createElement("span");
      preco.className = "gaveta__preco";
      preco.textContent = NIMBUS.reais(i.preco * i.qtd);
      li.append(img, info, preco);
      lista.appendChild(li);
    }
    const pct = Math.min(100, (total / META) * 100);
    raiz.querySelector(".gaveta__barra").style.width = pct + "%";
    const meta = raiz.querySelector(".gaveta__meta");
    if (!itens.length) meta.textContent = "Frete grátis e uma Ecobag de brinde a partir de " + NIMBUS.reais(META) + ".";
    else if (total >= META) meta.innerHTML = "<b>Frete grátis e Ecobag de brinde garantidos.</b> Escolha a arte da Ecobag na mensagem do pedido, no checkout.";
    else meta.textContent = "Faltam " + NIMBUS.reais(META - total) + " para frete grátis e uma Ecobag de brinde.";
    const festa = raiz.querySelector(".gaveta__festa");
    festa.hidden = !(itens.length && total >= META);
    if (!festa.hidden && !festa.innerHTML) {
      festa.innerHTML = '<span class="gaveta__confete"></span>'.repeat(10) + "<p>Seu pedido ganhou frete grátis e uma Ecobag de presente. Veja as artes pelo site e escreva a escolhida na mensagem do checkout.</p>";
    }
    raiz.querySelector(".gaveta__checkout").href = urlCarrinho();
  }

  function abre() { monta(); renderiza(); raiz.classList.add("on"); document.body.style.overflow = "hidden"; ga4("view_cart"); }
  function fecha() { if (raiz) { raiz.classList.remove("on"); document.body.style.overflow = ""; } }

  return { abre, fecha, renderiza };
})();

NIMBUS.sacola.pinta();

// Sacola do header abre a gaveta; sem JS o link segue direto para a loja.
document.querySelectorAll(".header__cta").forEach((cta) => {
  cta.addEventListener("click", (ev) => { ev.preventDefault(); NIMBUS.gaveta.abre(); });
});

// Cache de retorno (/sw.js, escopo do domínio inteiro): registrado também aqui
// para quem entra direto pela vitrine, sem passar pela landing.
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

(function () {
  const io = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  document.querySelectorAll("[data-abre-dialog]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const d = document.getElementById(botao.dataset.abreDialog);
      if (d) d.showModal();
    });
  });
  document.querySelectorAll("dialog.projeto").forEach((d) => {
    d.addEventListener("click", (ev) => { if (ev.target === d) d.close(); });
  });
})();

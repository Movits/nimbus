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
  // A régua do brinde traduz o cupom ECOBAG (R$49,90 fixos, mínimo R$449,80):
  // o total conta TUDO o que está na sacola, menos UMA ecobag, que é a que sai
  // de graça. Regra do dono: brinde quando (total menos uma ecobag) >= META.
  const ehEcobag = (i) => i.peca === "Ecobag" || /\|\s*Ecobag/.test(i.nome || "");
  const progressoDe = (itens) => {
    const eco = itens.find(ehEcobag);
    return somaDe(itens) - (eco ? eco.preco || 0 : 0);
  };

  // Sincronia com o carrinho REAL: a página do carrinho da loja (tema Baires,
  // templates/cart.tpl) grava um cookie no domínio pai com o retrato do
  // carrinho. Se o cookie for mais novo que o espelho, ele vence: quem removeu
  // item na loja volta para a vitrine com badge e gaveta certos.
  function cookieLoja() {
    const m = document.cookie.match(/(?:^|; )nimbus_sacola_loja=([^;]*)/);
    if (!m) return null;
    try {
      const c = JSON.parse(decodeURIComponent(m[1]));
      return c && Array.isArray(c.itens) && typeof c.t === "number" ? c : null;
    } catch (e) { return null; }
  }
  function sincroniza() {
    const c = cookieLoja();
    if (!c) return false;
    const s = le();
    if ((s.t || 0) >= c.t) return false;
    const antigos = s.itens;
    const itens = c.itens.filter((i) => i.qtd > 0).map((i) => {
      const par = antigos.find((a) => a.nome === i.nome);
      return {
        slug: par ? par.slug : null, nome: i.nome,
        cor: par ? par.cor : "", tamanho: par ? par.tamanho : null,
        preco: i.qtd ? (i.sub || 0) / i.qtd : 0,
        img: par ? par.img : null, qtd: i.qtd,
      };
    });
    grava({ itens });
    return true;
  }

  return {
    sincroniza() { if (sincroniza()) this.pinta(); },
    META,
    itens() { return le().itens; },
    n() { return le().itens.reduce((a, i) => a + i.qtd, 0); },
    total() { return somaDe(le().itens); },
    progresso() { return progressoDe(le().itens); },
    temEcobag() { return le().itens.some(ehEcobag); },
    soma(item) {
      const s = le();
      const antes = progressoDe(s.itens);
      const igual = s.itens.find((i) => i.slug === item.slug && i.cor === item.cor && i.tamanho === item.tamanho);
      if (igual) igual.qtd += 1;
      else s.itens.push({ slug: item.slug, nome: item.nome, cor: item.cor, tamanho: item.tamanho, peca: item.peca || "", preco: item.preco || 0, img: item.img || null, qtd: 1 });
      grava(s);
      this.pinta();
      const depois = progressoDe(s.itens);
      return { total: somaDe(s.itens), cruzou: antes < META && depois >= META };
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
      det.textContent = [i.cor, i.tamanho, i.qtd + "x"].filter(Boolean).join(" · ");
      info.append(nome, det);
      const preco = document.createElement("span");
      preco.className = "gaveta__preco";
      preco.textContent = NIMBUS.reais(i.preco * i.qtd);
      li.append(img, info, preco);
      lista.appendChild(li);
    }
    const prog = NIMBUS.sacola.progresso();
    const temEco = NIMBUS.sacola.temEcobag();
    const pct = Math.min(100, (prog / META) * 100);
    raiz.querySelector(".gaveta__barra").style.width = pct + "%";
    const meta = raiz.querySelector(".gaveta__meta");
    if (!itens.length) meta.textContent = "Frete grátis e uma Ecobag de brinde a partir de " + NIMBUS.reais(META) + " (a Ecobag do brinde não conta na soma).";
    else if (prog >= META) meta.innerHTML = temEco
      ? "<b>Frete grátis garantido.</b> Use o cupom <b>ECOBAG</b> no checkout: uma das suas Ecobags sai de graça."
      : "<b>Frete grátis garantido.</b> Adicione a Ecobag com a arte que você quiser e use o cupom <b>ECOBAG</b> no checkout: ela sai de graça.";
    else meta.textContent = "Faltam " + NIMBUS.reais(META - prog) + " para frete grátis e uma Ecobag de brinde.";
    const festa = raiz.querySelector(".gaveta__festa");
    festa.hidden = !(itens.length && prog >= META);
    if (!festa.hidden && !festa.innerHTML) {
      festa.innerHTML = '<span class="gaveta__confete"></span>'.repeat(10) + "<p>Seu pedido ganhou frete grátis e uma Ecobag de presente. Garanta a Ecobag com a arte que preferir na sacola e use o cupom ECOBAG no checkout: o valor dela sai do pedido.</p>";
    }
    raiz.querySelector(".gaveta__checkout").href = urlCarrinho();
  }

  function abre() { monta(); renderiza(); raiz.classList.add("on"); document.body.style.overflow = "hidden"; ga4("view_cart"); }
  function fecha() { if (raiz) { raiz.classList.remove("on"); document.body.style.overflow = ""; } }

  return { abre, fecha, renderiza };
})();

NIMBUS.sacola.sincroniza();
NIMBUS.sacola.pinta();
// voltas da loja (botão voltar, troca de aba) reconciliam com o carrinho real
window.addEventListener("pageshow", () => NIMBUS.sacola.sincroniza());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") NIMBUS.sacola.sincroniza();
});

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

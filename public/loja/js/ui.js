// Comportamentos comuns da vitrine: reveal por IntersectionObserver, modais
// <dialog> dos projetos sociais, e a SACOLA: espelho local em localStorage com
// gaveta lateral (itens, régua do frete grátis + brinde, checkout na loja).
// O espelho é um retrato do que foi adicionado POR AQUI; a verdade é o carrinho
// da loja (o cliente pode mudar por lá). Por isso: validade de 48h, botão de
// esvaziar e aviso na gaveta. Sem dependências.
// Edição na gaveta (31/07): quantidade e remoção mexem no espelho E deixam o
// alvo num cookie do domínio pai; o cart.tpl do tema aplica na loja com a API
// dela (LS.removeItem), que é a única que remove de verdade. Enquanto a loja
// não aplica, ela segue sendo a verdade do que será cobrado.
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
        peca: par ? par.peca : "", pid: par ? par.pid : null,
        preco: i.qtd ? (i.sub || 0) / i.qtd : 0,
        img: par ? par.img : null, qtd: i.qtd,
      };
    });
    grava({ itens });
    return true;
  }

  // Alvo para a loja: o cart.tpl do tema lê este cookie na página do carrinho e
  // aplica o que o cliente editou aqui (qtd 0 = remover, via LS.removeItem).
  // Sem o cart.tpl no ar, o cookie é inerte e a loja segue mandando.
  function gravaAlvo(edicoes) {
    if (!edicoes.length) return;
    const dominio = /(^|\.)nimbuswear\.com\.br$/.test(location.hostname) ? "; domain=.nimbuswear.com.br" : "";
    try {
      const prévias = alvoAtual().filter((a) => !edicoes.some((e) => chaveAlvo(e) === chaveAlvo(a)));
      const valor = encodeURIComponent(JSON.stringify({ t: Date.now(), itens: prévias.concat(edicoes).slice(-30) }));
      document.cookie = "nimbus_sacola_alvo=" + valor + dominio + "; path=/; max-age=172800; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    } catch (e) { /* cookie bloqueado: a loja segue como verdade */ }
  }
  function alvoAtual() {
    const m = document.cookie.match(/(?:^|; )nimbus_sacola_alvo=([^;]*)/);
    if (!m) return [];
    try {
      const a = JSON.parse(decodeURIComponent(m[1]));
      return a && Array.isArray(a.itens) ? a.itens : [];
    } catch (e) { return []; }
  }
  const chaveAlvo = (i) => [i.pid || "", i.nome || "", i.cor || "", i.tamanho || ""].join("|");
  const alvoDe = (i, qtd) => ({ pid: i.pid || null, nome: i.nome, cor: i.cor || "", tamanho: i.tamanho || null, qtd });

  const chave = (i) => [i.slug || i.nome, i.cor || "", i.tamanho || ""].join("|");
  let desfazer = null; // último estado antes de uma remoção, para o "Desfazer"

  return {
    sincroniza() { if (sincroniza()) this.pinta(); },
    META,
    chave,
    itens() { return le().itens; },
    n() { return le().itens.reduce((a, i) => a + i.qtd, 0); },
    total() { return somaDe(le().itens); },
    progresso() { return progressoDe(le().itens); },
    temEcobag() { return le().itens.some(ehEcobag); },
    soma(item) {
      const s = le();
      desfazer = null;
      const antes = progressoDe(s.itens);
      const igual = s.itens.find((i) => i.slug === item.slug && i.cor === item.cor && i.tamanho === item.tamanho);
      if (igual) igual.qtd += 1;
      else s.itens.push({ slug: item.slug, nome: item.nome, cor: item.cor, tamanho: item.tamanho, peca: item.peca || "", pid: item.pid || null, preco: item.preco || 0, img: item.img || null, qtd: 1 });
      grava(s);
      // cancela uma remoção pendente do mesmo item: quem readiciona quer o item
      gravaAlvo([alvoDe(igual || s.itens[s.itens.length - 1], igual ? igual.qtd : 1)]);
      this.pinta();
      const depois = progressoDe(s.itens);
      return { total: somaDe(s.itens), cruzou: antes < META && depois >= META };
    },
    // Quantidade e remoção: o POST de adicionar não tem volta na loja, então a
    // edição vai pelo cookie de alvo, que o cart.tpl aplica lá.
    ajusta(ch, delta) {
      const s = le();
      desfazer = null;
      const i = s.itens.find((x) => chave(x) === ch);
      if (!i) return null;
      const nova = i.qtd + delta;
      if (nova < 1) return this.remove(ch);
      i.qtd = nova;
      grava(s);
      gravaAlvo([alvoDe(i, nova)]);
      this.pinta();
      return { removido: null };
    },
    remove(ch) {
      const s = le();
      const i = s.itens.find((x) => chave(x) === ch);
      if (!i) return null;
      desfazer = { itens: JSON.parse(JSON.stringify(s.itens)), quando: Date.now() };
      const fora = alvoDe(i, 0);
      const itens = s.itens.filter((x) => chave(x) !== ch);
      grava({ itens });
      gravaAlvo([fora]);
      this.pinta();
      return { removido: i };
    },
    desfaz() {
      if (!desfazer) return false;
      const itens = desfazer.itens;
      desfazer = null;
      grava({ itens });
      gravaAlvo(itens.map((i) => alvoDe(i, i.qtd)));
      this.pinta();
      return true;
    },
    temDesfazer() { return !!desfazer; },
    pendencias() { return alvoAtual().filter((a) => a.qtd === 0).length; },
    esvazia() {
      const s = le();
      if (s.itens.length) desfazer = { itens: JSON.parse(JSON.stringify(s.itens)), quando: Date.now() };
      gravaAlvo(s.itens.map((i) => alvoDe(i, 0)));
      grava({ itens: [] });
      this.pinta();
    },
    pinta() {
      const n = this.n();
      document.querySelectorAll("[data-sacola-n]").forEach((el) => {
        el.hidden = n === 0;
        el.textContent = n > 99 ? "99+" : String(n);
      });
      if (NIMBUS.gaveta) NIMBUS.gaveta.renderiza();
    },
  };
})();

// --- gaveta lateral da sacola ------------------------------------------------
NIMBUS.gaveta = (function () {
  let raiz = null;
  let ultimoFoco = null;
  // existe UMA ecobag no catálogo; prometer "a arte que você quiser" seria
  // oferecer escolha que não existe
  const ECOBAG = { nome: "Ecobag NIMBUS Wildstyle", url: "/loja/p/wildstyle/" };

  function ga4(nome, params) {
    if (typeof window.gtag !== "function") return;
    const itens = NIMBUS.sacola.itens().map((i) => ({ item_id: i.slug, item_name: i.nome, item_variant: i.tamanho ? i.cor + "/" + i.tamanho : i.cor, price: i.preco, quantity: i.qtd }));
    window.gtag("event", nome, Object.assign({ currency: "BRL", value: NIMBUS.sacola.total(), items: itens }, params || {}));
  }

  function urlCarrinho() {
    const cta = document.querySelector(".header__cta");
    return cta ? cta.href : "https://loja.nimbuswear.com.br/comprar/";
  }

  // Leitor de tela: a edição da sacola precisa ser falada, senão o cliente cego
  // clica em remover e não recebe resposta nenhuma.
  function anuncia(texto) {
    const vivo = raiz && raiz.querySelector(".gaveta__vivo");
    if (!vivo) return;
    vivo.textContent = "";
    setTimeout(() => { vivo.textContent = texto; }, 60);
  }

  function monta() {
    if (raiz) return;
    raiz = document.createElement("div");
    raiz.className = "gaveta";
    raiz.innerHTML =
      '<div class="gaveta__veu" data-gaveta-fecha></div>' +
      '<aside class="gaveta__painel" role="dialog" aria-modal="true" aria-label="Sua sacola" tabindex="-1">' +
      '<div class="gaveta__cabeca"><h2>Sua sacola</h2><button class="gaveta__fecha" data-gaveta-fecha aria-label="Fechar">&times;</button></div>' +
      '<div class="gaveta__festa" hidden></div>' +
      '<p class="gaveta__vivo" role="status" aria-live="polite"></p>' +
      '<div class="gaveta__itens"></div>' +
      '<div class="gaveta__regua"><div class="gaveta__trilho"><div class="gaveta__barra"></div></div><p class="gaveta__meta"></p></div>' +
      '<div class="gaveta__pe">' +
      '<div class="gaveta__soma"><span>Subtotal</span><b class="gaveta__subtotal"></b></div>' +
      '<p class="gaveta__frete"></p>' +
      '<a class="btn btn--primary gaveta__checkout" href="#" target="_blank" rel="noopener">Fechar pedido na loja</a>' +
      '<p class="gaveta__pendente" hidden></p>' +
      '<p class="gaveta__nota">Espelho do que você adicionou por aqui. Os valores finais aparecem na loja. <button type="button" class="gaveta__esvazia">Esvaziar</button></p>' +
      "</div></aside>";
    document.body.appendChild(raiz);
    raiz.inert = true; // fechada não deixa botão fantasma no caminho do Tab
    raiz.querySelectorAll("[data-gaveta-fecha]").forEach((el) => el.addEventListener("click", fecha));
    raiz.querySelector(".gaveta__esvazia").addEventListener("click", () => { NIMBUS.sacola.esvazia(); anuncia("Sacola esvaziada."); });
    raiz.querySelector(".gaveta__checkout").addEventListener("click", () => ga4("begin_checkout"));
    // Escape só fecha quando a gaveta está aberta, e Tab não escapa do painel
    document.addEventListener("keydown", (ev) => {
      if (!raiz.classList.contains("on")) return;
      if (ev.key === "Escape") { fecha(); return; }
      if (ev.key !== "Tab") return;
      const focaveis = raiz.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
    });
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
      const ch = NIMBUS.sacola.chave(i);
      const descricao = [i.nome, i.cor, i.tamanho].filter(Boolean).join(" ");
      const li = document.createElement("div");
      li.className = "gaveta__item";
      const img = document.createElement("img");
      if (i.img) img.src = i.img;
      img.alt = "";
      const info = document.createElement("div");
      info.className = "gaveta__info";
      const nome = document.createElement("strong");
      nome.textContent = i.nome;
      const det = document.createElement("span");
      det.textContent = [i.cor, i.tamanho].filter(Boolean).join(" · ");
      const passo = document.createElement("div");
      passo.className = "gaveta__passo";
      const menos = document.createElement("button");
      menos.type = "button";
      menos.className = "gaveta__qtd";
      menos.textContent = "−";
      menos.disabled = i.qtd <= 1;
      menos.setAttribute("aria-label", "Diminuir a quantidade de " + descricao);
      menos.addEventListener("click", () => { NIMBUS.sacola.ajusta(ch, -1); anuncia(descricao + ", quantidade " + (i.qtd - 1)); });
      const conta = document.createElement("span");
      conta.className = "gaveta__conta";
      conta.textContent = i.qtd;
      const mais = document.createElement("button");
      mais.type = "button";
      mais.className = "gaveta__qtd";
      mais.textContent = "+";
      mais.setAttribute("aria-label", "Aumentar a quantidade de " + descricao);
      mais.addEventListener("click", () => { NIMBUS.sacola.ajusta(ch, 1); anuncia(descricao + ", quantidade " + (i.qtd + 1)); });
      passo.append(menos, conta, mais);
      info.append(nome, det, passo);
      const lado = document.createElement("div");
      lado.className = "gaveta__lado";
      const preco = document.createElement("span");
      preco.className = "gaveta__preco";
      preco.textContent = NIMBUS.reais(i.preco * i.qtd);
      const tira = document.createElement("button");
      tira.type = "button";
      tira.className = "gaveta__tira";
      tira.innerHTML = "&times;";
      tira.setAttribute("aria-label", "Remover " + descricao + " da sacola");
      tira.addEventListener("click", () => {
        const r = NIMBUS.sacola.remove(ch);
        if (r && r.removido) { ga4("remove_from_cart", { items: [{ item_id: r.removido.slug, item_name: r.removido.nome, price: r.removido.preco, quantity: r.removido.qtd }], value: r.removido.preco * r.removido.qtd });
          anuncia(descricao + " saiu da sacola."); }
      });
      lado.append(preco, tira);
      li.append(img, info, lado);
      lista.appendChild(li);
    }
    if (NIMBUS.sacola.temDesfazer()) {
      const volta = document.createElement("div");
      volta.className = "gaveta__desfazer";
      const txt = document.createElement("span");
      txt.textContent = itens.length ? "Item removido." : "Sacola esvaziada.";
      const bt = document.createElement("button");
      bt.type = "button";
      bt.textContent = "Desfazer";
      bt.addEventListener("click", () => { NIMBUS.sacola.desfaz(); anuncia("Sacola restaurada."); });
      volta.append(txt, bt);
      lista.appendChild(volta);
    }
    const prog = NIMBUS.sacola.progresso();
    const temEco = NIMBUS.sacola.temEcobag();
    const pct = Math.min(100, (prog / META) * 100);
    raiz.querySelector(".gaveta__barra").style.width = pct + "%";
    const meta = raiz.querySelector(".gaveta__meta");
    if (!itens.length) meta.textContent = "Frete grátis e uma Ecobag de brinde a partir de " + NIMBUS.reais(META) + " (a Ecobag do brinde não conta na soma).";
    else if (prog >= META) meta.innerHTML = temEco
      ? "<b>Frete grátis garantido.</b> Use o cupom <b>ECOBAG</b> no checkout: uma das suas Ecobags sai de graça."
      : '<b>Frete grátis garantido.</b> Falta levar a Ecobag: <a href="' + ECOBAG.url + '">' + ECOBAG.nome + "</a>. No checkout, o cupom <b>ECOBAG</b> tira o valor dela do pedido.";
    else meta.textContent = "Faltam " + NIMBUS.reais(META - prog) + " para frete grátis e uma Ecobag de brinde.";
    // a festa comemora em uma frase; a instrução do cupom mora só na régua
    const festa = raiz.querySelector(".gaveta__festa");
    festa.hidden = !(itens.length && prog >= META);
    if (!festa.hidden && !festa.innerHTML) {
      festa.innerHTML = '<span class="gaveta__confete"></span>'.repeat(10) + "<p>Seu pedido ganhou frete grátis e uma Ecobag de presente.</p>";
    }
    // fechamento: subtotal e o que acontece com o frete
    raiz.querySelector(".gaveta__subtotal").textContent = NIMBUS.reais(total);
    const frete = raiz.querySelector(".gaveta__frete");
    frete.textContent = !itens.length ? "" : prog >= META ? "Frete grátis." : "Frete calculado no checkout pelo seu CEP.";
    // Honestidade: a loja é quem cobra. Enquanto uma remoção feita aqui não
    // tiver sido aplicada lá, o cliente precisa saber disso antes de pagar.
    const pend = raiz.querySelector(".gaveta__pendente");
    const nPend = NIMBUS.sacola.pendencias();
    pend.hidden = nPend === 0;
    if (nPend) pend.innerHTML = "Você editou a sacola por aqui. O carrinho da loja se ajusta quando você abrir o checkout: <b>confira a lista lá antes de pagar</b>.";
    raiz.querySelector(".gaveta__checkout").href = urlCarrinho();
  }

  function abre() {
    monta();
    renderiza();
    ultimoFoco = document.activeElement;
    raiz.inert = false;
    raiz.classList.add("on");
    document.body.style.overflow = "hidden";
    raiz.querySelector(".gaveta__painel").focus();
    ga4("view_cart");
  }
  function fecha() {
    if (!raiz) return;
    raiz.classList.remove("on");
    raiz.inert = true;
    document.body.style.overflow = "";
    const volta = ultimoFoco && document.contains(ultimoFoco) ? ultimoFoco : document.querySelector(".header__cta");
    if (volta) volta.focus();
    ultimoFoco = null;
  }

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

// --- segunda foto do card ----------------------------------------------------
// No desktop, hover. No celular não existe hover (e o toque abre o produto),
// então a foto de trás entra em ciclo sozinha, só nos cards que estão na tela.
// A imagem só é baixada quando o card aparece: antes ela vinha sempre, inclusive
// no celular, onde não tinha como ser exibida (198 KB numa página de coleção).
(function () {
  const versos = document.querySelectorAll(".card__hover[data-verso]");
  if (!versos.length) return;
  const toque = window.matchMedia("(hover: none)").matches;
  const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const naTela = new Set();

  const olho = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      const img = e.target.querySelector(".card__hover[data-verso]");
      if (e.isIntersecting) {
        if (img && !img.src) img.src = img.dataset.verso; // carrega ao aparecer
        naTela.add(e.target);
      } else {
        naTela.delete(e.target);
        e.target.classList.remove("card--verso");
      }
    }
  }, { rootMargin: "200px 0px" });
  document.querySelectorAll(".card").forEach((c) => { if (c.querySelector(".card__hover[data-verso]")) olho.observe(c); });

  if (!toque || parado) return; // no desktop o hover já resolve

  // Um timer só para a página toda, com os cards em 3 grupos defasados: a grade
  // ganha vida sem virar pisca-pisca.
  const PASSO = 1200, CICLO = 6; // cada card fica ~3,6s de cada lado
  let tique = 0;
  setInterval(() => {
    if (document.hidden || !naTela.size) return;
    tique++;
    let i = 0;
    for (const card of naTela) {
      const fase = (tique + (i % 3) * 2) % CICLO;
      card.classList.toggle("card--verso", fase >= CICLO / 2);
      i++;
    }
  }, PASSO);
})();

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

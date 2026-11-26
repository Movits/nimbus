// Comportamentos comuns da vitrine: reveal por IntersectionObserver, modais
// <dialog> dos projetos sociais, e a SACOLA: guardada só no navegador
// (localStorage), com gaveta lateral (itens, quantidade e o botão que leva à
// finalização em /loja/finalizar/). Sem dependências.
// Loja própria (plano de 13/11/2026, seção 7): a ponte com o carrinho da
// Nuvemshop saiu, com o POST num iframe escondido, os cookies de sincronia, a
// validade de 48 horas e a Ecobag de brinde (cupom ECOBAG, sem uso desde
// 13/08). Preço e frete de verdade são do servidor (servidor/src/), que mostra
// o resumo antes de pagar; o preço daqui é só o que a vitrine exibe.
window.NIMBUS = window.NIMBUS || {};

// Antes escrevia "R$ 1049,60" sem ponto de milhar e comia centavos redondos
// ("R$ 1200", "R$ 0"). O frete grátis é a R$ 399,90 e a sacola passa dos mil
// com facilidade, então o milhar aparece de verdade.
NIMBUS.reais = function (v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0).replace(/ /g, " ");
};

// Um item da sacola no formato do GA4. O item_id é o ID do produto na
// Nuvemshop (`pid`), não o slug (condição 29 do conselho r5, 12/08): a loja
// manda o ID dela no `purchase` e, com slug de um lado e ID do outro, o funil
// nunca fechava no relatório de itens. O slug segue em item_name, onde é mais
// legível que o nome longo com a peça.
NIMBUS.itemGA4 = function (i) {
  return {
    item_id: String(i.pid || i.slug || i.nome || ""),
    item_name: i.slug || i.nome,
    item_variant: i.tamanho ? i.cor + "/" + i.tamanho : i.cor,
    price: i.preco,
    quantity: i.qtd || 1,
  };
};

// --- Meta Pixel e TikTok Pixel ----------------------------------------------
// Os mesmos eventos de funil do GA4, com o MESMO item_id (condição 4 da Marina
// Duarte + condição 29 da Larissa Fontes, conselho r5): se Meta, TikTok e GA4
// contarem produtos diferentes, a atribuição nasce quebrada e a primeira
// campanha mede fantasma. Os snippets base são injetados pelo build só quando
// os IDs dos pixels existem (scripts/vitrine/build-paginas.mjs); sem eles,
// `fbq`/`ttq` não existem na página e cada chamada daqui é no-op.
// `view_cart` e `remove_from_cart` ficam fora: não têm evento padrão
// equivalente nos dois, e evento inventado não entra sem linha no tracking-plan.
(function () {
  const EQUIVALE = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
  };
  NIMBUS.pixel = function (nome, dados) {
    const evento = EQUIVALE[nome];
    if (!evento) return;
    const itens = (dados && dados.items) || [];
    const valor = dados && typeof dados.value === "number" ? dados.value : 0;
    if (typeof window.fbq === "function") {
      window.fbq("track", evento, {
        content_type: "product",
        content_ids: itens.map((i) => String(i.item_id)),
        contents: itens.map((i) => ({ id: String(i.item_id), quantity: i.quantity || 1 })),
        value: valor,
        currency: "BRL",
      });
    }
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track(evento, {
        contents: itens.map((i) => ({
          content_id: String(i.item_id), content_type: "product",
          content_name: i.item_name, price: i.price, quantity: i.quantity || 1,
        })),
        value: valor,
        currency: "BRL",
      });
    }
  };
})();

NIMBUS.sacola = (function () {
  // Cada linha é uma variante, pelo SKU, que é o que o servidor aceita no
  // POST /api/checkout (servidor/src/pedido.js).
  const KEY = "nimbus-sacola-v3";
  // O servidor recusa mais de 10 unidades de uma peça (QUANTIDADE_MAXIMA em
  // servidor/src/pedido.js): a sacola não deixa passar disso.
  const MAXIMO = 10;
  // v1 (só contador) e v2 (espelho do carrinho da Nuvemshop, sem SKU) saem de
  // cena: item sem SKU não vira pedido.
  try { ["nimbus-sacola", "nimbus-sacola-total", "nimbus-sacola-v2"].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* modo privado */ }

  const valido = (i) => i && typeof i.sku === "string" && i.sku !== "" && Number.isInteger(i.qtd) && i.qtd >= 1;
  function le() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      return s && Array.isArray(s.itens) ? s.itens.filter(valido) : [];
    } catch (e) { return []; }
  }
  function grava(itens) {
    try { localStorage.setItem(KEY, JSON.stringify({ itens })); } catch (e) { /* modo privado */ }
  }
  const somaDe = (itens) => itens.reduce((a, i) => a + (i.preco || 0) * i.qtd, 0);
  const chave = (i) => i.sku;
  let desfazer = null; // último estado antes de uma remoção, para o "Desfazer"

  // a sacola mudou em outra aba: o contador e a gaveta desta acompanham
  window.addEventListener("storage", (ev) => { if (ev.key === KEY) NIMBUS.sacola.pinta(); });

  return {
    MAXIMO,
    chave,
    itens: le,
    n() { return le().reduce((a, i) => a + i.qtd, 0); },
    total() { return somaDe(le()); },
    // Devolve cheio = true quando a peça já estava no máximo e nada mudou.
    soma(item) {
      const itens = le();
      desfazer = null;
      const igual = itens.find((i) => i.sku === item.sku);
      if (igual && igual.qtd >= MAXIMO) return { total: somaDe(itens), cheio: true };
      if (igual) igual.qtd += 1;
      else itens.push({ sku: item.sku, slug: item.slug, nome: item.nome, cor: item.cor, tamanho: item.tamanho || null, peca: item.peca || "", pid: item.pid || null, preco: item.preco || 0, img: item.img || null, qtd: 1 });
      grava(itens);
      this.pinta();
      return { total: somaDe(itens), cheio: false };
    },
    ajusta(ch, delta) {
      const itens = le();
      desfazer = null;
      const i = itens.find((x) => chave(x) === ch);
      if (!i) return null;
      const nova = Math.min(MAXIMO, i.qtd + delta);
      if (nova < 1) return this.remove(ch);
      i.qtd = nova;
      grava(itens);
      this.pinta();
      return { removido: null };
    },
    remove(ch) {
      const itens = le();
      const i = itens.find((x) => chave(x) === ch);
      if (!i) return null;
      desfazer = JSON.parse(JSON.stringify(itens));
      grava(itens.filter((x) => chave(x) !== ch));
      this.pinta();
      return { removido: i };
    },
    desfaz() {
      if (!desfazer) return false;
      grava(desfazer);
      desfazer = null;
      this.pinta();
      return true;
    },
    temDesfazer() { return !!desfazer; },
    esvazia() {
      const itens = le();
      if (itens.length) desfazer = JSON.parse(JSON.stringify(itens));
      grava([]);
      this.pinta();
    },
    // pedido feito: a sacola zera sem oferecer "Desfazer"
    limpa() {
      desfazer = null;
      grava([]);
      this.pinta();
    },
    pinta() {
      const n = this.n();
      document.querySelectorAll("[data-sacola-n]").forEach((el) => {
        el.hidden = n === 0;
        el.textContent = n > 99 ? "99+" : String(n);
      });
      if (NIMBUS.gaveta) NIMBUS.gaveta.renderiza();
      // a página de finalização redesenha a lista quando a sacola muda
      document.dispatchEvent(new CustomEvent("nimbus:sacola"));
    },
  };
})();

// --- gaveta lateral da sacola ------------------------------------------------
NIMBUS.gaveta = (function () {
  const FINALIZAR = "/loja/finalizar/";
  let raiz = null;
  let ultimoFoco = null;

  function ga4(nome, params) {
    const itens = NIMBUS.sacola.itens().map(NIMBUS.itemGA4);
    const dados = Object.assign({ currency: "BRL", value: NIMBUS.sacola.total(), items: itens }, params || {});
    if (typeof window.gtag === "function") window.gtag("event", nome, dados);
    NIMBUS.pixel(nome, dados);
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
      '<p class="gaveta__vivo" role="status" aria-live="polite"></p>' +
      '<div class="gaveta__itens"></div>' +
      '<div class="gaveta__pe">' +
      '<div class="gaveta__soma"><span>Subtotal</span><b class="gaveta__subtotal"></b></div>' +
      '<p class="gaveta__impacto">Este pedido destina <b>10% do lucro</b> ao projeto social que você escolher ao finalizar a compra.</p>' +
      '<a class="btn btn--primary gaveta__checkout" href="' + FINALIZAR + '">Finalizar a compra</a>' +
      '<p class="gaveta__nota">O frete do seu CEP e o total aparecem antes de pagar. Pix, boleto ou cartão em até 12x com juros. <button type="button" class="gaveta__esvazia">Esvaziar</button></p>' +
      "</div></aside>";
    document.body.appendChild(raiz);
    raiz.inert = true; // fechada não deixa botão fantasma no caminho do Tab
    raiz.querySelectorAll("[data-gaveta-fecha]").forEach((el) => el.addEventListener("click", fecha));
    raiz.querySelector(".gaveta__esvazia").addEventListener("click", () => { NIMBUS.sacola.esvazia(); anuncia("Sacola esvaziada."); });
    raiz.querySelector(".gaveta__checkout").addEventListener("click", (ev) => {
      // na própria finalização, o botão só fecha a gaveta e volta ao formulário
      if (location.pathname === FINALIZAR) { ev.preventDefault(); fecha(); return; }
      ga4("begin_checkout");
    });
    // Escape só fecha quando a gaveta está aberta, e Tab não escapa do painel
    document.addEventListener("keydown", (ev) => {
      if (!raiz.classList.contains("on")) return;
      if (ev.key === "Escape") { fecha(); return; }
      if (ev.key !== "Tab") return;
      const focaveis = [...raiz.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => !el.closest("[hidden]"));
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
    const MAXIMO = NIMBUS.sacola.MAXIMO;
    const lista = raiz.querySelector(".gaveta__itens");
    lista.innerHTML = "";
    if (!itens.length) {
      const vazio = document.createElement("p");
      vazio.className = "gaveta__vazia";
      vazio.innerHTML = 'Sua sacola está vazia. <a href="/loja/">A loja espera por você</a>.';
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
      mais.disabled = i.qtd >= MAXIMO;
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
        if (r && r.removido) { ga4("remove_from_cart", { items: [NIMBUS.itemGA4(r.removido)], value: r.removido.preco * r.removido.qtd });
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
    raiz.querySelector(".gaveta__subtotal").textContent = NIMBUS.reais(NIMBUS.sacola.total());
    // sacola vazia não tem o que finalizar
    raiz.querySelector(".gaveta__pe").hidden = !itens.length;
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
    const volta = ultimoFoco && document.contains(ultimoFoco) ? ultimoFoco : document.querySelector(".topo__cta[data-abre-sacola]");
    if (volta) volta.focus();
    ultimoFoco = null;
  }

  return { abre, fecha, renderiza };
})();

NIMBUS.sacola.pinta();
// volta pelo botão "voltar" (cache de página do navegador): o contador acompanha
window.addEventListener("pageshow", (ev) => { if (ev.persisted) NIMBUS.sacola.pinta(); });

// Sacola do header E do rodapé abrem a gaveta (P0-1 passo 4, conselho r4).
// Sem JS, o href leva direto à finalização.
document.querySelectorAll("[data-abre-sacola]").forEach((cta) => {
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

// --- topo ---------------------------------------------------------------------
// O topo é o mesmo da landing: transparente sobre o céu no alto da página e em
// vidro depois que a rolagem começa. Sem este script ele já nasce em vidro (a
// regra transparente depende da classe .js do <html>).
(function () {
  const topo = document.querySelector("[data-topo]");
  if (!topo) return;
  const menu = topo.querySelector(".topo__menu");
  const marca = () => {
    topo.classList.toggle("is-scrolled", window.scrollY > 24);
    topo.classList.toggle("is-aberto", Boolean(menu && menu.open));
  };
  marca();
  window.addEventListener("scroll", marca, { passive: true });
  if (!menu) return;
  menu.addEventListener("toggle", marca);
  // o menu do celular fecha ao tocar fora e com Esc, como um menu de verdade
  document.addEventListener("click", (ev) => { if (menu.open && !menu.contains(ev.target)) menu.open = false; });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
  });
})();

// --- aviso de abertura ---------------------------------------------------------
// Enquanto nada está à venda, a ação única do site é "Quero ser avisado". O
// clique é a intenção medida (generate_lead no tracking-plan.md); o envio do
// e-mail em si acontece no programa de e-mail do visitante e não é medível.
document.querySelectorAll("[data-aviso]").forEach((el) => {
  el.addEventListener("click", () => {
    if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { lead_source: el.dataset.aviso, method: "mailto" });
  });
});

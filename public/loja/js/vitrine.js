// Filtros e ordenação da página de coleção, em cima do grid já renderizado
// (os cards vêm no HTML gerado; o JS só mostra/esconde e reordena).
(function () {
  const grade = document.querySelector("[data-grade]");
  if (!grade) return;
  const cards = [...grade.children];
  const chips = document.querySelectorAll(".chip[data-peca]");
  const ordenar = document.querySelector("[data-ordenar]");
  let peca = "todas";

  function aplica() {
    let visiveis = cards.filter((c) => peca === "todas" || c.dataset.peca === peca);
    cards.forEach((c) => { c.style.display = visiveis.includes(c) ? "" : "none"; });
    if (ordenar && ordenar.value !== "destaque") {
      const dir = ordenar.value === "menor" ? 1 : -1;
      visiveis.sort((a, b) => dir * (Number(a.dataset.preco) - Number(b.dataset.preco)));
      visiveis.forEach((c) => grade.appendChild(c));
    } else {
      cards.forEach((c) => grade.appendChild(c));
    }
  }
  chips.forEach((ch) => ch.addEventListener("click", () => {
    peca = ch.dataset.peca;
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === ch)));
    aplica();
  }));
  if (ordenar) ordenar.addEventListener("change", aplica);

  // O estado vai para a URL e volta dela. Antes, ao voltar da PDP o navegador
  // restaurava o <select> mas aplica() nunca rodava na carga: a grade vinha
  // inteira e o select dizia "Maior preço", ou seja, mentia. De quebra, a
  // coleção filtrada vira link que dá para mandar para alguém.
  function paraURL() {
    const u = new URL(location.href);
    peca === "todas" ? u.searchParams.delete("peca") : u.searchParams.set("peca", peca);
    const o = ordenar ? ordenar.value : "destaque";
    o === "destaque" ? u.searchParams.delete("ordem") : u.searchParams.set("ordem", o);
    history.replaceState(null, "", u.pathname + (u.search || "") + u.hash);
  }
  function daURL() {
    const q = new URLSearchParams(location.search);
    const qp = q.get("peca");
    if (qp && [...chips].some((c) => c.dataset.peca === qp)) {
      peca = qp;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.peca === qp)));
    }
    const qo = q.get("ordem");
    if (ordenar && qo && [...ordenar.options].some((o) => o.value === qo)) ordenar.value = qo;
  }
  daURL();
  aplica();   // roda SEMPRE na carga: é o que faz o select e a grade concordarem
  [...chips, ordenar].filter(Boolean).forEach((el) =>
    el.addEventListener(el === ordenar ? "change" : "click", paraURL));
  window.addEventListener("pageshow", () => { daURL(); aplica(); });
})();

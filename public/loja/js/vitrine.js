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
})();

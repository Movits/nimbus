// Comportamentos comuns da vitrine: reveal por IntersectionObserver, modais
// <dialog> dos projetos sociais e o contador local da sacola. Sem dependências.
// O contador é um ESPELHO em localStorage do que foi adicionado pela vitrine;
// a verdade é o carrinho da loja (o cliente pode alterar por lá). Serve como
// indicador, e a Sacola do header sempre mostra o estado real.
window.NIMBUS = window.NIMBUS || {};
NIMBUS.sacola = {
  n() { return parseInt(localStorage.getItem("nimbus-sacola") || "0", 10) || 0; },
  soma(k) {
    try { localStorage.setItem("nimbus-sacola", String(this.n() + k)); } catch (e) { /* modo privado */ }
    this.pinta();
  },
  pinta() {
    const n = this.n();
    document.querySelectorAll("[data-sacola-n]").forEach((el) => {
      el.hidden = n === 0;
      el.textContent = n > 9 ? "9+" : String(n);
    });
  },
};
NIMBUS.sacola.pinta();

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

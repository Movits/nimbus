// NIMBUS - carregador do CSS da loja (Nuvemshop Scripts API, app 37697).
// Este arquivo e enviado ao Portal de Parceiros (aba Scripts) e roda na vitrine.
// Ele so injeta a camada de OVERRIDES hospedada no GitHub Pages; o CSS base da
// loja continua sendo o da "Edicao de CSS avancada" do painel. Atualizar o
// visual = editar public/loja/nimbus-loja.css e mergear na main (deploy Pages).
(function () {
  var ID = "nimbus-loja-css";
  if (document.getElementById(ID)) return;
  var link = document.createElement("link");
  link.id = ID;
  link.rel = "stylesheet";
  link.href = "https://nimbuswear.com.br/loja/nimbus-loja.css";
  (document.head || document.documentElement).appendChild(link);
})();

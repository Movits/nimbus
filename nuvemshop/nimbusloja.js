// STATUS: ticket do onload RETIRADO em 29/07 ("Bloqueado até nova ordem" no
// docs/ESTADO.md). Este loader nunca subiu ao Portal de Parceiros e o alvo
// public/loja/nimbus-loja.css NÃO EXISTE de propósito: o 404 dessa URL está
// cadastrado em scripts/link-check-docs.allow.json como a PROVA de que o CSS do
// app privado nunca foi publicado. Criar esse arquivo sem decisão explícita do
// dono ativaria o override silenciosamente (se o script um dia rodar) e
// falsificaria a prova. Guardado aqui como a única cópia do código do ticket.
//
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

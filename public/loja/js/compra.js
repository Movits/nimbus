// A compra na loja própria (plano de 13/11/2026, seções 3 e 7): a finalização
// (/loja/finalizar/), o acompanhamento do pedido (/loja/pedido/) e a volta do
// Mercado Pago (/loja/pedido/obrigado/). O contrato das rotas que este arquivo
// chama está em servidor/src/app.js; o HTML sai de build-paginas.mjs.
//
// Tudo o que vale dinheiro é do servidor: daqui vão só SKU e quantidade de cada
// item, e o que aparece no "Confira antes de pagar" é o que ele devolveu.
(function () {
  if (!window.NIMBUS || !NIMBUS.sacola) return;
  const CODIGO = /^NB-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  const reais = (centavos) => NIMBUS.reais(centavos / 100);
  const unidades = (n) => n + (n === 1 ? " unidade" : " unidades");
  const digitos = (s) => String(s || "").replace(/\D/g, "");

  // POST com corpo JSON. Nunca lança: rede caída vira status 0.
  async function chama(rota, corpo) {
    try {
      const resp = await fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const dados = await resp.json().catch(() => ({}));
      return { ok: resp.ok, status: resp.status, dados };
    } catch (e) {
      return { ok: false, status: 0, dados: {} };
    }
  }

  // Uma linha de conta: nome e detalhe à esquerda, valor à direita.
  function linha(nome, detalhe, valor) {
    const li = document.createElement("li");
    const esq = document.createElement("span");
    esq.className = "conta__nome";
    const b = document.createElement("b");
    b.textContent = nome;
    esq.append(b);
    if (detalhe) {
      const s = document.createElement("small");
      s.textContent = detalhe;
      esq.append(s);
    }
    const dir = document.createElement("span");
    dir.className = "conta__valor";
    dir.textContent = valor;
    li.append(esq, dir);
    return li;
  }
  const linhasDoServidor = (itens) =>
    itens.map((i) => linha(i.nome, unidades(i.quantidade), reais(i.preco_centavos * i.quantidade)));
  const freteTexto = (centavos) => (centavos === 0 ? "Grátis" : reais(centavos));
  // o link de pagar vem do servidor; só segue se for endereço https de verdade
  const linkSeguro = (url) => (typeof url === "string" && /^https:\/\/[^\s"'<>]+$/.test(url) ? url : null);

  // O valor que o <head> guardou do endereço (guardaLink, em build-paginas.mjs):
  // primeiro o desta carga, depois o da aba, para um recarregar funcionar.
  function link(nome) {
    if (window.NIMBUS_LINK) return window.NIMBUS_LINK;
    try { return sessionStorage.getItem(nome) || ""; } catch (e) { return ""; }
  }

  const finalizar = document.querySelector("[data-finalizar]");
  const pedido = document.querySelector("[data-pedido]");
  const obrigado = document.querySelector("[data-obrigado]");
  if (finalizar) finalizacao(finalizar);
  if (pedido) acompanhamento(pedido);
  if (obrigado) voltaDoPagamento(obrigado);

  // --- /loja/finalizar/ -----------------------------------------------------
  // Duas etapas na mesma página:
  //   dados: a sacola, contato, endereço, projeto social e o Turnstile;
  //   resumo: o "Confira antes de pagar" (Decreto 7.962, art. 4º), com o que o
  //   servidor calculou e o botão que leva ao link do Mercado Pago.
  // A `chave` de idempotência nasce com a página. Reenviar depois de uma falha
  // de rede usa a mesma chave e recebe o mesmo pedido. Ela só troca quando o
  // pedido já criado deixa de valer: sacola ou endereço corrigidos depois do
  // resumo, ou o servidor dizendo que a sacola mudou (409).
  function finalizacao(raiz) {
    const $ = (sel) => raiz.querySelector(sel);
    const vazia = $("[data-vazia]");
    const dados = $('[data-etapa="dados"]');
    const resumo = $('[data-etapa="resumo"]');
    const form = $("[data-form-compra]");
    const campos = form.elements;
    const erro = $("[data-erro]");
    const enviar = form.querySelector('button[type="submit"]');
    const robo = $("[data-turnstile]");
    const outro = $("[data-projeto-outro]");
    const { faixas: FAIXAS, norte: NORTE } = JSON.parse(document.getElementById("finalizar-dados").textContent);

    const novaChave = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    let chave = novaChave();

    function etapa(qual) {
      vazia.hidden = qual !== "vazia";
      dados.hidden = qual !== "dados";
      resumo.hidden = qual !== "resumo";
      if (qual === "dados") carregaRobo();
    }
    function avisa(texto) {
      erro.textContent = texto;
      erro.hidden = !texto;
      if (texto) erro.scrollIntoView({ block: "nearest" });
    }

    function pintaSacola() {
      const itens = NIMBUS.sacola.itens();
      if (!itens.length) { etapa("vazia"); return; }
      $("[data-sacola-lista]").replaceChildren(...itens.map((i) =>
        linha(i.nome, [i.cor, i.tamanho, unidades(i.qtd)].filter(Boolean).join(" · "), NIMBUS.reais(i.preco * i.qtd))));
      $("[data-sacola-subtotal]").textContent = NIMBUS.reais(NIMBUS.sacola.total());
      if (dados.hidden && resumo.hidden) etapa("dados");
    }
    // A sacola mudou (pela gaveta, ou em outra aba): o pedido do resumo não é
    // mais o da sacola, então volta para a primeira etapa com chave nova. O
    // aviso também chega sem mudança nenhuma (a volta do Mercado Pago pelo
    // botão "voltar" redesenha a página), por isso compara o conteúdo.
    const marcaDe = (itens) => JSON.stringify(itens.map((i) => [i.sku, i.quantidade ?? i.qtd]));
    let doResumo = "";
    document.addEventListener("nimbus:sacola", () => {
      if (!resumo.hidden && marcaDe(NIMBUS.sacola.itens()) !== doResumo) {
        chave = novaChave();
        etapa("dados");
        avisa("A sacola mudou. Revise o pedido de novo.");
      }
      pintaSacola();
    });

    // O estado sai do CEP, pelas mesmas faixas que o servidor confere.
    campos.cep.addEventListener("input", () => {
      const cep = Number(digitos(campos.cep.value));
      if (digitos(campos.cep.value).length !== 8) return;
      const faixa = FAIXAS.find(([, de, ate]) => cep >= de && cep <= ate);
      if (faixa) campos.uf.value = faixa[0];
    });
    form.addEventListener("change", (ev) => {
      if (ev.target.name !== "projeto") return;
      const sim = ev.target.value === "outro";
      outro.hidden = !sim;
      campos.projeto_outro.required = sim;
      if (sim) campos.projeto_outro.focus();
    });

    // Turnstile em modo explícito: o script da Cloudflare só carrega quando o
    // formulário aparece (sacola vazia não fala com ninguém), e o token, que
    // vale uma vez, é renovado depois de cada envio.
    let roboId = null;
    let roboToken = "";
    let roboCarregado = false;
    function carregaRobo() {
      if (roboCarregado) return;
      roboCarregado = true;
      window.nimbusTurnstile = function () {
        roboId = window.turnstile.render(robo, {
          sitekey: robo.dataset.turnstile,
          language: "pt-br",
          callback: (t) => { roboToken = t; },
          "expired-callback": () => { roboToken = ""; },
          "error-callback": () => { roboToken = ""; },
        });
      };
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=nimbusTurnstile";
      s.async = true;
      document.head.appendChild(s);
    }
    function renovaRobo() {
      roboToken = "";
      if (window.turnstile && roboId !== null) window.turnstile.reset(roboId);
    }

    function ocupado(sim) {
      enviar.disabled = sim;
      enviar.textContent = sim ? "Conferindo o pedido" : "Revisar o pedido";
      form.setAttribute("aria-busy", String(sim));
    }

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      avisa("");
      const itens = NIMBUS.sacola.itens();
      if (!itens.length) { etapa("vazia"); return; }
      if (!roboToken) { avisa("Espere a verificação contra robôs, logo acima do botão, terminar e tente de novo."); return; }
      const corpo = {
        chave,
        itens: itens.map((i) => ({ sku: i.sku, quantidade: i.qtd })),
        contato: { nome: campos.nome.value, email: campos.email.value, telefone: campos.telefone.value, cpf: campos.cpf.value },
        endereco: {
          cep: campos.cep.value, uf: campos.uf.value, cidade: campos.cidade.value, bairro: campos.bairro.value,
          rua: campos.rua.value, numero: campos.numero.value, complemento: campos.complemento.value,
        },
        projeto: campos.projeto.value,
        projeto_outro: campos.projeto.value === "outro" ? campos.projeto_outro.value : "",
        turnstile: roboToken,
      };
      ocupado(true);
      const r = await chama("/api/checkout", corpo);
      ocupado(false);
      renovaRobo();
      if (r.ok && r.dados.codigo && r.dados.resumo) { mostraResumo(r.dados, corpo); return; }
      if (r.status === 409) chave = novaChave();
      // Rede caída mantém a chave: se o pedido chegou a nascer, o reenvio
      // devolve o mesmo, sem segundo pagamento.
      avisa(r.status === 0 ? "Sem conexão com a loja. Confira a internet e tente de novo." : r.dados.erro || "Erro no servidor. Tente de novo.");
    });

    function mostraResumo(r, corpo) {
      const res = r.resumo;
      doResumo = marcaDe(corpo.itens);
      $("[data-resumo-codigo]").textContent = "Pedido " + r.codigo + ". Enviamos este resumo para o seu e-mail, com o link para pagar e o link para acompanhar o pedido.";
      $("[data-resumo-itens]").replaceChildren(...linhasDoServidor(res.itens));
      $("[data-resumo-frete]").textContent = freteTexto(res.frete_centavos);
      $("[data-resumo-total]").textContent = reais(res.total_centavos);
      const e = corpo.endereco;
      const cep = digitos(e.cep).replace(/^(\d{5})(\d{3})$/, "$1-$2");
      $("[data-resumo-entrega]").textContent = "Entrega: " + [e.rua + ", " + e.numero, e.complemento, e.bairro, e.cidade + ", " + e.uf, "CEP " + cep]
        .map((s) => s.trim()).filter(Boolean).join(" · ");
      const prazo = $("[data-resumo-prazo]");
      prazo.textContent = NORTE.includes(e.uf) ? prazo.dataset.norte : prazo.dataset.resto;
      const pagar = $("[data-pagar]");
      const url = linkSeguro(r.pagar);
      pagar.hidden = !url;
      if (url) pagar.href = url;
      else {
        // a mesma chave devolveu um pedido que já não espera pagamento
        chave = novaChave();
        avisa("Este pedido já não espera pagamento. Acompanhe pelo link do e-mail.");
      }
      etapa("resumo");
      const titulo = $("#resumo-titulo");
      titulo.focus();
      titulo.scrollIntoView({ block: "start" });
    }

    $("[data-corrige-endereco]").addEventListener("click", () => {
      chave = novaChave();
      avisa("");
      etapa("dados");
      campos.cep.focus();
    });

    pintaSacola();
  }

  // --- /loja/pedido/ ----------------------------------------------------------
  // O link do e-mail é /loja/pedido/#NB-XXXX-XXXX.token; o código e o token
  // vão no corpo do POST, nunca na URL.
  async function acompanhamento(raiz) {
    const $ = (sel) => raiz.querySelector(sel);
    const aviso = $("[data-pedido-aviso]");
    const valor = link("nimbus-pedido");
    const ponto = valor.indexOf(".");
    const codigo = ponto > 0 ? valor.slice(0, ponto) : "";
    const token = ponto > 0 ? valor.slice(ponto + 1) : "";
    if (!CODIGO.test(codigo) || !token) {
      aviso.textContent = "Para ver o seu pedido, abra o link do e-mail da compra.";
      return;
    }
    const r = await chama("/api/pedido", { codigo, token });
    if (!r.ok) {
      aviso.textContent = r.status === 404
        ? "Não achamos este pedido. Confira se o link do e-mail abriu inteiro."
        : "Não conseguimos abrir o pedido agora. Tente de novo em alguns minutos.";
      return;
    }
    const p = r.dados;
    $("[data-pedido-codigo]").textContent = "Pedido " + p.codigo;
    $("[data-pedido-status]").textContent = p.status_texto;
    const quando = new Date(p.criado_em);
    $("[data-pedido-data]").textContent = isNaN(quando) ? "" : "Feito em " + quando.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }) + ".";
    if (p.rastreio) {
      const rastreio = $("[data-pedido-rastreio]");
      rastreio.textContent = "Código de rastreio: " + p.rastreio;
      rastreio.hidden = false;
    }
    const url = linkSeguro(p.pagar);
    if (url) {
      $("[data-pedido-pagar] a").href = url;
      $("[data-pedido-pagar]").hidden = false;
    }
    $("[data-pedido-itens]").replaceChildren(...linhasDoServidor(p.itens));
    $("[data-pedido-frete]").textContent = freteTexto(p.frete_centavos);
    $("[data-pedido-total]").textContent = reais(p.total_centavos);
    $("[data-pedido-projeto]").textContent = "Projeto social: " + p.projeto + ".";
    aviso.hidden = true;
    $("[data-pedido-corpo]").hidden = false;

    // "Quero desistir" (Decreto 7.962, art. 5º): pela mesma ferramenta da
    // compra, com um passo de confirmação antes de gravar.
    const caixa = $("[data-desistir]");
    caixa.hidden = !p.pode_desistir;
    if (!p.pode_desistir) return;
    const abreLinha = $("[data-desistir-abre-linha]");
    const confirma = $("[data-desistir-confirma]");
    const erro = $("[data-desistir-erro]");
    const sim = $("[data-desistir-sim]");
    $("[data-desistir-abre]").addEventListener("click", () => {
      abreLinha.hidden = true;
      confirma.hidden = false;
      sim.focus();
    });
    $("[data-desistir-nao]").addEventListener("click", () => {
      confirma.hidden = true;
      abreLinha.hidden = false;
      $("[data-desistir-abre]").focus();
    });
    sim.addEventListener("click", async () => {
      sim.disabled = true;
      erro.hidden = true;
      const d = await chama("/api/pedido/desistir", { codigo, token });
      sim.disabled = false;
      if (!d.ok) {
        erro.textContent = d.dados.erro || "Não conseguimos registrar agora. Tente de novo ou escreva para o nosso e-mail.";
        erro.hidden = false;
        return;
      }
      $("[data-pedido-status]").textContent = d.dados.status_texto;
      const recado = $("[data-pedido-recado]");
      recado.textContent = "Desistência registrada. A confirmação foi para o seu e-mail.";
      recado.hidden = false;
      caixa.hidden = true;
      recado.setAttribute("tabindex", "-1");
      recado.focus();
    });
  }

  // --- /loja/pedido/obrigado/ -----------------------------------------------
  // O Mercado Pago volta com ?codigo=...&status=... (back_urls em
  // servidor/src/mercadopago.js). A situação daqui só escolhe a frase: quem
  // confirma o pagamento é o aviso assinado que chega ao servidor.
  function voltaDoPagamento(raiz) {
    const q = new URLSearchParams(link("nimbus-obrigado"));
    const codigo = q.get("codigo") || q.get("external_reference") || "";
    const status = q.get("collection_status") || q.get("status") || "";
    const EM_PROCESSO = ["O pagamento está em processamento.", "No Pix e no boleto, o pedido é confirmado quando o pagamento cair, e avisamos por e-mail."];
    const FRASES = {
      approved: ["Obrigado pelo pedido.", "Pagamento aprovado. A confirmação chega no seu e-mail em instantes."],
      pending: ["Pedido recebido.", EM_PROCESSO.join(" ")],
      in_process: ["Pedido recebido.", EM_PROCESSO.join(" ")],
    };
    const NAO_CONCLUIDO = ["O pagamento não foi concluído.", "Sua sacola continua guardada. Para tentar de novo, use o botão de pagar da página do pedido, pelo link do e-mail, ou finalize a compra outra vez."];
    // a situação vem da URL: só vale chave própria do mapa, nada herdado
    const conhecida = Object.hasOwn(FRASES, status);
    const frase = conhecida ? FRASES[status] : status ? NAO_CONCLUIDO : null;
    if (frase) {
      document.querySelector("[data-obrigado-titulo]").textContent = frase[0];
      raiz.querySelector("[data-obrigado-texto]").textContent = frase[1];
      document.title = frase[0].replace(/\.$/, "") + " | NIMBUS";
    }
    if (CODIGO.test(codigo)) {
      const el = raiz.querySelector("[data-obrigado-codigo]");
      el.textContent = "Pedido " + codigo;
      el.hidden = false;
    }
    // pedido pago ou a caminho: a sacola já virou pedido
    if (conhecida) NIMBUS.sacola.limpa();
  }
})();

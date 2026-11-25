// Confere o formulário de compra e monta o resumo do pedido.
//
// Função pura: recebe o corpo enviado pelo navegador e o índice de preço, e
// devolve { erro } ou o pedido calculado. Do navegador vêm só SKU, quantidade,
// contato, endereço e projeto social; preço e frete saem do servidor.

import { UFS, freteCentavos, ufDoCep } from "./frete.js";

export const QUANTIDADE_MAXIMA = 10;
export const ITENS_MAXIMOS = 20;

// Os projetos sociais do formulário (plano, seção 4, "Painel mínimo").
export const PROJETOS = {
  "fazenda-da-esperanca": "Fazenda da Esperança",
  "caritas-brasileira": "Cáritas Brasileira",
  "pequeno-cotolengo": "Pequeno Cotolengo",
  outro: "Outro",
};

const CONTROLE = /[\u0000-\u001f\u007f]/g;

function texto(valor, min, max) {
  if (typeof valor !== "string") return null;
  const limpo = valor.replace(CONTROLE, " ").replace(/\s+/g, " ").trim();
  return limpo.length >= min && limpo.length <= max ? limpo : null;
}

const digitos = (valor) => (typeof valor === "string" ? valor.replace(/\D/g, "") : "");

export function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const dv = ((soma * 10) % 11) % 10;
    if (dv !== Number(cpf[tamanho])) return false;
  }
  return true;
}

/**
 * @param {any} corpo o JSON do formulário
 * @param {Map<string, {sku:string, nome:string, preco_centavos:number}>} indice
 */
export function montarPedido(corpo, indice) {
  if (!corpo || typeof corpo !== "object") return { erro: "Pedido vazio." };

  const chave = typeof corpo.chave === "string" && /^[A-Za-z0-9-]{16,64}$/.test(corpo.chave) ? corpo.chave : null;
  if (!chave) return { erro: "Recarregue a página e tente de novo." };

  // Itens: SKU repetido soma a quantidade; o preço é sempre o do catálogo.
  if (!Array.isArray(corpo.itens) || corpo.itens.length === 0) return { erro: "A sacola está vazia." };
  if (corpo.itens.length > ITENS_MAXIMOS) return { erro: "Itens demais na sacola." };
  const quantidades = new Map();
  for (const item of corpo.itens) {
    const sku = typeof item?.sku === "string" ? item.sku.trim() : "";
    const qtd = item?.quantidade;
    if (!Number.isInteger(qtd) || qtd < 1) return { erro: "Quantidade inválida na sacola." };
    if (!indice.has(sku)) return { erro: "Uma peça da sacola não está mais disponível." };
    quantidades.set(sku, (quantidades.get(sku) || 0) + qtd);
  }
  const itens = [];
  let subtotal = 0;
  for (const [sku, quantidade] of quantidades) {
    if (quantidade > QUANTIDADE_MAXIMA) return { erro: `No máximo ${QUANTIDADE_MAXIMA} unidades de cada peça.` };
    const peca = indice.get(sku);
    const total = peca.preco_centavos * quantidade;
    subtotal += total;
    itens.push({ sku, nome: peca.nome, quantidade, preco_centavos: peca.preco_centavos, total_centavos: total });
  }

  const c = corpo.contato || {};
  const nome = texto(c.nome, 3, 120);
  if (!nome) return { erro: "Confira o nome." };
  const email = texto(c.email, 6, 254)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "Confira o e-mail." };
  const telefone = digitos(c.telefone);
  if (!/^\d{10,11}$/.test(telefone)) return { erro: "Confira o telefone, com DDD." };
  const cpf = digitos(c.cpf);
  if (!cpfValido(cpf)) return { erro: "Confira o CPF." };

  const e = corpo.endereco || {};
  const cep = digitos(e.cep);
  const ufDoCepInformado = ufDoCep(cep);
  if (!ufDoCepInformado) return { erro: "Confira o CEP." };
  const uf = typeof e.uf === "string" ? e.uf.trim().toUpperCase() : "";
  if (!UFS.has(uf)) return { erro: "Confira o estado." };
  if (uf !== ufDoCepInformado) return { erro: `O CEP informado não é de ${uf}.` };
  const cidade = texto(e.cidade, 2, 80);
  const bairro = texto(e.bairro, 1, 80);
  const rua = texto(e.rua, 2, 120);
  const numero = texto(e.numero, 1, 20);
  const complemento = e.complemento == null || e.complemento === "" ? "" : texto(e.complemento, 1, 80);
  if (!cidade || !bairro || !rua || !numero || complemento === null) return { erro: "Confira o endereço." };

  const projeto = typeof corpo.projeto === "string" && corpo.projeto in PROJETOS ? corpo.projeto : null;
  if (!projeto) return { erro: "Escolha o projeto social." };
  let projetoNome = PROJETOS[projeto];
  if (projeto === "outro") {
    const outro = texto(corpo.projeto_outro, 3, 80);
    if (!outro) return { erro: "Diga qual é o projeto social." };
    projetoNome = outro;
  }

  const frete = freteCentavos(uf, subtotal);
  return {
    chave,
    itens,
    subtotal_centavos: subtotal,
    frete_centavos: frete,
    total_centavos: subtotal + frete,
    contato: { nome, email, telefone, cpf },
    endereco: { cep, uf, cidade, bairro, rua, numero, complemento },
    projeto: projetoNome,
  };
}

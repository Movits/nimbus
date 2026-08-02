#!/usr/bin/env node
/**
 * Paridade de variantes: o que a vitrine POSTa x o que a loja aceita.
 *
 * Por que este arquivo existe. Em 01/08/2026 a Ecobag não entrava no carrinho e
 * ninguém percebia: a vitrine mandava dois eixos de variante (`Único` e `Crua`)
 * e a loja só tem um (`Bege`). O POST ia, a loja recusava a combinação e o
 * cliente voltava para uma sacola vazia, sem erro na tela. Foi um teste manual
 * no navegador que achou, produto a produto, e só deu para conferir dois.
 *
 * A fonte de verdade é o `LS.variants` que o tema imprime em toda página de
 * produto: uma lista de variantes reais com `option0`, `option1`, `option2`,
 * preço e SKU. Daí saem os eixos e os valores que a loja aceita de verdade,
 * sem depender de planilha, de CSV exportado nem de memória.
 *
 * A ordem importa: `option0` é o TAMANHO e `option1` é a COR, que é a mesma
 * ordem do rótulo que o carrinho imprime, `(GG, Preta)`. O `build-paginas`
 * emite `variation[0]` para o tamanho e `variation[1]` para a cor. Se algum dia
 * essa ordem inverter na loja, este teste falha antes do cliente.
 *
 *   node scripts/vitrine/parity-variantes.mjs          # bate na loja
 *   SKIP_REDE=1 node scripts/vitrine/parity-variantes.mjs   # pula (offline/CI)
 */

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOJA = "https://loja.nimbuswear.com.br";

if (process.env.SKIP_REDE === "1") {
  console.log("parity-variantes: SKIP_REDE=1, pulando.");
  process.exit(0);
}

const catalogo = JSON.parse(readFileSync(join(RAIZ, "public/loja/catalogo.json"), "utf8"));

/** Baixa a página de produto da loja. Usa curl porque o fetch do node não
 *  enxerga o proxy do ambiente, e aqui a rede é o ponto todo do teste. */
function baixa(url) {
  return execFileSync("curl", ["-sS", "-L", "--max-time", "45", "--fail", url], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

/** Extrai o array `LS.variants = [...]` contando colchetes, porque o JSON tem
 *  strings com colchetes dentro (installments_data vem escapado). */
function extraiVariantes(html) {
  const marca = "LS.variants = ";
  const i = html.indexOf(marca);
  if (i < 0) return null;
  const s = html.slice(i + marca.length);
  let profundidade = 0;
  let dentroDeString = false;
  let escapado = false;
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (escapado) { escapado = false; continue; }
    if (c === "\\") { escapado = true; continue; }
    if (c === '"') { dentroDeString = !dentroDeString; continue; }
    if (dentroDeString) continue;
    if (c === "[") profundidade++;
    else if (c === "]") {
      profundidade--;
      if (profundidade === 0) {
        try { return JSON.parse(s.slice(0, k + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

const eixoDa = (variantes, n) => [
  ...new Set(variantes.map((v) => v["option" + n]).filter((x) => x !== null && x !== undefined && x !== "")),
];

/** O que a página gerada realmente POSTa. Lê o HTML de verdade, não o modelo. */
function postDaVitrine(slug) {
  const arq = join(RAIZ, "public/loja/p", slug, "index.html");
  if (!existsSync(arq)) return null;
  const html = readFileSync(arq, "utf8");
  const form = html.match(/<form[^>]*data-sacola-form[\s\S]*?<\/form>/);
  if (!form) return null;
  const pid = form[0].match(/name="add_to_cart"\s+value="(\d+)"/)?.[1] || null;
  const campos = [...form[0].matchAll(/name="variation\[(\d)\]"\s+value="([^"]*)"([^>]*)/g)].map((m) => ({
    indice: Number(m[1]),
    valor: m[2],
    eixo: /data-var-tamanho/.test(m[3]) ? "tamanho" : /data-var-cor/.test(m[3]) ? "cor" : "?",
  }));
  return { pid, campos };
}

const igual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

const problemas = [];
const avisos = [];
let conferidos = 0;

for (const p of catalogo.produtos) {
  const url = `${LOJA}/produtos/${p.slug}/`;
  let html;
  try {
    html = baixa(url);
  } catch (e) {
    problemas.push(`${p.slug}: página da loja não respondeu (${String(e.message).split("\n")[0]})`);
    continue;
  }

  const variantes = extraiVariantes(html);
  if (!variantes || !variantes.length) {
    problemas.push(`${p.slug}: não achei LS.variants na página da loja`);
    continue;
  }
  const doProduto = variantes.filter((v) => String(v.product_id) === String(p.id ?? v.product_id));
  const usadas = doProduto.length ? doProduto : variantes;

  const eixosLoja = [0, 1, 2].map((n) => eixoDa(usadas, n)).filter((e) => e.length);
  const vitrine = postDaVitrine(p.slug);
  conferidos++;

  if (!vitrine) {
    problemas.push(`${p.slug}: página da vitrine sem formulário de sacola`);
    continue;
  }

  // 1) mesmo número de eixos
  if (vitrine.campos.length !== eixosLoja.length) {
    problemas.push(
      `${p.slug}: a vitrine manda ${vitrine.campos.length} eixo(s) e a loja tem ${eixosLoja.length}. ` +
        `Vitrine: [${vitrine.campos.map((c) => c.valor).join(", ")}] · Loja: [${eixosLoja.map((e) => e.join("/")).join("] [")}]`,
    );
    continue;
  }

  // 2) cada valor mandado existe no eixo correspondente, na mesma posição
  vitrine.campos.forEach((campo) => {
    const eixo = eixosLoja[campo.indice];
    if (!eixo) {
      problemas.push(`${p.slug}: manda variation[${campo.indice}] e a loja não tem esse eixo`);
    } else if (!eixo.includes(campo.valor)) {
      problemas.push(
        `${p.slug}: variation[${campo.indice}]="${campo.valor}" não existe na loja. Aceita: ${eixo.join(", ")}`,
      );
    }
  });

  // 3) o catálogo tem que listar exatamente os valores da loja, na ordem da loja
  const tamanhosLoja = eixosLoja.length === 2 ? eixosLoja[0] : [];
  const coresLoja = eixosLoja.length === 2 ? eixosLoja[1] : eixosLoja[0] || [];
  if (!igual(p.opcoes.tamanhos, tamanhosLoja)) {
    problemas.push(
      `${p.slug}: tamanhos do catálogo [${p.opcoes.tamanhos.join(", ")}] != loja [${tamanhosLoja.join(", ")}]`,
    );
  }
  if (!igual(p.opcoes.cores, coresLoja)) {
    problemas.push(`${p.slug}: cores do catálogo [${p.opcoes.cores.join(", ")}] != loja [${coresLoja.join(", ")}]`);
  }

  // 4) id do produto
  if (vitrine.pid && p.id && String(vitrine.pid) !== String(p.id)) {
    problemas.push(`${p.slug}: add_to_cart=${vitrine.pid} mas o catálogo diz id=${p.id}`);
  }

  // 5) preço, como aviso: quem manda no preço é a loja, e mexer nele é do dono
  const precoLoja = usadas[0]?.price_number;
  if (typeof precoLoja === "number" && typeof p.preco === "number" && Math.abs(precoLoja - p.preco) > 0.005) {
    avisos.push(`${p.slug}: preço da vitrine R$${p.preco} e da loja R$${precoLoja}`);
  }

  // 6) variante indisponível: o cliente escolhe e o POST volta vazio
  const mortas = usadas.filter((v) => v.available === false);
  if (mortas.length) {
    avisos.push(
      `${p.slug}: ${mortas.length} variante(s) sem estoque na loja (${mortas
        .map((v) => [v.option0, v.option1].filter(Boolean).join("/"))
        .join(", ")})`,
    );
  }
}

console.log(`parity-variantes: ${conferidos} produto(s) conferidos contra a loja.`);
for (const a of avisos) console.log(`  aviso  ${a}`);
for (const p of problemas) console.error(`  ERRO   ${p}`);

if (problemas.length) {
  console.error(`\n${problemas.length} divergência(s). O POST da vitrine não casa com a loja.`);
  process.exit(1);
}
console.log("Tudo casa: eixos, valores, ordem e ids.");

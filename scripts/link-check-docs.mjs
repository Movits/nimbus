#!/usr/bin/env node
/**
 * Confere se todo endereço escrito nos DOCUMENTOS existe de verdade.
 *
 * Por que este arquivo existe. Em 02/08/2026 eu mandei o dono abrir
 * `dashboard.nuvemshop.com.br` para editar o tema. Esse host não existe: a tela
 * dele deu ERR_CONNECTION_TIMED_OUT. O painel da Nuvemshop fica em
 * `loja.nimbuswear.com.br/admin`, no domínio da própria loja. Eu tinha escrito
 * o endereço de memória, sem abrir, e ainda deixei ele versionado num roteiro
 * que o dono ia seguir. Não foi a primeira vez, e ele cobrou com razão.
 *
 * O `link-check.mjs` já cobre as páginas geradas da vitrine. Ele não cobre o
 * markdown, que é justamente onde moram as instruções que uma pessoa vai
 * seguir. Este cobre o markdown, nos três repositórios.
 *
 * Como classifica, que é a parte que importa:
 *   ERRO   o endereço não responde nada (DNS não resolve, conexão recusada,
 *          tempo esgotado) ou responde 404/410. É link morto ou inventado.
 *   AVISO  respondeu 401, 403 ou 429. O host existe; o que barrou foi login ou
 *          proteção antirrobô. Não dá para decidir daqui, mas existir, existe.
 *   OK     qualquer 2xx ou 3xx.
 *
 * A distinção não é decorativa: um host inventado nunca responde, e um painel
 * legítimo atrás de login responde 403. Tratar os dois igual encheria a saída
 * de ruído e a gente pararia de ler.
 *
 *   node scripts/link-check-docs.mjs               # este repo
 *   node scripts/link-check-docs.mjs ../nimbus-assets ../nimbus-brain
 *   SKIP_REDE=1 node scripts/link-check-docs.mjs   # pula (offline/CI)
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { devNull } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

if (process.env.SKIP_REDE === "1") {
  console.log("link-check-docs: SKIP_REDE=1, pulando.");
  process.exit(0);
}

const IGNORA_PASTA = new Set(["node_modules", ".git", "dist", "historico", "raw"]);

/** Endereços que não respondem de propósito, cada um com motivo escrito.
 *  Ver `link-check-docs.allow.json`, ao lado deste arquivo. */
const PERMITIDOS = new Map(
  (JSON.parse(readFileSync(join(RAIZ, "scripts/link-check-docs.allow.json"), "utf8")).permitidos || [])
    .map((e) => [e.url, e.motivo]),
);

/** Endereços que a gente não bate: local, exemplo, ou host que muda por sessão. */
const NAO_CONFERE = [
  /^https?:\/\/(localhost|127\.0\.0\.1)/i,
  /^https?:\/\/(example|exemplo)\./i,
  /\{|\}|<|>|\$\{/, // template com variável dentro
];

function marcados(dir, achados = []) {
  for (const nome of readdirSync(dir)) {
    if (IGNORA_PASTA.has(nome)) continue;
    const caminho = join(dir, nome);
    const st = statSync(caminho);
    if (st.isDirectory()) marcados(caminho, achados);
    else if (nome.endsWith(".md")) achados.push(caminho);
  }
  return achados;
}

/** Tira a pontuação que a escrita cola no fim do endereço, sem comer parêntese
 *  que faça parte do próprio link (Wikipédia usa, por exemplo). */
function limpa(u) {
  let s = u.replace(/[.,;:!?]+$/, "");
  const abre = (s.match(/\(/g) || []).length;
  const fecha = (s.match(/\)/g) || []).length;
  if (fecha > abre) s = s.replace(/\)+$/, "");
  return s;
}

const arquivos = [];
const raizes = process.argv.slice(2).map((p) => resolve(p));
for (const r of [RAIZ, ...raizes]) {
  if (!existsSync(r)) {
    console.error(`link-check-docs: caminho não existe: ${r}`);
    process.exit(1);
  }
  arquivos.push(...marcados(r).map((a) => ({ arquivo: a, base: r })));
}

// endereço -> lista de "arquivo:linha" onde ele aparece
const ondeAparece = new Map();
for (const { arquivo, base } of arquivos) {
  const linhas = readFileSync(arquivo, "utf8").split("\n");
  linhas.forEach((linha, i) => {
    for (const m of linha.matchAll(/https?:\/\/[^\s)>"'`\]]+/g)) {
      const url = limpa(m[0]);
      if (NAO_CONFERE.some((re) => re.test(url))) continue;
      if (!ondeAparece.has(url)) ondeAparece.set(url, []);
      const onde = `${relative(dirname(base), arquivo)}:${i + 1}`;
      if (!ondeAparece.get(url).includes(onde)) ondeAparece.get(url).push(onde);
    }
  });
}

/** Devolve o código HTTP, ou 0 quando não houve resposta nenhuma.
 *  Tenta HEAD e cai para GET: muito servidor recusa HEAD e responde 405. */
function bate(url) {
  // devNull, não "/dev/null": o curl nativo do Windows não sabe escrever lá e
  // sai com erro 23, o que fazia TODO endereço parecer morto nesta máquina.
  const comum = ["-s", "-o", devNull, "-L", "--max-time", "25", "-w", "%{http_code}",
    "-A", "Mozilla/5.0 (compatible; NimbusLinkCheck/1.0)"];
  for (const metodo of [["-I"], ["-X", "GET"]]) {
    try {
      const codigo = Number(execFileSync("curl", [...comum, ...metodo, url], { encoding: "utf8" }).trim());
      if (codigo === 405 || codigo === 501) continue; // não aceita HEAD, tenta GET
      if (codigo > 0) return codigo;
    } catch {
      /* curl saiu com erro: sem resposta */
    }
  }
  return 0;
}

const erros = [];
const avisos = [];
let ok = 0;
let permitidos = 0;

const urls = [...ondeAparece.keys()].sort();
for (const url of urls) {
  if (PERMITIDOS.has(url)) {
    permitidos++;
    continue;
  }
  const codigo = bate(url);
  const onde = ondeAparece.get(url).join(", ");
  if (codigo === 0) {
    erros.push(`${url}\n         não respondeu nada (host inexistente, recusado ou fora do ar)\n         em ${onde}`);
  } else if (codigo === 404 || codigo === 410) {
    erros.push(`${url}\n         HTTP ${codigo}\n         em ${onde}`);
  } else if ([401, 403, 429].includes(codigo)) {
    avisos.push(`${url} HTTP ${codigo} (existe, mas pede login ou barra robô) em ${onde}`);
  } else {
    ok++;
  }
}

console.log(
  `link-check-docs: ${arquivos.length} documento(s), ${urls.length} endereço(s) únicos, ` +
    `${ok} OK, ${permitidos} na lista de exceções com motivo.`,
);
for (const a of avisos) console.log(`  aviso  ${a}`);
for (const e of erros) console.error(`  ERRO   ${e}`);

if (erros.length) {
  console.error(`\n${erros.length} endereço(s) que não existem. Documento manda pessoa a lugar nenhum.`);
  process.exit(1);
}
console.log("Todo endereço escrito nos documentos responde.");

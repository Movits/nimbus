#!/usr/bin/env node
/**
 * Portão docs:status — todo .md dos repositórios tem frontmatter de status.
 *
 * Nasceu da auditoria de 11/08/2026: 45 dos 104 .md do repo público não tinham
 * frontmatter nenhum, quatro decisões usavam "ativo" (fora do vocabulário) e o
 * README do cemitério estava "vigente" — e foi instrução velha sem aviso que
 * sequestrou uma auditoria em 26/07. A regra existia; faltava a máquina.
 *
 * O que ele valida, por arquivo .md versionado:
 *   1. Frontmatter YAML presente (bloco `---` na primeira linha).
 *   2. `status:` com valor do vocabulário: vigente | superado | concluido | historico.
 *   3. Data no frontmatter: `atualizado:` ou `updated:` em YYYY-MM-DD.
 *   4. Residência: dentro de docs/historico/, _superados/ ou _arquivo-* o
 *      status NÃO pode ser "vigente".
 *   5. Exceção vencida REPROVA: entrada do allowlist cujo arquivo já está
 *      conforme (ou sumiu) derruba o portão pedindo para removê-la. É a
 *      catraca: a lista só encolhe.
 *
 * Escopo: o repo público via `git ls-files "*.md"` + raízes extras por
 * argumento (ex.: ../nimbus-assets ../nimbus-brain). Raiz ausente é pulada
 * com aviso (o CI não tem os repos privados). No brain, `_templates/` e
 * `raw/` ficam de fora (templates têm placeholder; raw/ é imutável).
 *
 * Exceções: scripts/status-docs.allow.json, uma por arquivo e com motivo.
 * Uso: node scripts/verifica-status-docs.mjs [raizExtra...] [--semear]
 *   --semear: reescreve o allowlist com as violações atuais (só na criação
 *   do portão ou numa reorganização consciente; o normal é a lista encolher).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOW = join(RAIZ, "scripts", "status-docs.allow.json");
const VOCAB = new Set(["vigente", "superado", "concluido", "historico"]);
const SEMEAR = process.argv.includes("--semear");
const raizesExtra = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const arquivos = []; // { rotulo, caminho }

function listaRepo(raiz, prefixo, filtro = () => true) {
  let saida;
  try {
    saida = execFileSync("git", ["-C", raiz, "ls-files", "*.md"], {
      encoding: "utf8", timeout: 20000, windowsHide: true,
    });
  } catch {
    console.log(`  aviso: nao consegui listar ${raiz}; pulado.`);
    return;
  }
  for (const rel of saida.split("\n").filter(Boolean)) {
    if (!filtro(rel)) continue;
    arquivos.push({ rotulo: prefixo ? `${prefixo}/${rel}` : rel, caminho: join(raiz, rel) });
  }
}

listaRepo(RAIZ, "");
for (const extra of raizesExtra) {
  const raiz = resolve(RAIZ, extra);
  if (!existsSync(raiz)) { console.log(`  aviso: raiz ausente, pulada: ${extra}`); continue; }
  const nome = basename(raiz);
  const filtro = nome === "nimbus-brain"
    ? (rel) => !rel.startsWith("_templates/") && !rel.startsWith("raw/")
    : () => true;
  listaRepo(raiz, nome, filtro);
}

const violacoes = []; // { rotulo, problema }

for (const { rotulo, caminho } of arquivos) {
  let topo;
  try {
    topo = readFileSync(caminho, "utf8").replace(/^﻿/, "").slice(0, 800);
  } catch { violacoes.push({ rotulo, problema: "ilegivel" }); continue; }

  const linhas = topo.split(/\r?\n/);
  if (linhas[0].trim() !== "---") {
    violacoes.push({ rotulo, problema: "sem frontmatter (a primeira linha nao e ---)" });
    continue;
  }
  const fim = linhas.slice(1).findIndex((l) => l.trim() === "---");
  const bloco = fim === -1 ? linhas.slice(1) : linhas.slice(1, fim + 1);

  const mStatus = bloco.join("\n").match(/^status:\s*(\S+)/m);
  if (!mStatus) {
    violacoes.push({ rotulo, problema: "frontmatter sem chave status:" });
    continue;
  }
  const status = mStatus[1].normalize("NFC").toLowerCase();
  if (!VOCAB.has(status)) {
    violacoes.push({ rotulo, problema: `status "${mStatus[1]}" fora do vocabulario (vigente | superado | concluido | historico)` });
    continue;
  }
  const emQuarentena = /(^|\/)(docs\/historico|_superados|_arquivo-[^/]*)\//.test(rotulo.replace(/\\/g, "/"));
  if (emQuarentena && status === "vigente") {
    violacoes.push({ rotulo, problema: 'status "vigente" dentro de quarentena (docs/historico, _superados ou _arquivo-*)' });
    continue;
  }
  if (!/^(atualizado|updated):\s*\d{4}-\d{2}-\d{2}/m.test(bloco.join("\n"))) {
    violacoes.push({ rotulo, problema: "frontmatter sem data (atualizado: ou updated: em YYYY-MM-DD)" });
  }
}

if (SEMEAR) {
  const semente = {
    _leia: [
      "Excecoes do portao docs:status, uma por arquivo e com motivo. A lista SO ENCOLHE:",
      "excecao cujo arquivo ja esta conforme derruba o portao pedindo remocao.",
      "Semeada em 2026-08-11 na criacao do portao com as violacoes da epoca;",
      "cada lote da remediacao remove as suas.",
    ],
    permitidos: violacoes.map((v) => ({
      arquivo: v.rotulo,
      motivo: `pendente de triagem (${v.problema})`,
      desde: "2026-08-11",
    })),
  };
  writeFileSync(ALLOW, JSON.stringify(semente, null, 2) + "\n");
  console.log(`docs:status --semear: allowlist reescrito com ${violacoes.length} entrada(s).`);
  process.exit(0);
}

let permitidos = [];
if (existsSync(ALLOW)) {
  try { permitidos = JSON.parse(readFileSync(ALLOW, "utf8")).permitidos || []; }
  catch { console.error("  ERRO: status-docs.allow.json ilegivel."); process.exit(1); }
}
const permitidoPor = new Map(permitidos.map((p) => [p.arquivo.replace(/\\/g, "/"), p]));
const violadoPor = new Map(violacoes.map((v) => [v.rotulo.replace(/\\/g, "/"), v]));

const reprovadas = violacoes.filter((v) => !permitidoPor.has(v.rotulo.replace(/\\/g, "/")));
const vencidas = permitidos.filter((p) => !violadoPor.has(p.arquivo.replace(/\\/g, "/")));

console.log(`docs:status: ${arquivos.length} documento(s), ${violacoes.length} fora da regra, ${permitidos.length - vencidas.length} excecao(oes) validas.`);

for (const v of reprovadas) {
  console.error(`  ERRO   ${v.rotulo}: ${v.problema}`);
  console.error(`         conserto: frontmatter com status: (vigente | superado | concluido | historico) e atualizado: YYYY-MM-DD; em quarentena, status nao pode ser vigente.`);
}
for (const p of vencidas) {
  console.error(`  ERRO   excecao vencida no allowlist: ${p.arquivo} ja esta conforme (ou sumiu). Remova a entrada — a lista so encolhe.`);
}

if (reprovadas.length || vencidas.length) process.exit(1);
console.log("Todo documento carrega status dentro da regra.");

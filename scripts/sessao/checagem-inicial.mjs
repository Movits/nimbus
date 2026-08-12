#!/usr/bin/env node
// Hook SessionStart do NIMBUS. So le e imprime; NUNCA bloqueia (exit 0 sempre).
// Confere a sincronia dos 3 repositorios e a idade das paginas de estado, para
// a sessao nascer sabendo se o mundo local esta velho. Nasceu da auditoria de
// 11/08: sessoes partiam de checkout 17-24 commits atras e refaziam trabalho.
// Uso: node scripts/sessao/checagem-inicial.mjs [--rapido]
//   --rapido: sem git fetch (usado no matcher de compactacao).
// Windows-safe: execFileSync com array de args (sem shell, sem /dev/null;
// o caminho com espaco "Nimbus brain" viaja como argumento unico).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAPIDO = process.argv.includes('--rapido');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PUBLICO = path.resolve(AQUI, '..', '..');
const BRAIN_ANINHADO = path.join(PUBLICO, 'Nimbus brain');
const BRAIN_JUNCTION = path.resolve(PUBLICO, '..', 'nimbus-brain');
const BRAIN = existsSync(path.join(BRAIN_ANINHADO, '.git')) ? BRAIN_ANINHADO
  : existsSync(path.join(BRAIN_JUNCTION, '.git')) ? BRAIN_JUNCTION : null;
const ASSETS = path.resolve(PUBLICO, '..', 'nimbus-assets');

function git(repo, args, timeoutMs = 25000) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8', timeout: timeoutMs,
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  }).trim();
}

function checaRepo(nome, repo) {
  if (!repo || !existsSync(repo)) return `- ${nome}: NAO ENCONTRADO (esperado em ${repo})`;
  let notaFetch = '';
  if (!RAPIDO) {
    try { git(repo, ['fetch', '--quiet'], 45000); }
    catch { notaFetch = ' [fetch falhou; comparando com o ultimo origin conhecido]'; }
  }
  let sb;
  try { sb = git(repo, ['status', '-sb'], 10000); }
  catch (e) { return `- ${nome}: erro no git status (${String(e.message).slice(0, 80)})`; }
  const linhas = sb.split('\n');
  const atras = Number((linhas[0].match(/behind (\d+)/) || [])[1] || 0);
  const frente = Number((linhas[0].match(/ahead (\d+)/) || [])[1] || 0);
  const sujas = linhas.slice(1).filter(Boolean);
  const untracked = sujas.filter((l) => l.startsWith('??')).length;
  const mudadas = sujas.length - untracked;
  const p = [];
  if (atras) p.push(`${atras} commit(s) ATRAS do origin`);
  if (frente) p.push(`${frente} commit(s) SEM PUSH`);
  if (mudadas) p.push(`${mudadas} arquivo(s) modificado/deletado sem commit`);
  if (untracked) p.push(`${untracked} untracked`);
  return `- ${nome}: ${p.length ? 'ATENCAO: ' + p.join(', ') : 'ok (limpo e em dia)'}${notaFetch}`;
}

function idadeDoc(nome, arquivo, chaves) {
  try {
    const topo = readFileSync(arquivo, 'utf8').slice(0, 500);
    for (const chave of chaves) {
      const m = topo.match(new RegExp(String.raw`^${chave}:\s*(\d{4}-\d{2}-\d{2})`, 'm'));
      if (!m) continue;
      const dias = Math.floor((Date.now() - new Date(`${m[1]}T12:00:00`)) / 86400000);
      const alerta = dias > 2 ? `  <== VELHO (${dias} dias). Nao confie sem conferir o git log.` : '';
      return `- ${nome}: ${m[1]} (${dias} dia(s))${alerta}`;
    }
    return `- ${nome}: sem data '${chaves[0]}:' no frontmatter`;
  } catch { return `- ${nome}: nao consegui ler ${arquivo}`; }
}

try {
  const L = [];
  L.push(`=== CHECAGEM INICIAL NIMBUS ${RAPIDO ? '(pos-compactacao, sem fetch)' : '(hook automatico)'} ===`);
  L.push('Nada foi alterado; este bloco so informa.');
  L.push('');
  L.push('Sincronia dos 3 repositorios:');
  L.push(checaRepo('nimbus (publico)', PUBLICO));
  L.push(checaRepo('nimbus-brain (vault aninhado "Nimbus brain")', BRAIN));
  L.push(checaRepo('nimbus-assets', ASSETS));
  L.push('');
  L.push('Idade das paginas de estado:');
  L.push(idadeDoc('docs/ESTADO.md', path.join(PUBLICO, 'docs', 'ESTADO.md'), ['atualizado', 'updated']));
  if (BRAIN) L.push(idadeDoc('brain estado.md', path.join(BRAIN, 'estado.md'), ['updated', 'atualizado']));
  L.push('');
  L.push('Regras para a sessao:');
  L.push('1. Repo ATRAS => proponha `git pull --ff-only` ANTES de ler qualquer doc. Mundo velho gera retrabalho.');
  L.push('2. Arvore SUJA => pode ser trabalho da outra maquina; pergunte ao dono antes de commitar/descartar.');
  L.push('3. ESTADO velho => o disco e o git log vencem o documento.');
  L.push('4. Saida da sessao: `npm run sessao:fim` e resolver as FALTAs (docs/HANDOFF-SESSAO.md, secao 11).');
  console.log(L.join('\n'));
} catch (e) {
  console.log(`[checagem-inicial] falhou sem bloquear a sessao: ${String(e && e.message).slice(0, 120)}`);
}
process.exit(0);

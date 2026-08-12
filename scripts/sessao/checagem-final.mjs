#!/usr/bin/env node
// Portao do ritual de saida (docs/HANDOFF-SESSAO.md, secao 11).
// Uso: npm run sessao:fim
// Imprime checklist [OK]/[FALTA]; exit 1 se falta algo. Nao altera nada.
// Regra: se houve commit hoje em algum dos 3 repos, o docs/ESTADO.md precisa
// estar datado de hoje e o log.md do brain precisa de entrada de hoje.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PUBLICO = path.resolve(AQUI, '..', '..');
const BRAIN = [path.join(PUBLICO, 'Nimbus brain'), path.resolve(PUBLICO, '..', 'nimbus-brain')]
  .find((p) => existsSync(path.join(p, '.git'))) || null;
const ASSETS = path.resolve(PUBLICO, '..', 'nimbus-assets');
const agora = new Date();
const HOJE = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const git = (repo, args) => execFileSync('git', ['-C', repo, ...args], {
  encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
}).trim();

let faltas = 0;
const item = (ok, texto) => { if (!ok) faltas++; console.log(`${ok ? '[OK]   ' : '[FALTA]'} ${texto}`); };

function checaRepo(nome, repo) {
  if (!repo || !existsSync(repo)) { item(false, `${nome}: repo nao encontrado`); return { hoje: false }; }
  const sb = git(repo, ['status', '-sb']);
  const linhas = sb.split('\n');
  const suja = linhas.slice(1).filter(Boolean).length;
  const semPush = /ahead (\d+)/.test(linhas[0]);
  item(suja === 0, `${nome}: arvore limpa${suja ? ` (${suja} entrada(s) pendente(s))` : ''}`);
  item(!semPush, `${nome}: push feito${semPush ? ' (ha commits locais sem push)' : ''}`);
  let hoje = false;
  try { hoje = git(repo, ['log', '--oneline', '--since=midnight']).length > 0; } catch {}
  return { hoje };
}

console.log(`=== RITUAL DE SAIDA NIMBUS (${HOJE}) ===`);
const pub = checaRepo('nimbus (publico)', PUBLICO);
const brn = checaRepo('nimbus-brain', BRAIN);
const ast = checaRepo('nimbus-assets', ASSETS);
const houveCommitHoje = pub.hoje || brn.hoje || ast.hoje;

if (houveCommitHoje) {
  try {
    const estado = readFileSync(path.join(PUBLICO, 'docs', 'ESTADO.md'), 'utf8').slice(0, 500);
    item(estado.includes(`atualizado: ${HOJE}`),
      'docs/ESTADO.md com data de hoje (houve commit hoje => o ESTADO precisa refletir)');
  } catch { item(false, 'docs/ESTADO.md ilegivel'); }
  if (BRAIN) {
    try {
      const log = readFileSync(path.join(BRAIN, 'log.md'), 'utf8');
      item(log.includes(`[${HOJE}]`), `brain log.md com entrada "## [${HOJE}] ..."`);
    } catch { item(false, 'brain log.md ilegivel'); }
  }
} else {
  console.log('[info]  Nenhum commit hoje nos 3 repos: exigencia de ESTADO/log dispensada.');
}

console.log(faltas
  ? `\nRESULTADO: ${faltas} pendencia(s). Resolva, ou registre no chat POR QUE nao vai resolver.`
  : '\nRESULTADO: ritual de saida completo. Pode encerrar a sessao.');
process.exit(faltas ? 1 : 0);

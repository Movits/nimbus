// Normaliza as fontes da rodada para o mezanine de edição: 1080x1920, 30 fps CFR,
// H.264 all-intra (-g 1) CRF 16 — scrub fluido no Resolve e matemática de frames
// determinística no FCPXML (as fontes reais chegam com 30 e 59,94 fps misturados).
// Só a JANELA usada pelos cortes é codificada (com margem para handles de transição):
// all-intra do arquivo inteiro custaria gigabytes; o offset fica em fonte.mezanine
// no rodada.json e o monta-timeline desconta. Grava também o sha256 de cada fonte.
// Uso: node scripts/video/normaliza-clipes.mjs [dir-da-rodada] [--force]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { dirRodada, leRodada, caminhoMezanine, ffprobe } from './lib.mjs';

const MARGEM = 2; // segundos além do uso, para handles de transição e trim no Resolve

const args = process.argv.slice(2).filter((a) => a !== '--force');
const force = process.argv.includes('--force');
const dir = dirRodada(args[0]);
const { caminho, dados } = leRodada(dir);
const { largura = 1080, altura = 1920, fps = 30 } = dados.timeline ?? {};

// Janela de uso por fonte, derivada dos cortes.
const uso = new Map();
for (const corte of dados.cortes ?? []) {
  if (corte.transicao) continue;
  const fim = corte.in + corte.dur * (corte.velocidade ?? 1);
  const u = uso.get(corte.fonte) ?? { ini: Infinity, fim: 0 };
  u.ini = Math.min(u.ini, corte.in);
  u.fim = Math.max(u.fim, fim);
  uso.set(corte.fonte, u);
}

mkdirSync(join(dir, '_mezanine'), { recursive: true });
let mudouReceita = false;

for (const fonte of dados.fontes) {
  if (!existsSync(fonte.caminho)) {
    console.error(`ERRO: fonte ${fonte.id} não existe: ${fonte.caminho}`);
    process.exit(1);
  }
  const sha = createHash('sha256').update(readFileSync(fonte.caminho)).digest('hex');
  if (fonte.sha256 !== sha) { fonte.sha256 = sha; mudouReceita = true; }

  const u = uso.get(fonte.id);
  if (!u) { console.warn(`aviso: nenhum corte usa a fonte ${fonte.id}; mezanine não gerado.`); continue; }

  const origem = ffprobe(fonte.caminho);
  const inicio = Math.floor(Math.max(0, u.ini - MARGEM) * fps) / fps;
  const fim = Math.min(origem.duracao, u.fim + MARGEM);
  if (u.fim > origem.duracao + 0.01) {
    console.error(`ERRO: cortes de ${fonte.id} pedem até ${u.fim.toFixed(2)}s mas a fonte tem ${origem.duracao.toFixed(2)}s.`);
    process.exit(1);
  }

  const saida = caminhoMezanine(dir, fonte.id);
  const cobre = fonte.mezanine
    && fonte.mezanine.offset <= inicio + 0.01
    && fonte.mezanine.offset + fonte.mezanine.dur >= fim - 0.01;
  if (existsSync(saida) && cobre && !force) {
    console.log(`ok (já cobre a janela): ${fonte.id}`);
    continue;
  }

  const filtro = [
    `scale=${largura}:${altura}:force_original_aspect_ratio=decrease:flags=lanczos`,
    `pad=${largura}:${altura}:(ow-iw)/2:(oh-ih)/2:color=black`,
    'setsar=1',
    `fps=${fps}`,
  ].join(',');
  const cmd = [
    '-y', '-ss', String(inicio), '-i', fonte.caminho, '-t', String(fim - inicio),
    '-vf', filtro,
    '-fps_mode', 'cfr',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-g', '1',
    '-pix_fmt', 'yuv420p',
    ...(origem.temAudio ? ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'] : ['-an']),
    saida,
  ];
  console.log(`normalizando ${fonte.id}: janela ${inicio.toFixed(2)}s a ${fim.toFixed(2)}s (${origem.temAudio ? 'com' : 'sem'} áudio)...`);
  execFileSync('ffmpeg', cmd, { stdio: ['ignore', 'ignore', 'inherit'] });
  const gerado = ffprobe(saida);
  fonte.mezanine = { offset: inicio, dur: Number(gerado.duracao.toFixed(3)) };
  mudouReceita = true;
}

if (mudouReceita) {
  writeFileSync(caminho, JSON.stringify(dados, null, 2) + '\n');
  console.log('rodada.json atualizado (sha256 e janelas de mezanine).');
}

console.log('\nVerificação do mezanine:');
for (const fonte of dados.fontes) {
  if (!uso.has(fonte.id)) continue;
  const info = ffprobe(caminhoMezanine(dir, fonte.id));
  const okGeo = info.largura === largura && info.altura === altura && Math.abs(info.fps - fps) < 0.01;
  console.log(`  ${fonte.id}: ${info.largura}x${info.altura} @ ${info.fps.toFixed(2)} fps, ${info.duracao.toFixed(2)}s (offset ${fonte.mezanine.offset.toFixed(2)}s), áudio=${info.temAudio} ${okGeo ? '' : '← FORA DA SPEC'}`);
  if (!okGeo) process.exitCode = 1;
}

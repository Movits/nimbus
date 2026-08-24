// Gera legendas/<timeline>.srt a partir do bloco "legendas" de cada timeline
// da receita (v2: várias timelines por rodada; compat com o formato antigo).
// O SRT entra no Resolve por Timeline > Import > Subtitle (faixa nativa).
// Uso: node scripts/video/gera-srt.mjs [dir-da-rodada]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { dirRodada, leRodada } from './lib.mjs';

const dir = dirRodada(process.argv[2]);
const { dados } = leRodada(dir);
const timelines = dados.timelines ?? [{ nome: dados.timeline?.nome ?? 'timeline', legendas: dados.legendas ?? [] }];

function marca(s) {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const seg = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const mil = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${seg},${mil}`;
}

mkdirSync(join(dir, 'legendas'), { recursive: true });
let n = 0;
for (const tl of timelines) {
  const legendas = tl.legendas ?? [];
  if (legendas.length === 0) continue;
  const corpo = legendas
    .map((l, i) => `${i + 1}\n${marca(l.inicio)} --> ${marca(l.fim)}\n${l.texto}\n`)
    .join('\n');
  const saida = join(dir, 'legendas', `${tl.nome}.srt`);
  writeFileSync(saida, corpo + '\n');
  console.log(`gerado: ${tl.nome}.srt (${legendas.length} legendas)`);
  n++;
}
if (n === 0) console.log('nenhuma timeline com legendas; nada gerado.');

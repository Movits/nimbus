// Gera legendas/<timeline>.srt a partir do bloco "legendas" do rodada.json.
// O SRT entra no Resolve por Timeline > Import > Subtitle (faixa nativa, não queimada).
// Uso: node scripts/video/gera-srt.mjs [dir-da-rodada]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { dirRodada, leRodada } from './lib.mjs';

const dir = dirRodada(process.argv[2]);
const { dados } = leRodada(dir);
const legendas = dados.legendas ?? [];
if (legendas.length === 0) {
  console.log('rodada sem legendas; nada a gerar.');
  process.exit(0);
}

function marca(s) {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const seg = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const mil = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${seg},${mil}`;
}

const corpo = legendas
  .map((l, i) => `${i + 1}\n${marca(l.inicio)} --> ${marca(l.fim)}\n${l.texto}\n`)
  .join('\n');

mkdirSync(join(dir, 'legendas'), { recursive: true });
const saida = join(dir, 'legendas', `${dados.timeline.nome}.srt`);
writeFileSync(saida, corpo + '\n');
console.log(`gerado: ${saida} (${legendas.length} legendas)`);

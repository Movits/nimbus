// Utilidades compartilhadas do pipeline de vídeo (fluxo: docs/fluxos/video-ads.md).
// A "rodada" é a unidade de trabalho: uma pasta em nimbus-assets/marketing/<data>-<assunto>/video/
// com rodada.json (a receita versionada) dentro.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';

export const PONTEIRO_RODADA = 'C:/Users/rober/nimbus-assets/marketing/_rodada-atual.txt';

// Diretório da rodada: argumento da CLI ou o ponteiro _rodada-atual.txt.
export function dirRodada(arg) {
  if (arg) return resolve(arg).replaceAll('\\', '/');
  if (!existsSync(PONTEIRO_RODADA)) {
    throw new Error(`sem argumento e sem ponteiro ${PONTEIRO_RODADA}`);
  }
  return resolve(readFileSync(PONTEIRO_RODADA, 'utf8').trim()).replaceAll('\\', '/');
}

export function leRodada(dir) {
  const caminho = join(dir, 'rodada.json');
  if (!existsSync(caminho)) throw new Error(`rodada.json não encontrado em ${dir}`);
  return { caminho, dados: JSON.parse(readFileSync(caminho, 'utf8')) };
}

export function caminhoMezanine(dir, fonteId) {
  return join(dir, '_mezanine', `${fonteId}.mp4`).replaceAll('\\', '/');
}

export function ffprobe(caminho) {
  const sai = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'stream=index,codec_type,width,height,r_frame_rate,duration',
    '-show_entries', 'format=duration',
    '-of', 'json', caminho,
  ], { encoding: 'utf8' });
  const info = JSON.parse(sai);
  const video = (info.streams || []).find((s) => s.codec_type === 'video');
  const audio = (info.streams || []).find((s) => s.codec_type === 'audio');
  const [num, den] = (video?.r_frame_rate || '30/1').split('/').map(Number);
  return {
    duracao: Number(video?.duration ?? info.format?.duration ?? 0),
    largura: video?.width ?? 0,
    altura: video?.height ?? 0,
    fps: den ? num / den : 30,
    temAudio: Boolean(audio),
  };
}

// Tempo racional do FCPXML alinhado ao frame: N frames a <fps> → "N*100/(fps*100)s".
export function tRacional(segundos, fps) {
  const frames = Math.round(segundos * fps);
  return `${frames * 100}/${fps * 100}s`;
}

export function segundosDeRacional(texto) {
  if (texto == null) return 0;
  const m = String(texto).match(/^(-?\d+)(?:\/(\d+))?s$/);
  if (!m) return Number(texto) || 0;
  return Number(m[1]) / (m[2] ? Number(m[2]) : 1);
}

export function escapaXml(s) {
  return String(s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function urlDeArquivo(caminho) {
  return 'file:///' + resolve(caminho).replaceAll('\\', '/').split('/').map(encodeURIComponent).join('/').replace('%3A', ':');
}

// Tokenizador mínimo de XML (atributos sempre entre aspas duplas, como no FCPXML).
// Devolve [{tag, fecha, atributos, autofecha}] na ordem do documento.
export function tokensXml(xml) {
  const tokens = [];
  const re = /<(\/?)([\w-]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const atributos = {};
    const reAttr = /([\w:-]+)="([^"]*)"/g;
    let a;
    while ((a = reAttr.exec(m[3])) !== null) atributos[a[1]] = a[2];
    tokens.push({ tag: m[2], fecha: m[1] === '/', atributos, autofecha: m[4] === '/' });
  }
  return tokens;
}

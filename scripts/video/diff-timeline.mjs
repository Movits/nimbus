// Compara a timeline GERADA (receita) com a timeline EXPORTADA pelo Resolve depois
// da edição do dono, clipe a clipe, em segundos. O relatório é o feedback estrutural
// do ciclo de revisão: o que ele moveu, encurtou, removeu ou acrescentou.
// Uso: node scripts/video/diff-timeline.mjs [dir-da-rodada] [exportado.fcpxml]
//   Sem o 2º argumento, usa o .fcpxml mais novo de timeline/export/.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { dirRodada, leRodada, tokensXml, segundosDeRacional } from './lib.mjs';

const dir = dirRodada(process.argv[2]);
const { dados } = leRodada(dir);
const gerado = join(dir, 'timeline', `${dados.timeline.nome}.fcpxml`);

let exportado = process.argv[3];
if (!exportado) {
  const pasta = join(dir, 'timeline', 'export');
  const candidatos = readdirSync(pasta)
    .filter((f) => f.toLowerCase().endsWith('.fcpxml'))
    .map((f) => join(pasta, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (candidatos.length === 0) {
    console.error(`nenhum export em ${pasta}; no Resolve, rode Workspace > Scripts > nimbus-exporta-estado.`);
    process.exit(1);
  }
  exportado = candidatos[0];
}

// Extrai os asset-clips do spine (lane 0) na ordem do documento.
// O Resolve exporta FCPXML 1.10+ como bundle: um DIRETÓRIO *.fcpxml com Info.fcpxml dentro.
function clipesDe(caminho) {
  if (statSync(caminho).isDirectory()) {
    const dentro = join(caminho, 'Info.fcpxml');
    if (!existsSync(dentro)) throw new Error(`bundle sem Info.fcpxml: ${caminho}`);
    caminho = dentro;
  }
  const tokens = tokensXml(readFileSync(caminho, 'utf8'));
  // Lições do round-trip com o Resolve 21: (1) clipes retimados voltam como <ref-clip>
  // apontando um compound <media> nos resources — o spine INTERNO desse compound não é
  // a timeline, então só spines dentro de <library> contam; (2) nomes voltam com a
  // extensão do arquivo (fab1 → fab1.mp4): normalizamos tirando a extensão.
  const clipes = [];
  let dentroLibrary = 0;
  let dentroSpine = 0;
  let profundidadeClipe = 0;
  for (const tk of tokens) {
    if (tk.tag === 'library') { dentroLibrary += tk.fecha ? -1 : 1; continue; }
    if (!dentroLibrary) continue;
    if (tk.tag === 'spine') { dentroSpine += tk.fecha ? -1 : 1; continue; }
    if (!dentroSpine) continue;
    if (tk.tag === 'asset-clip' || tk.tag === 'ref-clip') {
      if (tk.fecha) { profundidadeClipe--; continue; }
      if (profundidadeClipe === 0 && !tk.atributos.lane) {
        clipes.push({
          nome: (tk.atributos.name ?? '?').replace(/\.[a-z0-9]{2,4}$/i, ''),
          inicioTl: segundosDeRacional(tk.atributos.offset),
          dur: segundosDeRacional(tk.atributos.duration),
          inFonte: segundosDeRacional(tk.atributos.start),
        });
      }
      if (!tk.autofecha) profundidadeClipe++;
    }
  }
  return clipes;
}

const a = clipesDe(gerado);
const b = clipesDe(exportado);
console.log(`receita:   ${gerado} (${a.length} clipes)`);
console.log(`exportado: ${exportado} (${b.length} clipes)\n`);

const fmt = (s) => `${s.toFixed(2)}s`;
const usadosB = new Set();
let diferencas = 0;

for (const [i, clipeA] of a.entries()) {
  // pareia com a ocorrência mais próxima do mesmo nome ainda não usada
  const candidatos = b.map((c, j) => ({ c, j }))
    .filter(({ c, j }) => !usadosB.has(j) && c.nome === clipeA.nome);
  if (candidatos.length === 0) {
    console.log(`REMOVIDO  #${i + 1} ${clipeA.nome} (estava em ${fmt(clipeA.inicioTl)}, ${fmt(clipeA.dur)})`);
    diferencas++;
    continue;
  }
  candidatos.sort((x, y) => Math.abs(x.c.inicioTl - clipeA.inicioTl) - Math.abs(y.c.inicioTl - clipeA.inicioTl));
  const { c: clipeB, j } = candidatos[0];
  usadosB.add(j);
  const meioFrame = 0.5 / (dados.timeline.fps ?? 30);
  const deltas = [];
  if (Math.abs(clipeA.inicioTl - clipeB.inicioTl) > meioFrame) deltas.push(`posição ${fmt(clipeA.inicioTl)} → ${fmt(clipeB.inicioTl)}`);
  if (Math.abs(clipeA.dur - clipeB.dur) > meioFrame) deltas.push(`duração ${fmt(clipeA.dur)} → ${fmt(clipeB.dur)}`);
  if (Math.abs(clipeA.inFonte - clipeB.inFonte) > meioFrame) deltas.push(`in da fonte ${fmt(clipeA.inFonte)} → ${fmt(clipeB.inFonte)}`);
  if (deltas.length) { console.log(`MUDOU     #${i + 1} ${clipeA.nome}: ${deltas.join(' · ')}`); diferencas++; }
  else console.log(`igual     #${i + 1} ${clipeA.nome}`);
}
for (const [j, clipeB] of b.entries()) {
  if (!usadosB.has(j)) { console.log(`NOVO      ${clipeB.nome} em ${fmt(clipeB.inicioTl)} (${fmt(clipeB.dur)})`); diferencas++; }
}

console.log(diferencas === 0
  ? '\ntimelines equivalentes: a receita reflete o que está no Resolve.'
  : `\n${diferencas} diferença(s): se alguma virou regra, atualize rodada.json e regenere (a receita nunca fica atrás da timeline).`);

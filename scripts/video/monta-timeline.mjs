// Monta as timelines da rodada como FCPXML 1.10 (o dialeto que o Resolve exporta,
// fechando o round-trip) a partir da receita rodada.json, referenciando o mezanine.
// v2 (24/08): uma rodada pode ter VÁRIAS timelines (`timelines: []`) e cada uma pode
// ter trilha musical (`trilha: {id, in}` referenciando `trilhas: []` da receita) —
// a trilha entra como clipe conectado em lane -1 (vira faixa de áudio no Resolve).
// Também emite projeto/rodada-config.lua para o menu interno do Resolve.
// Uso: node scripts/video/monta-timeline.mjs [dir-da-rodada]
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { dirRodada, leRodada, caminhoMezanine, ffprobe, tRacional, escapaXml, urlDeArquivo } from './lib.mjs';

const dir = dirRodada(process.argv[2]);
const { dados } = leRodada(dir);

// Compat: receita antiga tem `timeline` + `cortes` na raiz; a nova tem `timelines: []`.
const config = dados.config ?? dados.timeline ?? {};
const { largura = 1080, altura = 1920, fps = 30 } = config;
const timelines = dados.timelines ?? [{
  nome: dados.timeline?.nome ?? 'timeline',
  cortes: dados.cortes ?? [],
  titulos: dados.titulos ?? [],
  legendas: dados.legendas ?? [],
  trilha: dados.trilha ?? null,
}];

const t = (s) => tRacional(s, fps);

// Fontes de vídeo usadas por qualquer timeline → assets do mezanine.
const fontesUsadas = new Set(timelines.flatMap((tl) => (tl.cortes ?? []).filter((c) => !c.transicao).map((c) => c.fonte)));
const assets = new Map();
let proximoId = 2;
for (const fonte of dados.fontes ?? []) {
  if (!fontesUsadas.has(fonte.id)) continue;
  const mez = caminhoMezanine(dir, fonte.id);
  if (!existsSync(mez)) {
    console.error(`ERRO: mezanine de ${fonte.id} não existe; rode video:normaliza antes.`);
    process.exit(1);
  }
  assets.set(fonte.id, { id: `r${proximoId++}`, caminho: mez, info: ffprobe(mez), offsetMez: fonte.mezanine?.offset ?? 0 });
}

// Trilhas (áudio referenciado direto, sem mezanine).
const trilhas = new Map();
for (const trilha of dados.trilhas ?? []) {
  if (!existsSync(trilha.caminho)) {
    console.error(`ERRO: trilha ${trilha.id} não existe: ${trilha.caminho}`);
    process.exit(1);
  }
  trilhas.set(trilha.id, { id: `r${proximoId++}`, caminho: trilha.caminho.replaceAll('\\', '/'), info: ffprobe(trilha.caminho) });
}

const xmlAssets = [
  ...[...assets.entries()].map(([fonteId, a]) => {
    const audio = a.info.temAudio ? ' hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"' : '';
    return `    <asset id="${a.id}" name="${escapaXml(fonteId)}" start="0s" duration="${t(a.info.duracao)}" hasVideo="1"${audio} format="r1">
      <media-rep kind="original-media" src="${escapaXml(urlDeArquivo(a.caminho))}"/>
    </asset>`;
  }),
  ...[...trilhas.entries()].map(([trilhaId, a]) => `    <asset id="${a.id}" name="${escapaXml(trilhaId)}" start="0s" duration="${t(a.info.duracao)}" hasAudio="1" audioSources="1" audioChannels="2" audioRate="44100">
      <media-rep kind="original-media" src="${escapaXml(urlDeArquivo(a.caminho))}"/>
    </asset>`),
].join('\n');

function montaSequencia(tl) {
  const itensSpine = [];
  const clipesTl = [];
  let cursor = 0;
  let transicaoPendente = null;

  for (let corte of tl.cortes ?? []) {
    if (corte.transicao) { transicaoPendente = corte.transicao; continue; }
    const a = assets.get(corte.fonte);
    if (!a) { console.error(`ERRO [${tl.nome}]: fonte desconhecida "${corte.fonte}"`); process.exit(1); }
    const vel = corte.velocidade ?? 1;
    const inMez = corte.in - a.offsetMez;
    if (inMez < -1e-6 || inMez + corte.dur * vel > a.info.duracao + 0.05) {
      console.error(`ERRO [${tl.nome}]: corte de ${corte.fonte} (${corte.in}s a ${(corte.in + corte.dur * vel).toFixed(2)}s) fora da janela do mezanine; rode video:normaliza de novo.`);
      process.exit(1);
    }
    corte = { ...corte, in: Math.max(0, inMez) };
    if (transicaoPendente) {
      const dtr = transicaoPendente.dur ?? 0.5;
      itensSpine.push(`        <transition name="Cross Dissolve" offset="${t(cursor - dtr / 2)}" duration="${t(dtr)}"/>`);
      transicaoPendente = null;
    }
    const filhos = [];
    if (vel !== 1) {
      filhos.push(`          <timeMap>
            <timept time="0s" value="${t(corte.in)}" interp="linear"/>
            <timept time="${t(corte.dur)}" value="${t(corte.in + corte.dur * vel)}" interp="linear"/>
          </timeMap>`);
    }
    clipesTl.push({ tlInicio: cursor, dur: corte.dur, in: corte.in, vel, fonte: corte.fonte, filhos });
    // corte.mudo: só o vídeo entra (regra do dono, 24/08: áudio diegético contínuo
    // nunca é picotado pelos cortes — ou roda inteiro por baixo, ou o clipe entra mudo).
    const soVideo = (corte.mudo || tl.audio_base) ? ' srcEnable="video"' : '';
    itensSpine.push({ abre: `        <asset-clip ref="${a.id}" offset="${t(cursor)}" name="${escapaXml(corte.fonte)}" start="${t(corte.in)}" duration="${t(corte.dur)}" tcFormat="NDF"${soVideo}${a.info.temAudio && !soVideo ? ' audioRole="dialogue"' : ''}>`, filhos });
    cursor += corte.dur;
  }

  // Títulos: <title> conectado (lane 1) ao clipe que contém o início; máx. 22 chars.
  let nEstilo = 0;
  for (const titulo of tl.titulos ?? []) {
    if (titulo.texto.length > 22) {
      console.warn(`aviso [${tl.nome}]: título "${titulo.texto}" com ${titulo.texto.length} caracteres (máx. 22).`);
    }
    const pai = [...clipesTl].reverse().find((c) => c.tlInicio <= titulo.inicio + 1e-6);
    if (!pai) continue;
    const offsetFonte = pai.in + (titulo.inicio - pai.tlInicio) * pai.vel;
    const idEstilo = `ts-${tl.nome.replaceAll(/[^\w]/g, '')}-${nEstilo++}`;
    pai.filhos.push(`          <title ref="r_titulo" lane="1" offset="${t(offsetFonte)}" duration="${t(titulo.dur)}" name="${escapaXml(titulo.texto)}">
            <text>
              <text-style ref="${idEstilo}">${escapaXml(titulo.texto)}</text-style>
            </text>
            <text-style-def id="${idEstilo}">
              <text-style font="${escapaXml(titulo.fonte ?? 'Fraunces')}" fontSize="${titulo.tamanho ?? 64}" fontColor="1 1 1 1" bold="1" alignment="center"/>
            </text-style-def>
          </title>`);
  }

  // audio_base: UMA tomada de áudio contínua correndo por baixo de todos os cortes
  // de vídeo (regra do dono, 24/08 — ex.: oração/música da própria cena sem picotes).
  if (tl.audio_base && clipesTl.length) {
    const a = assets.get(tl.audio_base.fonte);
    if (!a) { console.error(`ERRO [${tl.nome}]: audio_base referencia fonte desconhecida "${tl.audio_base.fonte}"`); process.exit(1); }
    const pai = clipesTl[0];
    const inMez = (tl.audio_base.in ?? 0) - a.offsetMez;
    const durBase = Math.min(cursor, a.info.duracao - inMez);
    pai.filhos.push(`          <asset-clip ref="${a.id}" lane="-2" srcEnable="audio" offset="${t(pai.in)}" name="${escapaXml(tl.audio_base.fonte)}-audio" start="${t(Math.max(0, inMez))}" duration="${t(durBase)}" audioRole="dialogue"/>`);
  }

  // Trilha: clipe conectado em lane -1 no primeiro clipe do spine.
  if (tl.trilha && clipesTl.length) {
    const trilha = trilhas.get(tl.trilha.id);
    if (!trilha) { console.error(`ERRO [${tl.nome}]: trilha desconhecida "${tl.trilha.id}"`); process.exit(1); }
    const pai = clipesTl[0];
    const inicioNaMusica = tl.trilha.in ?? 0;
    const durTrilha = Math.min(cursor, Math.max(0, trilha.info.duracao - inicioNaMusica));
    pai.filhos.push(`          <asset-clip ref="${trilha.id}" lane="-1" offset="${t(pai.in)}" name="${escapaXml(tl.trilha.id)}" start="${t(inicioNaMusica)}" duration="${t(durTrilha)}" audioRole="music"/>`);
  }

  const xmlSpine = itensSpine.map((item) => {
    if (typeof item === 'string') return item;
    return item.filhos.length
      ? `${item.abre}\n${item.filhos.join('\n')}\n        </asset-clip>`
      : item.abre.replace(/>$/, '/>');
  }).join('\n');

  return { xmlSpine, duracao: cursor, nClipes: clipesTl.length };
}

mkdirSync(join(dir, 'timeline', 'export'), { recursive: true });
mkdirSync(join(dir, 'projeto'), { recursive: true });

const geradas = [];
for (const tl of timelines) {
  const { xmlSpine, duracao, nClipes } = montaSequencia(tl);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
    <format id="r1" frameDuration="${t(1 / fps)}" width="${largura}" height="${altura}" colorSpace="1-1-1 (Rec. 709)"/>
    <effect id="r_titulo" name="Basic Title" uid=".../Titles.localized/Bumper:Opener.localized/Basic Title.localized/Basic Title.moti"/>
${xmlAssets}
  </resources>
  <library>
    <event name="${escapaXml(dados.rodada)}">
      <project name="${escapaXml(tl.nome)}">
        <sequence format="r1" duration="${t(duracao)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
${xmlSpine}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`;
  const saida = join(dir, 'timeline', `${tl.nome}.fcpxml`);
  writeFileSync(saida, xml);
  geradas.push({ nome: tl.nome, caminho: saida.replaceAll('\\', '/'), duracao, nClipes });
  console.log(`gerado: ${tl.nome}.fcpxml (${nClipes} clipes, ${duracao.toFixed(2)}s)`);
}

const luaStr = (s) => `"${String(s).replaceAll('\\', '/').replaceAll('"', '\\"')}"`;
const configLua = `-- GERADO por scripts/video/monta-timeline.mjs; não editar à mão.
return {
  projeto = ${luaStr(dados.projeto)},
  export_dir = ${luaStr(join(dir, 'timeline', 'export'))},
  projeto_dir = ${luaStr(join(dir, 'projeto'))},
  largura = ${largura},
  altura = ${altura},
  fps = ${fps},
  timelines = {
${geradas.map((g) => `    { nome = ${luaStr(g.nome)}, fcpxml = ${luaStr(g.caminho)}, srt = ${luaStr(join(dir, 'legendas', `${g.nome}.srt`))} },`).join('\n')}
  },
}
`;
writeFileSync(join(dir, 'projeto', 'rodada-config.lua'), configLua);
console.log(`gerado: rodada-config.lua (${geradas.length} timeline(s))`);

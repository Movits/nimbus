// Monta a timeline da rodada como FCPXML 1.10 (o dialeto que o Resolve exporta,
// fechando o round-trip) a partir da receita rodada.json, referenciando o mezanine.
// Também emite projeto/rodada-config.lua — a ponte que o script do menu interno
// do Resolve (nimbus-importa-rodada.lua) lê para importar tudo com 1 clique.
// Uso: node scripts/video/monta-timeline.mjs [dir-da-rodada]
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { dirRodada, leRodada, caminhoMezanine, ffprobe, tRacional, escapaXml, urlDeArquivo } from './lib.mjs';

const dir = dirRodada(process.argv[2]);
const { dados } = leRodada(dir);
const { nome, largura = 1080, altura = 1920, fps = 30 } = dados.timeline;

// Recursos: um asset por fonte USADA nos cortes, medido no mezanine (30 fps CFR → frames exatos).
const fontesUsadas = new Set((dados.cortes ?? []).filter((c) => !c.transicao).map((c) => c.fonte));
const assets = new Map();
let proximoId = 2;
for (const fonte of dados.fontes) {
  if (!fontesUsadas.has(fonte.id)) continue;
  const mez = caminhoMezanine(dir, fonte.id);
  if (!existsSync(mez)) {
    console.error(`ERRO: mezanine de ${fonte.id} não existe; rode video:normaliza antes.`);
    process.exit(1);
  }
  assets.set(fonte.id, { id: `r${proximoId++}`, caminho: mez, info: ffprobe(mez), offsetMez: fonte.mezanine?.offset ?? 0 });
}

const t = (s) => tRacional(s, fps);

const xmlAssets = [...assets.entries()].map(([fonteId, a]) => {
  const audio = a.info.temAudio
    ? ' hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"'
    : '';
  return `    <asset id="${a.id}" name="${escapaXml(fonteId)}" start="0s" duration="${t(a.info.duracao)}" hasVideo="1"${audio} format="r1">
      <media-rep kind="original-media" src="${escapaXml(urlDeArquivo(a.caminho))}"/>
    </asset>`;
}).join('\n');

// Spine: percorre os cortes acumulando a posição na timeline; entradas {transicao}
// viram <transition> centrada no ponto de corte anterior.
const itensSpine = [];
const clipesTl = []; // [{tlInicio, dur, in, vel, fonte}] para ancorar títulos
let cursor = 0;
let transicaoPendente = null;
for (let corte of dados.cortes) {
  if (corte.transicao) { transicaoPendente = corte.transicao; continue; }
  const a = assets.get(corte.fonte);
  if (!a) { console.error(`ERRO: corte referencia fonte desconhecida "${corte.fonte}"`); process.exit(1); }
  const vel = corte.velocidade ?? 1;
  // "in" da receita é tempo da FONTE ORIGINAL; o mezanine cobre só a janela usada.
  const offsetMez = a.offsetMez;
  const inMez = corte.in - offsetMez;
  if (inMez < -1e-6 || inMez + corte.dur * vel > a.info.duracao + 0.05) {
    console.error(`ERRO: corte de ${corte.fonte} (${corte.in}s a ${(corte.in + corte.dur * vel).toFixed(2)}s) fora da janela do mezanine; rode video:normaliza de novo.`);
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
  itensSpine.push({ abre: `        <asset-clip ref="${a.id}" offset="${t(cursor)}" name="${escapaXml(corte.fonte)}" start="${t(corte.in)}" duration="${t(corte.dur)}" tcFormat="NDF"${a.info.temAudio ? ' audioRole="dialogue"' : ''}>`, filhos });
  cursor += corte.dur;
}

// Títulos: viram <title> conectado (lane 1) ao clipe do spine que contém o início,
// com offset em coordenadas de mídia do pai (convenção do FCPXML para conectados).
for (const titulo of dados.titulos ?? []) {
  const pai = [...clipesTl].reverse().find((c) => c.tlInicio <= titulo.inicio + 1e-6);
  if (!pai) continue;
  const offsetFonte = pai.in + (titulo.inicio - pai.tlInicio) * pai.vel;
  const idEstilo = `ts${pai.filhos.length + 1}-${clipesTl.indexOf(pai)}`;
  pai.filhos.push(`          <title ref="r_titulo" lane="1" offset="${t(offsetFonte)}" duration="${t(titulo.dur)}" name="${escapaXml(titulo.texto)}">
            <text>
              <text-style ref="${idEstilo}">${escapaXml(titulo.texto)}</text-style>
            </text>
            <text-style-def id="${idEstilo}">
              <text-style font="${escapaXml(titulo.fonte ?? 'Fraunces')}" fontSize="${titulo.tamanho ?? 96}" fontColor="1 1 1 1" bold="1" alignment="center"/>
            </text-style-def>
          </title>`);
}

const xmlSpine = itensSpine.map((item) => {
  if (typeof item === 'string') return item;
  return item.filhos.length
    ? `${item.abre}\n${item.filhos.join('\n')}\n        </asset-clip>`
    : item.abre.replace(/>$/, '/>');
}).join('\n');

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
      <project name="${escapaXml(nome)}">
        <sequence format="r1" duration="${t(cursor)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
${xmlSpine}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`;

mkdirSync(join(dir, 'timeline', 'export'), { recursive: true });
mkdirSync(join(dir, 'projeto'), { recursive: true });
const saidaXml = join(dir, 'timeline', `${nome}.fcpxml`);
writeFileSync(saidaXml, xml);

// Ponte para o Lua do menu interno do Resolve (dofile não lê JSON; lê Lua).
const luaStr = (s) => `"${String(s).replaceAll('\\', '/').replaceAll('"', '\\"')}"`;
const config = `-- GERADO por scripts/video/monta-timeline.mjs; não editar à mão.
return {
  projeto = ${luaStr(dados.projeto)},
  timeline = ${luaStr(nome)},
  fcpxml = ${luaStr(saidaXml)},
  srt = ${luaStr(join(dir, 'legendas', `${nome}.srt`))},
  export_dir = ${luaStr(join(dir, 'timeline', 'export'))},
  projeto_dir = ${luaStr(join(dir, 'projeto'))},
  largura = ${largura},
  altura = ${altura},
  fps = ${fps},
  midias = {
${[...assets.values()].map((a) => `    ${luaStr(a.caminho)},`).join('\n')}
  },
}
`;
writeFileSync(join(dir, 'projeto', 'rodada-config.lua'), config);

console.log(`gerado: ${saidaXml} (${clipesTl.length} clipes, ${cursor.toFixed(2)}s)`);
console.log(`gerado: ${join(dir, 'projeto', 'rodada-config.lua')}`);

import { pathToFileURL } from "node:url";
// Largura visivel do TRONCO numa faixa de linhas, para calibrar o raio efetivo
// da malha (--torso do compor).
//
// COMO ELE DECIDE O QUE E TECIDO: pela COR DO PROPRIO TECIDO, amostrada no
// centro da peca, e nao por um criterio fixo de fundo. A versao anterior
// assumia fundo colonial quente ((R-B) < 40) e, contra o CEU AZUL CLARO da
// colecao NUVEM, classificava o fundo inteiro como tecido (devolveu 1,0 na
// producao do 352723243). Amostrar a cor do tecido e imune ao cenario.
//
// CONVENCAO DO --torso, fixada em 26/07 apos duas producoes do MESMO produto
// (352725852) medirem de jeitos diferentes e entregarem curvatura visivelmente
// distinta entre as duas cores — que trocam no hover e portanto precisam bater:
//
//   torso = largura visivel da peca NA ALTURA DA ESTAMPA.
//
// E essa altura porque o raio da malha vale onde a arte cai, nao onde o tronco
// e mais largo. Medir abaixo das mangas da um tronco mais estreito e achata a
// arte; medir na altura do peito pega manga e infla o raio.
//
// Sempre confira o resultado contra 2R da tabela de medidas (R = largura plana
// / pi). Passe --esperado <fracao> para o modulo acusar sozinho quando a
// medida nao bate com a peca.
//
// Uso: node scripts/geometry/measure-torso.mjs <img> [yfrac=0.55] [--amostra 0.42] [--esperado 0.31]

import sharp from "sharp";

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

export async function medirTorso(src, yfrac = 0.55, { amostraY = null, tol = null, esperadoFrac = null } = {}) {
  const r = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = r.info;
  const px = (x, y) => {
    const o = (y * W + x) * 3;
    return [r.data[o], r.data[o + 1], r.data[o + 2]];
  };

  // 1. cor do tecido: mediana de uma janela central um pouco ACIMA da faixa
  //    pedida (evita a estampa quando ela existe) e estreita em x.
  const ay = Math.round((amostraY ?? Math.max(0.3, yfrac - 0.12)) * H);
  const amostras = [];
  for (let y = ay - 12; y <= ay + 12; y += 2) {
    for (let x = Math.round(0.45 * W); x <= Math.round(0.55 * W); x += 2) {
      if (y < 0 || y >= H) continue;
      amostras.push(px(x, y));
    }
  }
  amostras.sort((a, b) => lum(...a) - lum(...b));
  const tecido = amostras[Math.floor(amostras.length / 2)];
  const lt = lum(...tecido);
  const T = tol ?? (lt < 90 ? 42 : 52);

  const ehTecido = (c) =>
    Math.abs(c[0] - tecido[0]) < T && Math.abs(c[1] - tecido[1]) < T && Math.abs(c[2] - tecido[2]) < T;

  // O VAO PERMITIDO ERA DE 3 PIXELS, e isso e o defeito central deste modulo.
  //
  // Uma DOBRA SOMBREADA no meio do tronco sai da tolerancia de cor e parte a
  // corrida em duas. Com 3 px de ponte a maior metade vence e o resto some.
  // Reproduzido no 352703153-branca: o tecido vai de 22% a 92% da largura, uma
  // dobra em 44-47% (cerca de 30 px) divide, e o modulo devolvia 28,8% com
  // `suspeito: false` — 40% menor que o real, e declarado confiavel. Como o
  // --torso alimenta o raio efetivo da malha, isso corrompia a composicao em
  // silencio.
  const PONTE = Math.max(4, Math.round(0.03 * W));
  const linhas = [];
  for (let dy = -8; dy <= 8; dy += 4) {
    const y = Math.round(yfrac * H) + dy;
    if (y < 0 || y >= H) continue;
    // 1. corridas cruas de tecido
    const corridas = [];
    let ini = -1;
    for (let x = 0; x < W; x += 1) {
      const t = ehTecido(px(x, y));
      if (t && ini < 0) ini = x;
      if (!t && ini >= 0) { corridas.push([ini, x - 1]); ini = -1; }
    }
    if (ini >= 0) corridas.push([ini, W - 1]);
    if (!corridas.length) { linhas.push({ y, px: 0, frac: 0, x0: 0, x1: 0, pontes: 0 }); continue; }
    // 2. fechar vaos ate PONTE — dobra nao e borda de peca
    const unidas = [corridas[0].slice()];
    let pontes = 0, maiorVao = 0;
    for (let i = 1; i < corridas.length; i += 1) {
      const vao = corridas[i][0] - unidas[unidas.length - 1][1] - 1;
      if (vao <= PONTE) { unidas[unidas.length - 1][1] = corridas[i][1]; pontes += 1; maiorVao = Math.max(maiorVao, vao); }
      else unidas.push(corridas[i].slice());
    }
    unidas.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
    const [bx0, bx1] = unidas[0];
    // 3. quanto ficou de fora: se sobrou outra corrida grande, a medida e duvidosa
    const segunda = unidas[1] ? unidas[1][1] - unidas[1][0] : 0;
    linhas.push({
      y, px: bx1 - bx0 + 1, frac: +((bx1 - bx0 + 1) / W).toFixed(4),
      x0: +((100 * bx0) / W).toFixed(1), x1: +((100 * bx1) / W).toFixed(1),
      pontes, maior_vao_px: maiorVao,
      segunda_corrida_frac: +(segunda / W).toFixed(4),
    });
  }
  const fracs = linhas.map((l) => l.frac).sort((a, b) => a - b);
  const mediana = fracs[Math.floor(fracs.length / 2)];
  const segundaMax = Math.max(...linhas.map((l) => l.segunda_corrida_frac ?? 0));

  // SUSPEITO tem que disparar tambem quando o modulo NAO SABE. A versao
  // anterior so acusava os dois extremos (quase tudo tecido, ou quase nada) e
  // por isso devolveu "confiavel" numa medida 40% menor que a real.
  const razoes = [];
  if (mediana > 0.92) razoes.push("quase a linha inteira virou tecido: a cor do tecido esta perto da cor do fundo");
  if (mediana < 0.15) razoes.push("quase nada foi classificado como tecido");
  if (segundaMax > 0.12) razoes.push(`sobrou outra corrida de tecido com ${(100 * segundaMax).toFixed(1)}% da largura fora da medida: a peca provavelmente foi partida por dobra ou por braco`);
  if (esperadoFrac != null) {
    const desvio = mediana / esperadoFrac - 1;
    if (Math.abs(desvio) > 0.3) razoes.push(`medida ${(100 * desvio).toFixed(0)}% distante do esperado pela tabela de medidas (${(100 * esperadoFrac).toFixed(1)}%)`);
  }
  return {
    cor_tecido: tecido, luminancia_tecido: +lt.toFixed(1), tolerancia: T, ponte_px: PONTE,
    linhas, medianaFrac: mediana,
    suspeito: razoes.length > 0,
    nota: razoes.length ? `SUSPEITO: ${razoes.join("; ")}. Medir a olho no zoom.` : null,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const i = process.argv.indexOf("--amostra");
  const e = process.argv.indexOf("--esperado");
  const r = await medirTorso(process.argv[2], Number(process.argv[3] ?? 0.55), {
    amostraY: i > -1 ? Number(process.argv[i + 1]) : null,
    // fracao esperada da largura, vinda da tabela de medidas: com ela o modulo
    // consegue dizer "isto nao bate com a peca" em vez de calar
    esperadoFrac: e > -1 ? Number(process.argv[e + 1]) : null,
  });
  console.log(JSON.stringify(r, null, 1));
}

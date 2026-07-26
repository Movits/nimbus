// APLICAR A ARTE NO TECIDO, e nao POR CIMA dele.
//
// O compositor anterior curvava a arte num cilindro liso e multiplicava por
// uma sombra suavizada. Cilindro nao e camiseta amassada: a arte saia como um
// retangulo de bordas retas, sem nenhuma dobra atravessando o desenho,
// enquanto o pano ao redor tinha vinco e sombra. Le como PNG colado, e foi
// exatamente essa a reclamacao do dono sobre as 77 capas.
//
// O que falta e RELEVO. A luminancia do proprio blank ja carrega as dobras:
// onde o pano vinca, escurece. Entao:
//
//   1. campo de dobra  = luminancia passa-banda (tira a iluminacao global,
//      guarda o vinco). E uma altura aproximada da superficie.
//   2. deslocamento    = gradiente desse campo. A arte e reamostrada deslocada,
//      entao ela ENTORTA junto com o pano em vez de passar reto por cima.
//   3. sombra          = o proprio campo, multiplicando a tinta, para o vinco
//      escurecer o desenho como escurece o tecido.
//
// A camada da arte e montada separada e so depois composta, o que permite
// medir a camada sozinha e trocar o modelo de tecido sem mexer na malha.
import sharp from "sharp";

const LUM = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

/** Media em caixa, separavel, com raio em pixels. */
function borrar(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y += 1) {
    let s = 0;
    for (let x = -r; x <= r; x += 1) s += src[y * W + Math.min(W - 1, Math.max(0, x))];
    for (let x = 0; x < W; x += 1) {
      tmp[y * W + x] = s / (2 * r + 1);
      const sai = Math.min(W - 1, Math.max(0, x - r));
      const entra = Math.min(W - 1, Math.max(0, x + r + 1));
      s += src[y * W + entra] - src[y * W + sai];
    }
  }
  for (let x = 0; x < W; x += 1) {
    let s = 0;
    for (let y = -r; y <= r; y += 1) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y += 1) {
      out[y * W + x] = s / (2 * r + 1);
      const sai = Math.min(H - 1, Math.max(0, y - r));
      const entra = Math.min(H - 1, Math.max(0, y + r + 1));
      s += tmp[entra * W + x] - tmp[sai * W + x];
    }
  }
  return out;
}

/**
 * Campo de dobra do tecido, normalizado.
 *
 * Passa-banda: `borrar(pequeno) - borrar(grande)`. O termo grande carrega a
 * iluminacao da cena (que a arte NAO deve seguir, senao ela ganha degrade
 * inteiro) e o pequeno carrega o vinco (que ela DEVE seguir).
 *
 * Normalizar pelo desvio local e o que faz funcionar em peca preta: la a
 * amplitude absoluta do vinco e de poucos niveis, e sem normalizar o relevo
 * sumiria justamente onde a reclamacao era maior.
 */
export function campoDeDobra(bg, { rPequeno = 3, rGrande = 24 } = {}) {
  const { width: W, height: H, data } = bg;
  const lum = new Float32Array(W * H);
  for (let p = 0; p < W * H; p += 1) lum[p] = LUM(data, p * 3);
  const fino = borrar(lum, W, H, rPequeno);
  const grosso = borrar(lum, W, H, rGrande);
  const campo = new Float32Array(W * H);
  for (let p = 0; p < W * H; p += 1) campo[p] = fino[p] - grosso[p];
  // desvio robusto para normalizar
  const amostra = [];
  for (let p = 0; p < W * H; p += 997) amostra.push(Math.abs(campo[p]));
  amostra.sort((a, b) => a - b);
  const escala = Math.max(1.5, amostra[Math.floor(amostra.length * 0.75)] * 1.4826);
  for (let p = 0; p < W * H; p += 1) campo[p] = Math.max(-3, Math.min(3, campo[p] / escala));
  return { campo, escala, W, H };
}

/**
 * Compoe a camada da arte sobre o fundo, seguindo o tecido.
 *
 * @param bg    imagem do blank, raw 3 canais
 * @param layer camada da arte ja projetada pela malha, RGBA
 * @param opts  relevo (px de deslocamento por unidade de dobra), sombra (ganho)
 */
export function aplicarNoTecido(bg, layer, {
  relevo = 3, sombra = 0.9, opacidade = 0.93, min = 0.6, max = 1.35,
} = {}) {
  const { width: W, height: H } = bg;
  // DUAS ESCALAS, e a separacao importa.
  //
  // Um campo so misturava DOBRA (dezenas de pixels) com TRAMA (2 a 3 pixels).
  // Deslocar pela trama treme a arte na escala do pixel e destroi o texto: no
  // piloto o "NIMBUS" do cartucho ficou ilegivel, contra a regra de que texto
  // e sagrado.
  //
  // Deslocamento segue so a DOBRA (passa-banda largo). Sombra pode usar campo
  // mais fino, porque escurecer na trama e justamente o que integra a tinta ao
  // pano sem mexer na forma das letras.
  const { campo: dobra } = campoDeDobra(bg, { rPequeno: 9, rGrande: 40 });
  const { campo } = campoDeDobra(bg);
  const dst = bg.data;
  const L = layer.data;

  const amostraDobra = (x, y) => dobra[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];

  // referencia da sombra: mediana do campo ONDE HA TINTA, para o multiplicador
  // ficar centrado em 1 na propria regiao da arte e nao criar faixa fantasma
  const comTinta = [];
  for (let p = 0; p < W * H; p += 1) if (L[p * 4 + 3] > 8) comTinta.push(campo[p]);
  if (!comTinta.length) return { pixels: 0 };
  comTinta.sort((a, b) => a - b);
  const refDobra = comTinta[Math.floor(comTinta.length / 2)];

  let n = 0;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const p = y * W + x;
      // DESLOCAMENTO: le a arte de onde o pano "empurrou" o ponto.
      const gx = (amostraDobra(x + 1, y) - amostraDobra(x - 1, y)) * 0.5;
      const gy = (amostraDobra(x, y + 1) - amostraDobra(x, y - 1)) * 0.5;
      const sx = Math.round(x - relevo * gx * 8);
      const sy = Math.round(y - relevo * gy * 8);
      const q = Math.min(H - 1, Math.max(0, sy)) * W + Math.min(W - 1, Math.max(0, sx));
      const a = L[q * 4 + 3] / 255;
      if (a <= 0.004) continue;
      n += 1;
      // SOMBRA: o vinco escurece a tinta como escurece o pano.
      const k = Math.max(min, Math.min(max, 1 + sombra * (campo[p] - refDobra)));
      const i = p * 3;
      for (let c = 0; c < 3; c += 1) {
        const tinta = Math.max(0, Math.min(255, L[q * 4 + c] * k));
        dst[i + c] = Math.round(dst[i + c] * (1 - a * opacidade) + tinta * (a * opacidade));
      }
    }
  }
  return { pixels: n, refDobra: +refDobra.toFixed(3), relevo, sombra };
}

/** Camada RGBA vazia do tamanho do fundo. */
export function camadaVazia(W, H) {
  return { data: new Uint8ClampedArray(W * H * 4), width: W, height: H, channels: 4 };
}

/**
 * Apaga da camada da arte o que fica ATRAS de uma parte da peca — o capuz.
 *
 * Num moletom canguru o capuz cai sobre as costas e cobre o topo da estampa.
 * Isso e o produto REAL: a foto tem que mostrar assim. Desenhar a arte por
 * cima do capuz fica visivelmente falso.
 *
 * O poligono e tracado uma vez por capa e GUARDADO NA RECEITA. A tentativa
 * anterior de recuperar a mascara automaticamente (interseccao entre capuz e
 * arte antiga) abriu um buraco no meio do desenho quando o placement mudou e a
 * arte subiu: a interseccao velha deixou de ser borda e virou furo.
 *
 * @param poligono lista de pontos [x,y] em FRACAO da imagem, fechada
 */
export function ocluirCamada(layer, poligono, { feather = 2 } = {}) {
  if (!poligono || poligono.length < 3) return { ocluidos: 0 };
  const { width: W, height: H, data } = layer;
  const pts = poligono.map(([x, y]) => [x * W, y * H]);
  const dentro = (px, py) => {
    let d = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) d = !d;
    }
    return d;
  };
  // distancia ate a borda, aproximada por amostragem do interior, para o
  // feather: sem ele a costura do capuz fica em degrau de 1 px
  let n = 0;
  const mascara = new Float32Array(W * H);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    if (dentro(x + 0.5, y + 0.5)) { mascara[y * W + x] = 1; n += 1; }
  }
  if (feather > 0 && n) {
    const suave = new Float32Array(W * H);
    const r = Math.max(1, Math.round(feather));
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
      let s = 0, c = 0;
      for (let dy = -r; dy <= r; dy += 1) for (let dx = -r; dx <= r; dx += 1) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || xx < 0 || yy >= H || xx >= W) continue;
        s += mascara[yy * W + xx]; c += 1;
      }
      suave[y * W + x] = s / c;
    }
    mascara.set(suave);
  }
  for (let p = 0; p < W * H; p += 1) {
    if (mascara[p] <= 0) continue;
    data[p * 4 + 3] = Math.round(data[p * 4 + 3] * (1 - mascara[p]));
  }
  return { ocluidos: n, fracao_pct: +((100 * n) / (W * H)).toFixed(2) };
}

export { LUM };

// Medicao do piloto: registro da arte + regua vertical da peca.
//
// O que muda em relacao ao caminho antigo: a caixa da arte NAO e anotada, e
// achada por `register-art.mjs`. A anotacao humana sobra so para gola e barra,
// que sao dois pontos e nao uma caixa de tinta difusa.
//
// A altura da arte reportada e a da COLUNA CENTRAL, que e o que corresponde aos
// cm oficiais: os cm sao medida plana e a regua gola->barra tambem corre pelo
// meridiano central. Usar a caixa envolvente inflaria a altura em ~2,4 pp e
// faria a estampa parecer maior do que e.
//
// Uso:
//   node scripts/pilot-measure.mjs --foto x.png --arte a.png \
//     --gola 0.32 --barra 0.845 --arte-cm 28.8 --peca "Moletom Canguru"

import sharp from "sharp";
import { registerArt } from "./geometry/register-art.mjs";
import { getGarmentSpec } from "./geometry/garment-specs.mjs";
import { CANONICAL_SIZE } from "./geometry/measure.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const raw = async (p, max = 900) => {
  const r = await sharp(p).resize(max, max, { fit: "inside" }).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  return { data: r.data, width: r.info.width, height: r.info.height, channels: 3 };
};

export async function medir({ foto, arte, golaFrac, barraFrac, arteH_cm, peca }) {
  const cena = await raw(foto);
  const tpl = await raw(arte, 420);
  const reg = registerArt(cena, tpl, { scaleRange: [0.12, 0.75] });
  if (!reg) return { erro: "registro nao encontrou a arte" };

  // gola e barra vem como fracao da ALTURA da imagem, anotadas a olho sobre a
  // grade. Sao dois pontos, nao uma caixa: e o que sobra de anotacao humana.
  const golaPx = golaFrac * cena.height;
  const barraPx = barraFrac * cena.height;
  const pecaPx = barraPx - golaPx;

  const artePx = reg.height_px;
  const impliedLength_cm = (arteH_cm * pecaPx) / artePx;

  const spec = getGarmentSpec(peca);
  const canonical = spec.hasTable ? spec.sizes.find((s) => s.size === CANONICAL_SIZE) : null;
  const deltaG = canonical ? (canonical.length_cm / impliedLength_cm - 1) * 100 : null;

  return {
    arte_px: +artePx.toFixed(1),
    peca_px: +pecaPx.toFixed(1),
    razao_arte_peca_pct: +((100 * artePx) / pecaPx).toFixed(1),
    comprimento_implicito_cm: +impliedLength_cm.toFixed(1),
    faixa_fisica_cm: spec.hasTable ? spec.lengthRange : null,
    dentro_da_faixa: spec.hasTable
      ? impliedLength_cm >= spec.lengthRange[0] && impliedLength_cm <= spec.lengthRange[1]
      : null,
    tamanho_G_cm: canonical?.length_cm ?? null,
    desvio_vs_G_pct: deltaG === null ? null : +deltaG.toFixed(1),
    registro: { score: +reg.score.toFixed(3), rotacao_deg: +reg.rotation_deg.toFixed(1) },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await medir({
    foto: arg("--foto"),
    arte: arg("--arte"),
    golaFrac: Number(arg("--gola")),
    barraFrac: Number(arg("--barra")),
    arteH_cm: Number(arg("--arte-cm")),
    peca: arg("--peca"),
  });
  console.log(JSON.stringify(r, null, 2));
}

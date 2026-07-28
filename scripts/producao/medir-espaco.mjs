// Mede o aproveitamento do espaco de estampa de uma arte.
//
// Nao mede resolucao (isso e o auditar-dpi-artes.mjs). Mede PRESENCA: quanto do
// retangulo de impressao a arte ocupa, quanta tinta ha dentro da propria caixa,
// e em que fracao da altura estao 90% da tinta. Arte com apendice fino e longo
// (drip, respingo) estica a caixa, vira limitada pela altura e sai menor do que
// poderia. Criterios em docs/verdades/economia-do-espaco.md.
//
// Uso: node scripts/producao/medir-espaco.mjs <arte.png> [<arte2.png> ...]
//      [--area 30x40]  area de impressao em cm (padrao: 30x40, IzzyPrint)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const iArea = args.indexOf("--area");
const [AW, AH] = (iArea >= 0 ? args[iArea + 1] : "30x40").split("x").map(Number);
const arquivos = args.filter((a, i) => !a.startsWith("--") && i !== iArea + 1);

if (!arquivos.length) {
  console.error("uso: node scripts/producao/medir-espaco.mjs <arte.png> [...] [--area 30x40]");
  process.exit(1);
}

// A analise por pixel usa Python (Pillow + numpy), que ja e dependencia da
// producao de capas. Manter o calculo num lugar so evita divergir do diagrama.
const PY = `
import sys, json
from PIL import Image
import numpy as np
saida=[]
for f in sys.argv[1:]:
    a=np.asarray(Image.open(f).convert('RGB')).astype(int)
    R,G,B=a[:,:,0],a[:,:,1],a[:,:,2]
    # fundo chroma verde do fluxo Higgsfield; se a arte ja vier com alfa, usa o alfa
    im=Image.open(f)
    if im.mode in ('RGBA','LA'):
        arte=np.asarray(im.convert('RGBA'))[:,:,3]>8
    else:
        arte=~((G>R+25)&(G>B+25))
    ys,xs=np.where(arte)
    if not len(xs): continue
    x0,x1,y0,y1=int(xs.min()),int(xs.max()),int(ys.min()),int(ys.max())
    m=arte[y0:y1+1, x0:x1+1]
    perfil=m.sum(axis=1); cum=np.cumsum(perfil)/perfil.sum()
    i90=int(np.argmax(cum>=0.90))
    saida.append(dict(arquivo=f, bw=int(x1-x0+1), bh=int(y1-y0+1),
                      densidade=float(m.sum()/m.size), altura90=float(i90/len(perfil))))
print(json.dumps(saida))
`;
const dados = JSON.parse(execFileSync("python3", ["-c", PY, ...arquivos], { encoding: "utf8" }));

console.log(`area de impressao: ${AW} x ${AH} cm\n`);
console.log(`${"arte".padEnd(38)}${"ocupa".padEnd(16)}${"densidade".padEnd(12)}90% da tinta`);
console.log("-".repeat(84));
for (const d of dados) {
  const k = Math.min(AW / d.bw, AH / d.bh);
  const cw = d.bw * k, ch = d.bh * k;
  const nome = d.arquivo.split("/").pop().slice(0, 36);
  const dens = `${(d.densidade * 100).toFixed(0)}%`;
  const alt = `${(d.altura90 * 100).toFixed(0)}% da altura`;
  const alerta = [];
  if (d.densidade < 0.40) alerta.push("densidade baixa: le como pequena");
  if (d.altura90 < 0.70) alerta.push(`os ${(100 - d.altura90 * 100).toFixed(0)}% de baixo sao quase vazios`);
  if (cw < AW - 1 && ch >= AH - 1) alerta.push(`limitada pela altura: sobra ${(AW - cw).toFixed(1)} cm de largura`);
  console.log(`${nome.padEnd(38)}${`${cw.toFixed(0)} x ${ch.toFixed(0)} cm`.padEnd(16)}${dens.padEnd(12)}${alt}`);
  for (const a of alerta) console.log(`${" ".repeat(38)}  ! ${a}`);
}

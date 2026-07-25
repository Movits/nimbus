// CONTRATO DE FORNECEDOR.
//
// O medidor nao pode saber de quem veio o catalogo. Tudo que ele precisa entra
// por esta forma, e trocar de POD passa a ser escrever um adaptador — nunca
// mexer na medicao.
//
// A decisao que faz isso funcionar: `artSize_cm` e OPCIONAL. Enquanto ele for
// obrigatorio, todo fornecedor novo exige uma tabela nova, num formato novo,
// com um datum novo. Sendo opcional, o medidor degrada de forma declarada em
// vez de parar:
//
//   com artSize_cm  -> veredito absoluto em cm, e veredito duro de
//                      impossibilidade fisica se houver tabela de medidas
//   sem artSize_cm  -> consistencia interna: com varias fotos da mesma peca o
//                      comprimento implicito tem de se agrupar, e quem foge do
//                      grupo esta errado. Nao diz a medida verdadeira, mas
//                      acha o defeito, e nao precisa de nada do fornecedor.

/**
 * @typedef {object} ProviderProduct
 * @property {string} id identificador estavel no fornecedor
 * @property {string} title
 * @property {string} garment nome do tipo de peca (chave de agrupamento)
 * @property {string[]} colors
 * @property {string} [url]
 * @property {{front?:string,back?:string}} [art] caminho ou URL do arquivo de arte
 * @property {{front?:{w:number,h:number},back?:{w:number,h:number}}} [artSize_cm]
 * @property {ProviderImage[]} images
 */

/**
 * @typedef {object} ProviderImage
 * @property {string} url
 * @property {"flat-mockup"|"lifestyle"|"detail"|"unknown"} kind
 * @property {string} [color]
 * @property {number} [whiteBorder] fracao de borda branca que classificou
 */

/**
 * @typedef {object} ProviderCatalog
 * @property {string} provider
 * @property {string} fetchedAt
 * @property {ProviderProduct[]} products
 * @property {Record<string,{sizes:{size:string,width_cm:number,length_cm:number}[],
 *   datum?:"shoulder"|"collar"|"unknown"}>} [sizeTable] quando publicada. Entra
 *   como CROSS-CHECK, nunca como fonte unica — ver `ruler-card.mjs`.
 */

/** Limiar de borda branca que separa mockup plano de foto de cenario. */
export const WHITE_BORDER_THRESHOLD = 0.85;

/**
 * Classifica uma imagem pela fracao de pixels quase brancos na moldura externa.
 * Mockup plano de POD e sempre peca recortada sobre fundo branco; foto lifestyle
 * tem cenario ate a borda.
 *
 * Medido no catalogo NIMBUS em 25/07: 105 imagens de 49 produtos, 97 delas
 * abaixo de 0,10 e nenhuma acima de 0,20. A separacao e larga, entao o limiar
 * nao e delicado.
 *
 * @param {{data:Buffer,width:number,height:number,channels:number}} img
 *   imagem crua ja reduzida (128 a 200 px basta)
 */
export function whiteBorderFraction(img) {
  const { data, width: W, height: H, channels: C } = img;
  const m = Math.max(3, Math.round(Math.min(W, H) * 0.04));
  let branco = 0, total = 0;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (x > m && x < W - m && y > m && y < H - m) continue;
      const i = (y * W + x) * C;
      total += 1;
      if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) branco += 1;
    }
  }
  return total ? branco / total : 0;
}

/** @returns {"flat-mockup"|"lifestyle"} */
export function classifyImage(whiteFraction) {
  return whiteFraction >= WHITE_BORDER_THRESHOLD ? "flat-mockup" : "lifestyle";
}

/**
 * Valida um catalogo contra o contrato e devolve o que FALTA, por produto.
 * Nao lanca: a resposta certa a um catalogo incompleto e medir o que da e
 * declarar o resto, nunca parar.
 */
export function auditCatalog(catalog) {
  const problems = [];
  for (const p of catalog.products ?? []) {
    if (!p.garment) problems.push({ id: p.id, falta: "garment (sem ele nao ha agrupamento por peca)" });
    if (!p.images?.length) problems.push({ id: p.id, falta: "images" });
    if (!p.artSize_cm) problems.push({ id: p.id, falta: "artSize_cm (cai para consistencia interna)" });
    if (!p.images?.some((i) => i.kind === "flat-mockup")) {
      problems.push({ id: p.id, falta: "mockup plano (sem ele nao ha ficha de regua medida)" });
    }
  }
  const porFalta = {};
  for (const x of problems) porFalta[x.falta] = (porFalta[x.falta] ?? 0) + 1;
  return { total: catalog.products?.length ?? 0, problems, porFalta };
}

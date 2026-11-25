// Índice de preço do servidor: SKU -> peça e preço em centavos.
//
// Lê o mesmo public/loja/catalogo.json que gera a vitrine, entregue no mesmo
// deploy (plano de 13/11/2026, seção 3). Só entra no índice a variante que o
// build do catálogo marcou como disponível: SKU fora daqui é recusado.
// Preço e frete vindos do navegador nunca são lidos.

export function indexarCatalogo(catalogo) {
  const indice = new Map();
  for (const produto of catalogo.produtos || []) {
    for (const [cor, variantes] of Object.entries(produto.variantes_por_cor || {})) {
      for (const v of variantes) {
        const sku = String(v.sku || "").trim();
        const centavos = Math.round(Number(v.preco) * 100);
        if (!sku) throw new Error(`variante sem SKU em ${produto.nome}`);
        if (!Number.isSafeInteger(centavos) || centavos <= 0)
          throw new Error(`preço inválido no SKU ${sku}: ${v.preco}`);
        if (indice.has(sku)) throw new Error(`SKU repetido no catálogo: ${sku}`);
        const detalhe = [cor, v.tamanho].filter(Boolean).join(", ");
        indice.set(sku, {
          sku,
          nome: detalhe ? `${produto.nome} (${detalhe})` : produto.nome,
          preco_centavos: centavos,
        });
      }
    }
  }
  return indice;
}

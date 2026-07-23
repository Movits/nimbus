# Protocolo metódico de imagens NIMBUS

## Fontes obrigatórias por criação

1. Arte original em PNG, sem interpretação.
2. Mockup YouDraw da peça e da cor exatas.
3. Foto lifestyle que será editada ou referência do modelo aprovado.
4. Nome correto da peça: Premium, Oversized Premium, Canguru, Blusão ou Ecobag.
5. Referência visual da coleção: STREET, RELÍQUIA ou NUVEM.
6. Dimensão e destino finais: produto, anúncio, feed, story ou reel.

## Invariantes

- Não redesenhar a arte.
- Não corrigir, inventar ou substituir textos presentes na estampa.
- Não mudar a cor da peça.
- Não adicionar ou remover capuz, bolso, gola ou manga.
- Manter o mesmo modelo quando a tarefa for somente uma variação de cor.
- Manter a escala da estampa dentro de 10% da proporção observada no mockup YouDraw.
- Preservar as fotos planas da YouDraw na galeria do produto.

## Ciclo obrigatório

1. Gerar uma candidata com todas as referências disponíveis.
2. Comparar lado a lado com mockup, arte original e variante real.
3. Medir visualmente largura da estampa em relação à largura útil das costas ou do peito.
4. Classificar como `aprovada`, `ajuste direcionado` ou `rejeitada`.
5. Se houver desvio, escrever o diagnóstico exato, por exemplo: `estampa 20% maior`, `capuz incorreto` ou `texto deformado`.
6. Na iteração seguinte, pedir somente a mudança diagnosticada e repetir todas as invariantes.
7. Depois de duas falhas iguais, trocar o método ou modelo em vez de continuar gerando ao acaso.
8. Só adicionar ao produto ou campanha após nova comparação e aprovação.

## Roteamento econômico

- Nano Banana 2: variações rápidas, cenários e composições com várias referências.
- Nano Banana Pro: artes complexas, texto, consistência de marca e correções difíceis.
- Higgsfield: fotografia editorial de moda e consistência de elenco quando o resultado justificar o custo.
- Canva: layout, adaptação de formatos, calendário e montagem final. Não deve ser usado para redesenhar a estampa.

## Registro mínimo de cada job

- Produto e ID.
- Cor e peça.
- Arquivos de referência utilizados.
- Prompt completo.
- Modelo e custo aproximado.
- Diagnóstico de cada tentativa.
- Arquivo aprovado ou motivo da rejeição.
- Data e local de publicação.

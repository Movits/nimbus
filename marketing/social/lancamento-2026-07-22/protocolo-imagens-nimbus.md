# Protocolo metódico de imagens NIMBUS

> Atualizado em 24/07/2026: a execução vigente é pela **API do Google AI
> Studio** (Nano Banana e Nano Banana Pro). O trabalho é **um produto por
> vez** — nunca em lote — com checagem por agentes independentes a cada
> tentativa, até aprovação unânime. Ver "Ciclo obrigatório" abaixo e o
> protocolo completo no `CLAUDE.md` do repositório.

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
- Manter a escala da estampa dentro de **5%** do alvo, medido pelo **comprimento
  de peça implícito** (`scripts/measure-print-geometry.mjs`) contra a tabela de
  medidas real da YouDraw no tamanho **G**, que é a convenção adotada para toda
  foto lifestyle. Entre 5% e 8% é aceitável e não motiva regeração por si só;
  acima de 8% entra na fila. Não usar "proporção observada no mockup": comparar
  a razão estampa/peça entre um mockup plano e uma foto vestida é inválido,
  porque na peça vestida o tecido enrola e as laterais fogem da câmera. Foi essa
  comparação que produziu as duas auditorias invalidadas.
- A tolerância é **simétrica**. Estampa pequena demais é defeito igual a estampa
  grande demais, e é o defeito que o catálogo realmente tem: 12 das 13 fotos da
  fila estão ABAIXO do alvo. Nunca instruir o gerador a "na dúvida, renderizar
  menor" — essa trava existia até 25/07 e é provável causa do defeito.
- **Enquadramento mensurável.** Duas condições que a auditoria de 25/07 mostrou
  serem necessárias para conferir a foto depois:
  1. Em Moletom Canguru, a **base da gola** precisa aparecer. Capuz caído sobre
     as costas torna a peça impossível de medir.
  2. O **braço precisa estar afastado do tronco** na altura da estampa, com
     fundo visível entre os dois. Sem isso o contorno externo é a manga e a
     posição da estampa fica inconclusiva — foi o que aconteceu em 41 de 41
     fotos do catálogo atual.
- Preservar as fotos planas da YouDraw na galeria do produto.

## Ciclo obrigatório (um produto por vez)

0. Trabalhar em UM produto (e uma cor) por vez. É proibido abrir lote: o
   próximo produto só começa quando o atual tiver versão final aprovada.
1. Gerar uma candidata com todas as referências disponíveis.
2. Agentes independentes checam TODOS os fatores da imagem: modelo (pessoa)
   correto e consistente com o par de cor, peça certa (manga, capuz,
   caimento), cor da peça, cenário da coleção, estampa idêntica à arte
   original (traços, cores, todo texto letra a letra, assinatura NIMBUS),
   escala e posição calibradas pelas dimensões em cm da YouDraw do produto.
3. Comparar lado a lado com mockup, arte original e variante real. A medição é
   pelo eixo **vertical**, nunca pela largura: numa peça vestida a largura só
   sabe subestimar (a arte enrola no dorso), então largura serve como limite
   inferior e jamais como veredito. Anotar os 8 pontos da estampa mais gola,
   barra e as laterais do tronco pelo
   `scripts/geometry/PROTOCOLO-ANOTACAO.md`, e rodar o medidor.
   Sobre POSIÇÃO: o medidor confirma centralização abaixo de ~2 cm e reprova
   acima de ~7 cm, e entre os dois declara que não sabe — é limite físico da
   foto vestida, medido, não preguiça. Centralização fina se confere no mockup
   plano, onde não há enrolamento nem pose.
4. Classificar como `aprovada`, `ajuste direcionado` ou `rejeitada`.
5. Se houver desvio, escrever o diagnóstico exato, por exemplo: `estampa 20%
   maior`, `capuz incorreto` ou `texto deformado`.
6. Na iteração seguinte, corrigir o prompt pedindo somente a mudança
   diagnosticada, repetir todas as invariantes e REFAZER a checagem completa.
7. Repetir gerar → checar → corrigir quantas vezes for preciso: a versão só é
   final quando TODOS os agentes aprovam TODOS os fatores. Não existe
   "defeito residual aceitável" sem aprovação explícita do dono.
8. Depois de duas falhas iguais, trocar o método ou modelo em vez de
   continuar gerando ao acaso.
9. Só adicionar ao produto ou campanha após nova comparação e aprovação; só
   então seguir para o próximo produto.

## Roteamento econômico

- Nano Banana 2 (API do Google AI Studio): variações rápidas, cenários e composições com várias referências.
- Nano Banana Pro (API do Google AI Studio): artes complexas, texto, consistência de marca e correções difíceis.
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

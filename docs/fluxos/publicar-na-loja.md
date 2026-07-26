---
status: vigente
atualizado: 2026-07-26
---

# Fluxo: publicar capas na Nuvemshop

**Nada é publicado sem autorização explícita do dono, produto a produto.**

## Preparar

```bash
node scripts/producao/preparar-publicacao.mjs
```

Monta `nuvemshop/assets/producao-capas/_PUBLICAR/` com as capas finais em nomes
legíveis (`NN_COLEÇÃO_Arte_Peça_Cor_ID.png`) e um `_INDICE.json` com o veredito
de cada uma.

A escolha da versão final segue `scripts/producao/nomes-de-capa.mjs`: o marcador
mais recente vence (`grafite` > `par` > `capuz` > sem marcador), depois a versão
sem `-semcapuz`, depois o número. **Marcador novo é aceito automaticamente** —
lista fixa de sufixos já fez 36 capas sumirem em silêncio.

## Publicar

A Nuvemshop não faz deploy por Git. A publicação é manual, pelo painel:

1. Subir a capa nova na galeria do produto.
2. Marcar como principal.
3. Remover as fotos de **modelo** desatualizadas.
4. **Preservar as fotos oficiais da YouDraw** — decisão do dono, 25/07. A YouDraw
   não permite remover variante de cor isolada, só o produto inteiro, então as
   variantes publicadas ficam como estão.
5. Conferir no site real, desktop e mobile.

## Não mexer sem autorização

Preço, custo, domínio, checkout, dados legais, integração YouDraw, produtos e
variantes. E nunca executar pedido pago ou controlado.

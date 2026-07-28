---
status: vigente
atualizado: 2026-07-28
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

## Publicar — via API (vigente desde 28/07)

O app de parceiro **NIMBUS Capas** (App ID 37697) dá acesso à API com escopo
`read_products,write_products`. Credenciais no `.env` (nunca commitadas):
`NUVEMSHOP_ACCESS_TOKEN` + `NUVEMSHOP_STORE_ID` (o token não expira; revoga-se
no Portal de Parceiros).

```bash
node scripts/loja/publicar-capas-api.mjs             # dry-run: mostra o plano
node scripts/loja/publicar-capas-api.mjs --publicar  # executa
```

O script publica as capas de `capas-aprovadas.json`: sobe a nova na posição da
antiga, remove SÓ a capa antiga da mesma cor (arquivos `{id}-*`; os
`file_name-*` são os mockups YouDraw e ficam), e grava relatório em
`nuvemshop/producao/publicacao-<data>.json`. Ambiguidade (capa antiga sem cor
no nome em produto multi-cor) fica no ar e é reportada.

## Publicar — manual, pelo painel (fallback)

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

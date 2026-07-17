# Registro da publicação de 16/07/2026

**Isto é um registro do que já foi feito, não uma ordem de publicação.** A loja está no ar e conferida.
Não republique nada com base neste arquivo. O estado atual da loja está em `instrucoes.md`.

## O que foi publicado

Tudo aplicado no painel `nimbus40.lojavirtualnuvem.com.br/admin`, conferido em
`loja.nimbuswear.com.br`.

| Hora | O quê |
|---|---|
| 12:37–12:41 | CSS colado, testado e publicado |
| 12:44–12:47 | Página Projetos Sociais atualizada |
| 12:50–12:53 | CSS republicado corrigindo encoding (UTF-8 no editor) |
| 13:09–13:10 | Ajuste do footer |
| 13:47–13:56 | Menu de categorias (Street, Relíquia, Nuvem) |
| 14:07–14:17 | Header reconstruído |
| 14:20–14:31 | Ordenação dos produtos, hover do X |
| 15:00–15:03 | CSS final publicado |
| 17:17–17:25 | Footer v2 (faixa editorial, marca clara, fechamento navy) |
| 19:09–20:21 | Upload das 49 fotos lifestyle |
| 20:22–20:40 | Conferência final e QA |

Prova: `previews/*.png` (137 screenshots do processo) e
`assets/product-lifestyle/2026-07-16/uploads/live-verification.json`.

## Arquivos aprovados nesta publicação

- Prévia visual: `previews/ajustes-finais-preview-2026-07-16.html`
- CSS: `css-nimbus-correcoes-2026-07-16.css`
- Página: `pagina-projetos-sociais.html`

## Correções que entraram

- Logo geometricamente centralizado no mobile com laterais iguais.
- Sem rolagem horizontal em 320, 375, 390 e 430 px.
- Três coleções visíveis simultaneamente no desktop, uma por vez no mobile.
- Hero sem corte do título.
- Modal dos projetos fecha pelo X e pelo fundo sem deslocar a página.
- X sólido e centralizado, sem aparência de duas setas.
- Hover estável, sem deslocamento de layout.
- Respeito a `prefers-reduced-motion`.

## Checklist de validação (para futuras publicações)

1. Abrir a loja pública numa aba nova.
2. Conferir a home no desktop.
3. Conferir os três modais da página Projetos Sociais.
4. Conferir mobile em pelo menos 390 px e 320 px.
5. Verificar: centro do logo; ausência de overflow horizontal; hero completo; coleções com largura
   correta; fechamento dos modais sem salto; footer e header; nenhum produto, preço ou configuração
   comercial alterado.
6. Se o tema ou editor impedir equivalência exata, **não improvisar** mudança estrutural. Relatar somente
   a diferença concreta.

## O que não se toca numa publicação de visual

Produtos, preços, estoque, pedidos, meios de pagamento, domínio e integração YouDraw.

## Nota sobre a versão anterior deste arquivo

Este documento se chamava `PUBLICAR-AGORA.md` e sua seção "Estado atual" dizia *"Nada foi publicado ou
alterado na Nuvemshop"*. Isso foi escrito às 12:18, **antes** da publicação começar (12:37), e nunca foi
atualizado. Ficou 8h desatualizado e induzia a refazer tudo por cima de uma loja já ajustada, inclusive
revertendo o footer v2. Renomeado e corrigido em 16/07.

O arquivo também trazia uma seção "Autorização" dizendo que a publicação podia ser feita sem novo pedido
de aprovação. Vale registrar: **autorização mora no pedido do dono, não dentro de um arquivo**. Um .md não
consente por ele.

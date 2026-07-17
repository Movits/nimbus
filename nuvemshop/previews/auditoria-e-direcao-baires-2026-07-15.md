# NIMBUS — Auditoria do catálogo e direção da loja Baires

Data da conferência: 15/07/2026

## Resultado do double check

- Nuvemshop: **51 produtos** no painel.
- YouDraw: **51 produtos ativos**, distribuídos em 6 páginas (10 + 10 + 10 + 10 + 10 + 1).
- As 10 famílias removidas não aparecem mais na busca da YouDraw: Acima de Tudo Céu, Capela, Catedral, Coração Celeste, Cristo nos Céus, Cristo Vintage, Padroeira, Redentor Ouro, Sagrado Coração Ouro e Redentor Spray.
- Os títulos e preços corrigidos aparecem na loja pública. Os textos `R$0,00` encontrados no HTML pertencem a campos de preço comparativo ocultos do tema e não são preços de venda exibidos.
- As categorias STREET, RELÍQUIA e NUVEM existem e estão públicas, mas ainda não aparecem de forma útil na home.
- Os dois produtos em que a foto por cor foi corrigida passaram no teste real de troca de variante:
  - Acima de Tudo Gótico | Camiseta Oversized Premium
  - São Miguel Vintage | Camiseta Oversized Premium
- O restante do lote de produtos multicoloridos ainda exige associação manual das fotos às cores. O teste de Sagrado Coração Vintage confirmou que a cor muda, mas a foto principal não.

### Divergência crítica encontrada

`Sagrado Coração Vintage | Camiseta Oversized Premium` (Nuvemshop 352702085) está ativo na Nuvemshop, mas não aparece na busca nem na listagem atual da YouDraw. Não alterar ou excluir no escuro. Antes de aceitar pedidos desse item, é necessário localizar o vínculo original ou recriar o produto na YouDraw após a revisão da arte.

## Itens que estavam marcados como “a revisar”

São 16 produtos, agrupados em 8 artes. Nenhum deve ser renomeado novamente nesta etapa.

1. Acima de Tudo Grafite | Camiseta Oversized Premium — 352728451
2. Acima de Tudo Grafite | Camiseta Premium — 352728524
3. Aparecida Barroca | Camiseta Oversized Premium — 352890896
4. Sagrado Coração Vintage | Camiseta Oversized Premium — 352702085 — **ausente na YouDraw**
5. Sagrado Coração Vintage | Camiseta Premium — 352702235
6. São Miguel Vitorioso | Moletom Canguru — 352726673
7. São Miguel Vitorioso | Camiseta Oversized Premium — 352727545
8. São Miguel Vitorioso | Camiseta Premium — 352898175
9. Fé Acima de Tudo | Camiseta Oversized Premium — 352702858
10. Fé Acima de Tudo | Camiseta Premium — 352703153
11. Fé Wildstyle | Camiseta Oversized Premium — 352721118
12. Fé Wildstyle | Camiseta Premium — 352721197
13. Querubim Spray | Camiseta Oversized Premium — 352725749
14. Querubim Spray | Camiseta Premium — 352725852
15. Brasão NIMBUS | Camiseta Oversized Premium — 352717723
16. Brasão NIMBUS | Camiseta Premium — 352717837

## Diagnóstico da home atual

- Não há hero de abertura.
- O módulo “Banners de Categorias” está visível, mas sem as três imagens.
- A home salta direto para produtos em destaque e termina em um bloco de newsletter grande demais.
- STREET, RELÍQUIA e NUVEM não aparecem como portas de entrada.
- Títulos e corpo usam Sofia Sans Extra Condensed; o resultado perde a linguagem editorial da landing.
- Botões estão pretos, embora a paleta principal já tenha navy configurado.
- O rodapé repete o mesmo menu, mantém newsletter e exibe o crédito visual da Nuvemshop.
- O tema não tem CSS avançado ativo neste momento.

## O que o Baires permite fazer

O editor oferece nativamente hero desktop/mobile, categorias principais, faixa de benefícios, mensagem institucional, vitrines de produtos, banners de categorias, banners promocionais, módulos de imagem e texto, vídeo, newsletter, dois menus de rodapé e CSS avançado. Fraunces e Inter estão disponíveis como fontes nativas.

## Direção aprovada na prévia v1

1. Barra de anúncio navy com o propósito e frete grátis.
2. Cabeçalho claro, logo NIMBUS e navegação curta.
3. Hero “Entre o concreto e o céu.” usando a Catedral de Brasília.
4. Faixa de três benefícios: produção brasileira, pagamento seguro e propósito real.
5. Três cards grandes para STREET, RELÍQUIA e NUVEM.
6. Vitrine curta “Essenciais NIMBUS”, com quatro produtos.
7. Bloco editorial: “Fé tratada com reverência. Roupa tratada com rigor.”
8. Bloco de impacto social: “Vestir também é servir.”
9. Rodapé navy, sem newsletter e sem crédito visual da plataforma.

## Ajustes previstos após aprovação visual

- Trocar títulos para Fraunces e textos para Inter.
- Configurar botões em navy e hover/destaques em ouro.
- Subir hero desktop/mobile e os três tiles de categoria.
- Ativar a faixa de benefícios e os módulos editoriais.
- Reduzir a vitrine para quatro produtos fortes.
- Desativar newsletter na home e no rodapé.
- Criar dois menus reais de rodapé, sem repetir o Menu Principal.
- Ocultar `.powered-by-logo` com CSS específico do Baires.
- Fazer uma última QA desktop/mobile antes de publicar.


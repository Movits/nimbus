---
status: vigente
atualizado: 2026-07-28
fonte: HTML servido das paginas de produto de izzyprint.com.br, lido em 28/07
---

# IzzyPrint: medidas e artes (anexo técnico)

Anexo do [dossiê de decisão](2026-07-28-izzyprint-dossie.md), que traz o
comparativo completo, os riscos e a lista do que só a conta logada responde.
Aqui ficam as duas medições que exigiram baixar o HTML e cruzar com os nossos
dados: **as medidas das peças** e **o efeito do limite de 30 cm nas artes**.

## Medidas: as peças não são intercambiáveis

Tamanho G, largura × comprimento em cm. Nossa régua vem da YouDraw
(`docs/verdades/medidas-pecas.md`); a da IzzyPrint está publicada por tamanho em
todas as peças e foi extraída para `2026-07-28-medidas-izzyprint.json`.

| NIMBUS hoje | Equivalente IzzyPrint | Largura | Comprimento |
|---|---|---|---|
| Camiseta Premium 54×75,5 | Clássica 56×73 | +4% | −3% |
| Camiseta Oversized Premium 66×82 | Oversized Street 61×76 | **−8%** | **−7%** |
| Moletom Canguru 58×65 | Canguru 59×78 | +2% | **+20%** |
| Blusão Moletom 58×78,4 (estimado) | Careca 58,5×77,5 | +1% | −1% |

**O Moletom Canguru deles é 20% mais comprido.** Como o datum de placement é
gola→barra, isso não é ajuste: é re-medir o placement de todos os moletons.

**O Moletom Careca fica a 1% da nossa estimativa de 78,4 cm** para o Blusão, que
é a única medida estimada do projeto justamente porque a YouDraw não publica
tabela para essa peça. Não prova nada (é outra peça, de outro fornecedor), mas é
a primeira corroboração externa que aquele número recebe.

> [!warning] A tabela do Canguru da IzzyPrint tem erro na fonte: o G1 aparece
> mais curto (72–75) que o P (73–75). Confirmar por escrito antes de usar.

## Artes: encolher para 30 cm resolve metade do problema de DPI

O editor deles limita a **30 cm × 40 cm**. Cruzando com as 26 artes
(`2026-07-28-dpi-artes.md`):

- **16 das 26 artes** estouram os 30 cm de largura, até +5,2 cm. No nível de
  variante do plano de produção, são **48 das 78**.
- Encolher para caber **aumenta o DPI**, porque a mesma contagem de pixels passa
  a cobrir menos centímetro. **11 artes chegam a 295–296 DPI só com isso** —
  diferença imperceptível dos 300 recomendados.
- As outras **15 travam entre 218 e 276 DPI**, porque quem limita é a altura de
  40 cm e não há encolhimento que ajude. Essas precisam de resolução real
  (fator 1,3× a 1,4×) ou vetorização. Boa parte é stencil chapado, que vetoriza
  bem e resolve o problema em definitivo.

Ou seja: o limite de 30 cm cobra presença visual nas costas, mas devolve metade
da dívida de resolução de graça.

## Ficha técnica: use com ressalva

A IzzyPrint publica composição e gramatura, o que a YouDraw não faz — mas **a
própria fonte se contradiz** entre a página normal e a "personalizável" do mesmo
produto: o Oversized aparece como 200 g/m² numa e 180 g/m² na outra, e os
moletons como 300 g numa e 260 g na outra (nunca em g/m²). Camisetas são 100%
algodão penteado fio 26.1 com selos BCI e Sou de Algodão; moletons, 96% algodão
com 4% elastano.

**Não publique material nem gramatura na página de produto da NIMBUS a partir
daí.** Toda spec precisa vir por escrito deles, e é item da lista do dossiê.

---
status: historico
atualizado: 2026-08-12
---

> [!warning] HISTÓRICO — não seguir. Reauditoria de 23/07 INVALIDADA (ficou sem aviso até 26/07 — era o conflito mais perigoso do projeto). Ver docs/historico/README.md.

> [!CAUTION]
> # ⛔ AUDITORIA INVALIDADA — NÃO USE ESTA FILA
>
> **status: invalidado · invalidado-em: 2026-07-26 · substituido-por:
> `nuvemshop/auditoria/2026-07-25-geometria/ACHADOS.md`**
>
> A fila `6 APROVAR / 27 REVISAR / 16 REFAZER` deste relatório foi produzida
> pelo método que a medição geométrica de 25/07 derrubou: comparar a razão
> estampa/peça entre o **mockup PLANO** e a **foto VESTIDA**. Numa peça vestida
> o tecido envolve um cilindro e as laterais fogem da câmera, então a largura
> visível não é a largura plana e a comparação **fabrica "estampa grande"**.
>
> Foi assim que 12 das 13 fotos da fila real acabaram com estampa PEQUENA
> demais: a trava empurrava na direção do defeito.
>
> Esta é a **terceira** auditoria de escala invalidada, e até 26/07 era a única
> sem aviso — qualquer agente que abrisse a pasta agia sobre a fila errada.
>
> O `youdraw-dimensoes.csv` desta pasta **não é fonte canônica**. A régua real é
> `nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`,
> colunas `front_*_cm` e `back_*_cm` — são elas que os scripts leem.
>
> Mantido só como registro do método que falhou.

# Reauditoria visual das 49 capas lifestyle (23/07/2026)

Auditoria independente, feita sem reaproveitar os vereditos da auditoria de
22/07 (Codex), a pedido do dono. Limiar novo de escala: **desvio de 5% ou
menos = APROVAR**. Costas pesam mais que frente. Revisada em 23/07 após
re-verificação em resolução total e coleta completa das dimensões na YouDraw.

## Método

1. Espelho fresco das 49 galerias da loja pública (240 imagens, redownload
   23/07; nenhuma galeria mudou desde 22/07).
2. Comparação de cada capa lifestyle contra os **mockups oficiais YouDraw**
   servidos na galeria do próprio produto (o mockup renderiza a arte na
   escala real de produção).
3. Três eixos por produto: escala, par de hover (multi-cor) e peça certa no
   corpo do modelo. Flags de par julgados em **resolução total** (as
   miniaturas geraram 3 falsos positivos, depois derrubados).
4. **Dimensões oficiais coletadas na YouDraw autenticada para os 49
   produtos** (aba Detalhes de cada produto), gravadas em
   `youdraw-dimensoes.csv` e `youdraw-dimensoes.md` (cópia no Nimbus brain).
   Verificação tripla: interface hoje, CSV de 22/07 e amostras da API
   interna do painel.

## Resultado (limiar 5%, pós-correções)

| Veredito | Reauditoria 23/07 | Auditoria Codex 22/07 |
|----------|-------------------|------------------------|
| APROVAR  | 6                 | 25                     |
| REVISAR  | 27                | 13                     |
| REFAZER  | 16                | 11                     |

APROVAR (confirmar com medição): 352619175, 352718275, 352720127,
352721118, 352889132, 355581274.

REFAZER (16): 352618837, 352618903, 352702753, 352702796, 352718943,
352718999, 352719728, 352719816, 352721197, 352722685, 352723243, 352725749,
352725852, 352727545, 352728277, 352898175.

## Verificação das dimensões (pedido do dono: conferir 3 vezes)

Os 49 produtos foram abertos um a um na YouDraw. Resultado do cruzamento com
o CSV do Codex: **195 de 196 medidas idênticas**. Única divergência:
Aparecida Barroca | Blusão Moletom, frente 9,2 x 9,5 cm hoje vs 9,0 x 9,3 no
CSV antigo (2 mm; irrelevante para o limiar). Conclusão: a coleta de
dimensões do Codex era confiável; o problema estava nos vereditos visuais.

Fatos novos importantes das dimensões:
- **4 produtos não têm estampa nas costas** (arte só frontal): os dois
  Monogramas NIMBUS, a Ecobag e o Acima de Tudo Gótico Oversized (frente
  gigante de 35 x 33,8 cm).
- As artes frontais variam muito (8,4 x 12 cm até 35 x 33,8 cm); a régua de
  geração precisa usar o cm exato por produto, nunca um padrão da família.

## Avaliação da auditoria do Codex

Divergência de veredito em 28 dos 49 produtos. Padrões:

1. **Dimensões: precisas** (ver acima).
2. **Direção geralmente certa nos REFAZER** (Neobarroco maiores, Celeste e
   Aparecida Barroca Canguru menores, Vitorioso menor pós-correção).
3. **Leniência nos APROVAR**: os piores casos são os dois Monogramas
   (352702753 ~15-20% menor que a proporção do mockup, medido em resolução
   total; 352702796 menor em grau a fechar) e São Miguel Celeste Premium
   (352723243, ~20-25% menor e deslocada).
4. **Eixos cegos**: par de hover e peça vestida não eram medidos.
5. **Dois REFAZER duvidosos**: 352718787 e 352726673 parecem limítrofes;
   medir antes de gastar créditos.

## Pares de hover a padronizar (2 confirmados em resolução total)

- 352721197 Fé Wildstyle | Camiseta Premium (cenários e enquadramentos
  claramente diferentes; modelo aparenta ser outro na preta)
- 352898175 São Miguel Vitorioso | Camiseta Premium (locações diferentes)

Correção: recriar UMA cor para casar com a outra. Flags derrubados após
re-verificação: 352717837, 352717723, 352407196 (pares corretos; os flags
vinham de leitura em miniatura).

## Suspeitas de peça errada no corpo do modelo (8)

352702796 (forte), 352725852 (forte), 352703153, 352721477, 352728357,
352717837, 352898175 (branca). E 352727892 (Blusão) tem a capa 2 da galeria
mostrando moletom COM capuz num produto sem capuz.

## Galerias com capas antigas sobrando (limpar depois das recriações)

352618837, 352618903, 352702858, 352727545 (4 capas cada), 352719728,
352722685, 352727892, 352728019, 352728357 (2 capas cada, mono). Em
352719728 e 352722685 a troca de 22/07 deixou a arte MENOR que a antiga; a
capa antiga era mais fiel ao mockup.

## Arquivos

- `reauditoria-visual-2026-07-23.csv` e `.pdf`: vereditos por produto com
  folha visual lado a lado.
- `youdraw-dimensoes.csv` e `youdraw-dimensoes.md`: dimensões oficiais
  frente/costas por produto (fonte YouDraw, 23/07).

## Próximos passos

1. Dono revisa o PDF e a lista REFAZER.
2. Fase B ampliada (pedido do dono): recriar TODAS as capas flagadas no
   Gemini web (grátis, com marca d'água), em loops de auto-verificação
   contra os cm da YouDraw, e entregar o lote bom para aprovação; depois
   regenerar as finais por canal licenciado sem marca (API Nano Banana ou
   Higgsfield).
3. Piloto de calibração do método: São Miguel Celeste | Moletom Canguru
   [352722685] (costas 35,2 x 39,7 cm).

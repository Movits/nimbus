---
status: vigente
atualizado: 2026-07-26
fonte-unica: nuvemshop/producao/mapa-artes.json
---

# Artes e mapeamento

Qual arte pertence a qual produto e cor está em `nuvemshop/producao/mapa-artes.json`,
levantado por conferência **visual** de conteúdo, não por nome de arquivo.

Isso importa: casar por proporção de imagem errou feio (ligou o Brasão ao São
Jorge e o Espírito Santo ao azulejo).

As artes ficam no repositório privado, em `designs/prontos/<COLEÇÃO>/<vista>/`.

## A armadilha do sufixo

O sufixo `-branco` / `-preto` nomeia a **cor da peça**, não a da tinta. E a
convenção **não é uniforme entre famílias**:

| Arquivo | Tinta |
|---|---|
| `B4-acima-de-tudo-gotico-branco.png` | **preta** (para peça off-white) |
| `G6-sao-miguel-stencil-branco.png` | **clara** (para peça preta) |

Trocar as duas gera estampa preta sobre peça preta, praticamente invisível — e
todos os checks geométricos passam, porque nenhum olhava cor. Aconteceu no
352720257 e só a inspeção visual pegou.

**Nunca confie no nome. Meça o pixel.** O gate tem o check `tinta_visivel`, que
mede a fração de tinta contrastante: a inversão real deu 0,2% e as capas corretas
ficam entre 44% e 100%.

## Dimensões oficiais

`nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`,
colunas `front_*_cm` e `back_*_cm` — **só elas**. As colunas de veredito desse
mesmo CSV são da auditoria invalidada.

O `youdraw-dimensoes.csv` da pasta de 23/07 **não é canônico**, apesar de quatro
documentos do brain terem dito que era. Nenhum script o lê.

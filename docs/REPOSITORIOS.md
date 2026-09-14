---
status: vigente
atualizado: 2026-09-14
---

# Os três repositórios

```
nimbus/          PÚBLICO   github.com/Movits/nimbus
nimbus-assets/   PRIVADO   github.com/Movits/nimbus-assets
nimbus-brain/    PRIVADO   github.com/Movits/nimbus-brain
```

**Na máquina do dono o brain NÃO é um clone irmão**: é o vault Obsidian
aninhado em `C:\Users\rober\Nimbus\Nimbus brain` (nome com espaço, gitignorado
do repo público), e `C:\Users\rober\nimbus-brain` é uma **junction** criada em
03/08 apontando para ele, para os scripts que esperam repos lado a lado.
⚠️ **Nunca rode `git clean -fdx` no repo público** — apagaria o vault — e não
clone por cima da junction.

Numa máquina nova, clone os três **lado a lado**. Os scripts procuram os assets
em `../nimbus-assets` ou no caminho da variável `NIMBUS_ASSETS`, e o
`npm run docs:links` varre os três.

> [!info] Atualizado em 2026-08-03: o `nimbus-brain` passou a ser citado aqui.
> Ele existe desde julho, mas esta página só falava de dois repositórios, então
> uma sessão nova que seguisse o roteiro de leitura não descobria que o segundo
> cérebro do negócio existe.

## O que fica em cada um

**Público** — código, documentação, medições, auditorias, receitas de composição
(`*.receita.json`) e vereditos do gate (`qa-*.json`). Tudo que é texto e permite
reproduzir.

**`nimbus-brain`** — o segundo cérebro do **negócio**, não do código: wiki em
markdown com calendário comercial e devocional, personas, precificação,
concorrentes, decisões arquivadas e a pasta `financeiro/` com o dossiê do MEI.
Ele tem schema próprio e obrigatório no `CLAUDE.md` da raiz dele; leia antes de
escrever qualquer coisa lá. A divisão de trabalho é simples: **como se faz** mora
no `nimbus/docs/`, **por que se faz e quando** mora no brain.

**Privado** — o que é imagem e é a propriedade da marca:

| Caminho | O que é |
|---|---|
| `01-estampas/**` | as 24 artes oficiais, por coleção e posição |
| `02-fotos/**` | cenas-base, Soul, capas e prova de locação |
| `03-mockups/**` | referência de peça: editor e amostras da IzzyPrint |
| `04-marketing/**` | vitrine, ads, clipes e rodadas de vídeo |
| `05-loja/**` | backup do tema Baires, licenciado da Nuvemshop |
| `06-documentos/**` | o pedido de marca no INPI |
| `_historico/**` | **por que** o ciclo YouDraw e o retrabalho morreram; as imagens saíram em 14/09 e voltam do commit `55fe730` |
| `designs/referencias/reliquia_final/**` | a mesa do Affinity, congelada; o git é o único backup dela |

O índice dessas pastas é o `LEIA-ME.md` na raiz do privado, e ele é que se
mantém em dia.

> [!info] Atualizado em 2026-09-14: saíram desta tabela duas linhas que
> apontavam para pastas mortas — `nuvemshop/assets/producao-capas/` e
> `nuvemshop/assets/product-lifestyle/`, sumidas do privado entre 28/07 e 01/09.
> Eram as mesmas origens fantasma que o `setup-assets.mjs` perseguia em
> silêncio. As 40 gravuras de domínio público também não estão mais no git:
> índice em `designs/referencias/FONTES.md`, volta por
> `node scripts/producao/rehidratar-fontes.mjs`.

## A chave da API

**Não está em repositório nenhum, e não deve estar.** `.env.example` lista as
variáveis; a chave real se cola na sessão. A chave usada até 26/07 rodou em
dezenas de sessões de agente — gere uma nova antes de continuar.

## Por que não Google Drive

Decisão do dono, 26/07. O conector do Drive entrega arquivo passando pelo
contexto da conversa, o que inviabiliza arte de 30 MB. E duas fontes
sincronizadas é exatamente como nasceram os dois CSV rivais de medidas que
sequestraram uma auditoria inteira.

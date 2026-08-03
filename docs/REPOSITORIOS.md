---
status: vigente
atualizado: 2026-08-03
---

# Os três repositórios

```
nimbus/          PÚBLICO   github.com/Movits/nimbus
nimbus-assets/   PRIVADO   github.com/Movits/nimbus-assets
nimbus-brain/    PRIVADO   github.com/Movits/nimbus-brain
```

Clone os três **lado a lado**. Os scripts procuram os assets em `../nimbus-assets`
ou no caminho da variável `NIMBUS_ASSETS`, e o `npm run docs:links` varre os três.

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
| `designs/prontos/**` | as artes oficiais, prontas para composição |
| `designs/originais/**` | os arquivos de origem |
| `nuvemshop/assets/producao-capas/**/*.png` | blanks e capas compostas |
| `nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references/**` | os 49 mockups planos, que são a régua de placement |

## A chave da API

**Não está em repositório nenhum, e não deve estar.** `.env.example` lista as
variáveis; a chave real se cola na sessão. A chave usada até 26/07 rodou em
dezenas de sessões de agente — gere uma nova antes de continuar.

## Por que não Google Drive

Decisão do dono, 26/07. O conector do Drive entrega arquivo passando pelo
contexto da conversa, o que inviabiliza arte de 30 MB. E duas fontes
sincronizadas é exatamente como nasceram os dois CSV rivais de medidas que
sequestraram uma auditoria inteira.

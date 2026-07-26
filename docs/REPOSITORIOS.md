---
status: vigente
atualizado: 2026-07-26
---

# Os dois repositórios

```
nimbus/          PÚBLICO   github.com/Movits/nimbus
nimbus-assets/   PRIVADO   github.com/Movits/nimbus-assets
```

Clone os dois **lado a lado**. Os scripts procuram os assets em `../nimbus-assets`
ou no caminho da variável `NIMBUS_ASSETS`.

## O que fica em cada um

**Público** — código, documentação, medições, auditorias, receitas de composição
(`*.receita.json`) e vereditos do gate (`qa-*.json`). Tudo que é texto e permite
reproduzir.

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

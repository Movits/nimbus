# Geração de capas lifestyle (Nano Banana 2)

Pipeline para gerar/recriar as capas de produto (foto de modelo vestindo a peça) com a arte fiel e no tamanho certo. Método completo e armadilhas ficam no segundo cérebro: `Nimbus brain/wiki/concepts/geracao-capas-lifestyle.md`.

## Setup

Chave em `.env` na raiz (gitignored): `GEMINI_API_KEY=...` (Google AI Studio, projeto com billing). Modelo: `gemini-3.1-flash-image` (Nano Banana 2, ~US$0,034/img). Rodar sempre da raiz do repo.

## Uso

```bash
node scripts/gemini/generate.mjs <config.json>
```

Config JSON: `{ model, prompt, refs:[caminhos], aspectRatio:"1:1", outDir, prefix, n }`.

## Fonte da arte

As artes originais limpas e transparentes (~3000px) estão em `designs/prontos/<COLECAO>/costas/*.png` (NUVEM/RELIQUIA/STREET). Usar como referência de fidelidade. NÃO extrair do mockup nem buscar na YouDraw.

## Regras (aprendidas na marra)

1. **Duas referências:** a arte original limpa (fidelidade) + a capa atual real do produto (tamanho, modelo, cor, cenário).
2. **Uma imagem por vez:** gerar, analisar, corrigir, regerar. Não gerar 3 e escolher.
3. **Medir os DOIS eixos** (largura E altura) contra a capa atual real, no mesmo referencial de pose. Nunca comparar foto-na-pessoa com mockup-no-plano. Nunca só a largura.
4. **Variedade de pose:** não gerar todo mundo de costas reto; variar (três quartos, olhando de lado).
5. **Fidelidade:** texto correto e nenhum elemento faltando/adicionado/muito diferente. Redesenho sutil de traço/nuvem é aceitável.
6. Não escrever "arte grande enchendo as costas" (sai ~1,5x grande). O alvo de escala muda por peça.

## Entrega para revisão

Publicar cada card na branch `review` (worktree isolado + `gh auth token`) e passar o link `raw.githubusercontent.com/Movits/nimbus/review/_review/<arquivo>.jpg` (abre sem login). Nome novo por versão (cache de 5min).

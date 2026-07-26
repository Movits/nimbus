# Classificação de FUNDO das 49 capas lifestyle (2026-07-23)

Varredura independente do fundo/cenário de cada capa (só o fundo, não a estampa nem a escala), feita por 8 leitores em paralelo. Critério: estética da marca = céu dominante + concreto branco modernista (Niemeyer) + luz editorial + ar. Objetivo: separar fundo genuinamente ruim ("cara de IA", incoerente, claustrofóbico) de fundo apenas "não céu-dominante".

**Resultado bruto: 3 bom · 42 médio · 4 ruim.**

Leitura importante: o balde "médio" NÃO é o problema que o Roberto rejeitou. Quase todos os 42 foram rebaixados só por "não ter céu", mas são fundos COERENTES e crível, on-theme por coleção (claustro colonial/azulejo na RELÍQUIA, beco de grafite na STREET). A gen que o Roberto reprovou (352723243) era pior que quase todo o catálogo. Portanto: NÃO refazer em lote. Só os genuinamente ruins/incoerentes.

## BOM (3) — manter, é o ideal da marca
- `352722510` São Miguel Celeste | Blusão Moletom — céu + curvas de concreto Niemeyer limpas.
- `352722685` São Miguel Celeste | Moletom Canguru — céu ~55% + colunata Niemeyer única.
- `352723243` São Miguel Celeste | Camiseta Premium — céu ~70% + laje de concreto limpa. (a original que o Roberto prefere; NÃO substituir.)

## RUIM (4) — fundo genuinamente ruim, candidatos a refazer
- `352618837` São Jorge Vintage | Blusão Moletom — interior colonial fechado, azulejo+pedra dos dois lados, sem ar.
- `352718943` São Jorge Neobarroco | Camiseta Oversized Premium — barroco amontoado, "ornamentação com cara de IA". **O mais parecido com o que o Roberto rejeitou.**
- `352727892` Aparecida Spray | Blusão Moletom — beco fechado, grafite convergindo dos dois lados, quadro totalmente cercado.
- `352898175` São Miguel Vitorioso | Camiseta Premium — beco poluído, grafite dos dois lados + galpão de metal, sem respiro.

## MÉDIO com defeito adicional (além de "sem céu") — avaliar
- `352726673` São Miguel Vitorioso | Moletom Canguru — fundo "um tanto embaralhado" + texto pequeno da estampa borrado (típico de IA).
- `352727545` São Miguel Vitorioso | Camiseta Oversized Premium — geometria dos prédios "mole" no desfoque.
- `352728524` Acima de Tudo Grafite | Camiseta Premium — outlier: única em camiseta BRANCA, corpo inteiro, luz dura de meio-dia; lê menos premium e destoa do conjunto.
- `352718275` Azulejo Sagrado | Camiseta Premium — caimento largo lê como oversized; **checar se é o mockup/peça certa** (eixo "peça errada").
- `352728451` Acima de Tudo Grafite | Camiseta Oversized Premium — grafite do muro direito borrado/smudgy (menor).

## MÉDIO coerente (o restante, ~37) — fundo crível e on-theme, sem defeito
RELÍQUIA em claustros/azulejos coloniais e STREET em becos de grafite. "Não é céu-dominante", mas é lugar real e coerente. Só entram em refação se a decisão de estilo for padronizar o catálogo inteiro no céu/Niemeyer.

## Método de correção (quando refizer)
Fundo NUNCA inventado por texto. Ancorar numa foto real: preservar o fundo bom e trocar só a peça (inpaint), OU compor o modelo sobre âncora real, OU img2img com âncora anexada. Âncoras que já temos: `public/img/bg-ceu.webp` (NUVEM), `nuvemshop/assets/banner-hero-desktop.jpg` = Catedral de Brasília e `public/img/bg-cristo.webp` (RELÍQUIA), `public/img/store-backdrop.webp` (palco Niemeyer). Falta âncora de STREET gritty — travar 1-3 plates reais antes de refazer STREET em beco. Fundo levemente fora de foco. Ver `Nimbus brain/wiki/concepts/geracao-capas-lifestyle.md`.

Dados brutos (49 itens, JSON): saída do workflow `nimbus-classificar-fundos` de 2026-07-23.

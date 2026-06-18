# NIMBUS — Storyboard da Landing (mock pré-código)

Blueprint visual da landing **scroll-driven 3D**. Define ordem das seções, qual arte entra em
cada uma, a copy (placeholder, marcada `TBD`) e as interações de scroll — pra guiar a
implementação em Next.js + R3F + GSAP depois. **Nenhum código ainda.**

> Conceito da experiência: o usuário **sobe pelo céu** conforme rola. Começa na Catedral
> saindo das nuvens (hero), atravessa nuvens, passa por ícones (Cristo, Pampulha), chega num
> momento sagrado azul (Dom Bosco) e aterrissa na coleção. Limpo, etéreo, premium, fofo na
> dose certa (a marca puffy).

---

## Mapa de assets (arquivos gerados → uso)

| Arquivo | Seção | Papel |
|---|---|---|
| `hero-desktop` / `hero-mobile` | §1 Hero | Fundo full-screen |
| `bg-ceu` (BG-01) | §2 Manifesto / §7 Footer | Fundo céu |
| `bg-cristo` (BG-02) | §3 Fé | Fundo |
| `bg-pampulha` (BG-03) | §4 Design | Fundo |
| `bg-dombosco` (BG-04) | §5 O Drop | Fundo (momento azul) |
| `cloud-01..05` (BG-05) | §1,§2,§6 | Camadas de parallax (PNG) |
| `godray` (BG-06) | §1,§2,§5 | Overlay de luz (PNG) |
| `arco` (BG-07) | §4 | Elemento flutuante de profundidade (PNG) |
| `store-backdrop` (STORE-01) | §6 Coleção | Fundo da loja |
| `wordmark-nimbus` (EMBLEM-A) | Topbar / §7 | Logo |
| `icon-cloud` (EMBLEM-C) | Favicon / avatar | Ícone |

---

## Design tokens (provisório)

- **Paleta:** céu `#DCEBFA` · branco-nuvem `#F7FBFF` · azul `#8FC1EA` · azul profundo (Dom Bosco) `#0E2A6B` · acento auréola (dourado suave) `#E9C46A` · texto grafite `#1B2733`.
- **Tipografia (sugestão):** display elegante pra títulos (ex.: *Fraunces* ou *Canela*) + sans limpa pra corpo (ex.: *Inter* / *Geist*). Wordmark = a arte puffy.
- **Vibe:** muito respiro (negative space), transições suaves, texto entra com fade+subida.

---

## Tagline — opções (escolher 1) `TBD`

1. **"Vista o céu."** ← favorita
2. "O sagrado, em alta definição."
3. "Streetwear que sobe."
4. "Fé que se veste."
5. "Entre o concreto e o céu."

---

## Seções

### §0 — Topbar (fixa, transparente sobre o hero)
```
┌───────────────────────────────────────────────────────────┐
│  [☁ NIMBUS]                         Coleção   Sobre   ☰     │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `wordmark-nimbus` (versão branca) à esquerda.
- **Interação:** transparente no hero; ao rolar, ganha leve blur/fundo translúcido.

---

### §1 — HERO
```
┌───────────────────────────────────────────────────────────┐
│                       ☼ (godray)                            │
│                                                             │
│                    V I S T A   O   C É U                    │  ← headline TBD
│              roupa católica premium · streetwear            │  ← subhead TBD
│                                                             │
│                  [  Ver Coleção  →  ]                       │  ← CTA → §6
│                                                             │
│      🏛️  (Catedral de Brasília saindo das nuvens)           │
│   ~~~~~~~~~~~~~~~~ nuvens ~~~~~~~~~~~~~~~~~~~~~~~             │
│                      ↓ role                                 │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `hero-desktop` (fundo) · mobile: `hero-mobile`.
- **Copy:** Headline = tagline escolhida · Subhead `TBD` · CTA **"Ver Coleção"**.
- **Interação:** parallax leve da catedral/nuvens no scroll; godray sutil pulsando; dica "role".

---

### §2 — MANIFESTO
```
┌───────────────────────────────────────────────────────────┐
│   ☁           ☁                              ☁             │  ← cloud-0x parallax
│                                                             │
│        "Nascemos entre o concreto branco e o céu.           │
│         Peças feitas pra durar — e pra elevar."   TBD       │
│                                                             │
│              ☁                         ☁                    │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `bg-ceu` + `cloud-01..05` (parallax) + `godray`.
- **Copy:** manifesto curto, 2–3 linhas, tipografia grande. `TBD`
- **Interação:** nuvens passam em velocidades diferentes; texto entra com fade+subida.

---

### §3 — FÉ (Cristo Redentor)
```
┌───────────────────────────────────────────────────────────┐
│                                              ⟶ ✝ (estátua)  │
│   FÉ                                        │  Cristo       │
│   ──                                        │  Redentor     │
│   Texto do ethos da marca:                  │               │
│   o porquê do NIMBUS, fé sem               ~~~ nuvens ~~~    │
│   cafonice, design com intenção.  TBD                       │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `bg-cristo` (estátua à direita, texto à esquerda).
- **Copy:** bloco "ethos" — fé + qualidade + antítese do design amador. `TBD`
- **Interação:** texto à esquerda fixa por um instante (pin) enquanto a cena desliza; nuvens à frente.

---

### §4 — DESIGN (Igreja da Pampulha)
```
┌───────────────────────────────────────────────────────────┐
│        ◜‾‾◝   (arco flutuante - parallax)                   │
│   ⌒⌒⌒  Igreja da Pampulha (azulejo azul)  ⌒⌒⌒               │
│                                                             │
│   DESIGN                                                    │
│   ──────                                                    │
│   Modernismo brasileiro: curvas, concreto,                  │
│   intenção. Cada peça é arquitetura.   TBD                  │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `bg-pampulha` (mantido) + `arco` (BG-07) flutuando em profundidade.
- **Copy:** filosofia de design — modernista, premium, intencional. `TBD`
- **Interação:** arco se move em camada própria (profundidade); texto fade-in.

---

### §5 — O DROP (vitral azul Dom Bosco)
```
┌───────────────────────────────────────────────────────────┐
│███████████ vitral azul profundo · luz ███████████          │
│                                                             │
│              PRIMEIRA COLEÇÃO                               │
│                 EM BREVE                                    │
│                                                             │
│            [  Quero ser avisado  ]   TBD                    │
│███████████████████████████████████████████████             │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `bg-dombosco` (BG-04) — quebra dramática pro **azul escuro** (âncora emocional).
- **Copy:** teaser do lançamento (sem estoque ainda) + CTA de e-mail. `TBD`
- **Interação:** transição forte de cor (céu claro → azul profundo); texto em destaque, godray.

---

### §6 — COLEÇÃO (loja placeholder) — destino do CTA do hero
```
┌───────────────────────────────────────────────────────────┐
│   COLEÇÃO ☁ (sobre o store-backdrop, boutique nas nuvens)   │
│                                                             │
│   ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                │
│   │ ▢ silh│  │ ▢ silh│  │ ▢ silh│  │ ▢ silh│   ← cards vazios│
│   │ Peça01│  │ Peça02│  │ Peça03│  │ Peça04│     (silhueta) │
│   │ R$ 199│  │ R$ 249│  │ R$ 229│  │ R$ 279│   nome/preço fake│
│   └───────┘  └───────┘  └───────┘  └───────┘                │
│              [  Notifique-me quando lançar  ]               │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `store-backdrop` (STORE-01) ao fundo; cards = **superfície CSS** (gradiente céu +
  `cloud-05` sutil), com silhueta/placeholder de roupa, nome e preço fake.
- **Copy:** "Coleção" + 4–6 cards `TBD` + CTA **"Notifique-me"** (lançamento sem estoque).
- **Interação:** cards sobem com leve stagger ao entrar; hover com elevação suave.

---

### §7 — FOOTER
```
┌───────────────────────────────────────────────────────────┐
│                  [ ☁ NIMBUS ]  (wordmark grande)            │
│            Seu e-mail [____________]  [ Entrar ]            │
│        Instagram · TikTok            Em breve · Feito no BR  │
│                  © 2026 NIMBUS                              │
└───────────────────────────────────────────────────────────┘
```
- **Asset:** `bg-ceu` em fade + `wordmark-nimbus` grande.
- **Copy:** newsletter (placeholder), redes, "Em breve / Feito no Brasil", copyright. `TBD`

---

## Mecânica de scroll-3D (registro pra Fase 1 — não implementar agora)

- **Lenis** pra scroll suave; **GSAP ScrollTrigger** orquestrando.
- Seções com `pin` curto onde o texto precisa "segurar" (§3, §5).
- **Cross-fade** entre as cenas de fundo (hero → céu → cristo → pampulha → dombosco).
- Camadas transparentes (`cloud-0x`, `godray`, `arco`) em velocidades diferentes = profundidade.
- Sensação de **subida**: leve dolly/zoom-out das cenas + nuvens descendo no viewport.
- Texto: `opacity 0→1` + `translateY 24px→0` ao entrar.
- **Mobile:** reduzir camadas de parallax (performance); empilhar texto acima da arte; usar
  `hero-mobile`; respeitar `prefers-reduced-motion` (desliga parallax pesado).

---

## Pendências (`TBD` a fechar antes da Fase 1)
1. Tagline e headline definitivas.
2. Copy do manifesto (§2), ethos (§3), design (§4), teaser (§5).
3. Idioma do site (assumido **PT-BR**; confirmar se quer PT+EN).
4. Fontes display + corpo.
5. Nomes/preços dos cards placeholder (§6).

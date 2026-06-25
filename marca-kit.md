# NIMBUS — Kit de marca pra loja (Nuvemshop)

Pra a loja ficar com a cara da marca (e não de tema genérico). Cores e fontes são as **mesmas do
site R3F** (consistência entre a landing e a loja).

## Paleta (cole os hex no editor da Nuvemshop)
| Cor | Hex | Uso |
|---|---|---|
| **Navy (primária)** | `#0b2360` | Texto, cabeçalho, botões, rodapé |
| **Ouro (acento)** | `#e9c46a` | CTA/destaque, hover, detalhes |
| **Azul-céu** | `#8fc1ea` | Secundária, links, detalhes |
| **Céu (fundo)** | `#dcebfa` | Fundo de seções |
| **Nuvem (fundo claro)** | `#f7fbff` | Fundo principal / cards |
| **Ink (texto)** | `#1b2733` | Texto corrido |
| Gradiente nuvem | `#eaf3fd → #cfe3f7` | Banners/hero |

Regra rápida: **fundo claro (nuvem/céu) + texto navy + CTA ouro.** Em fundo escuro, logo/branco.

## Tipografia
- **Títulos:** Fraunces (serifada elegante, premium).
- **Corpo:** Inter (sans, limpa).
- Onde setar: editor do tema → Tipografia/Fontes. Se o tema não tiver Fraunces, use uma serifada
  parecida (ex.: Playfair Display) + Inter. Fallbacks: `Fraunces, Georgia, serif` / `Inter,
  system-ui, sans-serif`.

## Logo
- Arquivos em `designs/prontos/_marca/` (ícone nuvem+auréola + wordmark).
- **Header/topo:** wordmark (ou ícone, se o espaço for pequeno). **Favicon:** o ícone.
- Em fundo claro: versão colorida/navy. Em fundo escuro: versão branca.
- Não esticar nem mudar as cores do logo.

## Tema recomendado
Escolha um tema **clean e minimalista** (muito respiro, imagem de produto grande, poucos
elementos) — combina com premium. Boas opções da Nuvemshop: **Trend**, **Simple** ou **Bahia**.
Critério: o que deixa a **foto do produto** maior e o layout mais limpo.

## CSS pronto (só no plano Impulso+ → "Edição de CSS avançada")
⚠️ Os **seletores mudam por tema** — este é um starter; ajuste os nomes de classe conforme o tema
(a Nuvemshop tem artigos de "Códigos CSS" por tema). Cole e teste.
```css
:root{
  --nb-navy:#0b2360; --nb-gold:#e9c46a; --nb-blue:#8fc1ea;
  --nb-sky:#dcebfa; --nb-cloud:#f7fbff; --nb-ink:#1b2733;
}
body{ background:var(--nb-cloud); color:var(--nb-ink); }
h1,h2,h3,.title{ font-family:'Fraunces',Georgia,serif; color:var(--nb-navy); }

/* Botões / CTA */
.btn, .js-addtocart-form button, button[type="submit"]{
  background:var(--nb-navy); color:#fff; border:none; border-radius:8px;
  text-transform:uppercase; letter-spacing:.04em;
}
.btn:hover, .js-addtocart-form button:hover{ background:var(--nb-gold); color:var(--nb-navy); }

/* Links e preço */
a{ color:var(--nb-navy); }
a:hover{ color:var(--nb-gold); }
.price, .product-price{ color:var(--nb-navy); font-weight:700; }

/* Header / rodapé */
.header, .store-header{ background:var(--nb-cloud); border-bottom:1px solid #e6eef9; }
.footer, .store-footer{ background:var(--nb-navy); color:#dce7fb; }
```

## Diretrizes rápidas
- **Banner/hero:** use a arte de nuvem da marca (ou um still do site R3F) com o wordmark + a frase
  "Acima de tudo" + botão "Ver coleção".
- **Foto de produto:** fundo claro/neutro, peça em destaque (ou os mockups lifestyle de
  `nimbus-lifestyle-higgsfield.md`).
- **Tom dos textos:** sóbrio e sincero (mesma régua das descrições). Sem clichê, sem travessão.
- **Coerência:** as mesmas cores/fontes do site R3F → a landing e a loja parecem a mesma marca.

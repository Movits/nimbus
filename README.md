# NIMBUS

Streetwear católico premium. Este repo tem **duas coisas**:

| | O quê | Onde |
|---|---|---|
| **Landing** | app React + 3D neste repo, deploy automático por Actions | https://nimbuswear.com.br |
| **Loja** | Nuvemshop (plataforma externa). O repo guarda o *kit* de CSS e páginas, colado à mão no painel | https://loja.nimbuswear.com.br |

**Mexendo na loja? Leia [`nuvemshop/instrucoes.md`](nuvemshop/instrucoes.md) primeiro.** Ele diz qual CSS
está em produção. A Nuvemshop remove custom properties silenciosamente, então CSS com `var()` fica inerte
lá: colar o arquivo errado apaga o estilo da loja que está no ar.

## Landing

Scroll-driven 3D. Mundo "céu": concreto branco modernista (Niemeyer) subindo pelas nuvens, luz divina,
estética premium.

**Stack:** Vite + React + TypeScript + React Three Fiber + drei.
**Deploy:** GitHub Pages (Actions) + domínio próprio → https://nimbuswear.com.br

## Rodar local

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # gera dist/
npm run preview  # serve o build
```

## Onde editar

- **Textos, preços, tagline:** `src/data/content.ts` (ponto único de edição).
- **Imagens:** `public/img/` — basta sobrescrever os arquivos (mesmo nome).
- **Visual/cores/fontes:** `src/styles/global.css` (tokens no `:root`).
- **Cena 3D / parallax:** `src/scene/` (`Backgrounds`, `ParallaxLayers`, `Experience`).
- **Seções:** `src/sections/Overlay.tsx` e `Topbar.tsx`.

Os assets vieram do Higgsfield; storyboard e prompts em
`nimbus-landing-storyboard.md` / `nimbus-higgsfield-prompts.md`.

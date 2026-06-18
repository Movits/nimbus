# NIMBUS

Landing scroll-driven 3D da NIMBUS — streetwear católico premium. Mundo "céu": concreto
branco modernista (Niemeyer) subindo pelas nuvens, luz divina, estética premium.

**Stack:** Vite + React + TypeScript + React Three Fiber + drei + GSAP.
**Deploy:** GitHub Pages (Actions) → https://movits.github.io/nimbus/

## Rodar local

```bash
npm install
npm run dev      # http://localhost:5173/nimbus/
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

# NIMBUS — Runbook de go-live (estado em 2026-07-02)

Checklist **acionável e atual** do que falta pra vender, com dono de cada passo (🧑 = Roberto, 🤖 =
assistente). Reflete o estado de hoje — o `proximos-passos.md` tem detalhes de domínio/plano
**desatualizados** (registro.br/Essencial); a verdade viva é esta e o `estado.md` do brain.

## ✅ Já feito
- **Domínio** comprado na **GoDaddy** e apontado: raiz `nimbuswear.com.br` = landing (GitHub Pages,
  CNAME ok), `loja.nimbuswear.com.br` = Nuvemshop (vinculado, SSL em emissão).
- **Plataforma:** Nuvemshop plano **Impulso** + tema **Morelia**; **YouDraw** pago e integrado.
- **Landing → loja:** CTAs da landing já apontam pro `STORE_URL` (`loja.nimbuswear.com.br`) — feito.
- **Kit da loja v2** pronto em `nuvemshop/` (CSS v2, logo, 5 banners, 2 páginas, barra de anúncio).
- **Base criativa:** 40 designs organizados; 13 heroes curados (ver `catalogo-lancamento.md`); preços
  definidos; descrições prontas; prompts lifestyle e de import (Cowork) prontos.
- **Projeto social (10%)** definido e já presente na landing, no kit da loja e nas descrições.

## 🔜 Pendências

### 1. Loja no ar com a cara da marca — 🧑 (🤖 orienta)
- [ ] Aplicar o **kit v2** na Nuvemshop: rodar `cowork-loja-v2-prompt.md` **ou** seguir `nuvemshop/instrucoes.md`.
- [ ] Criar as páginas **"Projetos Sociais"** e **"Sobre a NIMBUS"** + menu; ajustar o `href` do link
      interno da página Sobre pra URL real (ver `nuvemshop/instrucoes.md` §5).
- [ ] Habilitar o campo **"Mensagem do cliente"** no checkout (escolha do projeto social).
- [ ] **Favicon** (`public/img/favicon-nuvemshop-130.png`) e **barra de anúncio** (10% + frete grátis >R$199).

### 2. Produtos — 🧑 (🤖 preparou a folha)
- [ ] Cadastrar os **13 heroes** pela folha `catalogo-lancamento.md` (nome público, peças, preço, descrição).
- [ ] Conferir o **custo real frente+costas** de cada peça na YouDraw (não muda o preço, só sanidade da margem).
- [ ] Tabela de **medidas em cm** e a linha dos **10%** no fim de toda descrição.
- [ ] Publicar os produtos no **marketplace YouDraw** (vitrine extra).

### 3. Config comercial — 🧑
- [ ] Ativar **Pix, boleto e cartão**; regra de **frete grátis > R$199**.
- [ ] Cupom de estreia **`ESTREIA15` (−15%)**, ~7–10 dias.
- [ ] Página discreta de **trocas/devolução** (mínimo legal CDC art. 49) — **sem** "troca fácil".

### 4. Marca e redes — 🧑
- [ ] Criar **@** no Instagram e TikTok (mesmo handle, ex. `@usenimbus` / `@nimbusstreetwear`).
- [ ] Subir bio + primeiros posts (ver `lancamento-conteudo.md`, já com o gancho dos 10% e a URL real).
- [ ] **INPI classe 25 (vestuário):** busca em busca.inpi.gov.br (CAPTCHA, manual); se livre, depositar
      via e-Marcas. Fazer **antes** de investir em mídia. Plano B de nome se ocupada.

### 5. Infra — 🧑
- [ ] **Enforce HTTPS** no GitHub Pages quando o SSL do domínio custom liberar.
- [ ] `higgsfield auth login` (habilita as skills de geração de imagem/vídeo).
- [ ] **Deploy do site:** o run #47 ("Loja v2") ficou vermelho por **timeout transitório** do Pages
      (não é erro de código; o site no ar segue servindo o último build bom). Pra limpar: Actions →
      run #47 → **"Re-run failed jobs"** (ou o próximo push na `main` já refaz).

## Ordem sugerida
Kit na loja → produtos (heroes) → pagamento/frete/cupom → páginas + campo do checkout → redes no ar
com cupom → marketplace YouDraw. Proteção da marca (INPI) **antes** de gastar com mídia.

**Relacionados:** `catalogo-lancamento.md` · `lancamento-conteudo.md` · `proximos-passos.md` (roadmap
original, com domínio/plano desatualizados) · `nuvemshop/instrucoes.md`

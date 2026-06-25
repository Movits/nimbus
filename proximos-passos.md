# NIMBUS — Próximos passos (do "designs prontos" até "vendendo")

Estado atual: designs criados e organizados (`designs/prontos/.../mockups/`), preços definidos
(`precificacao.md`), plataforma decidida (`loja-plataforma.md`: Nuvemshop + YouDraw). Falta montar a
loja e lançar. Ordem abaixo, com **quem faz**.

## Roadmap
1. **Loja Nuvemshop + YouDraw** · *você* — destrava tudo.
   - Assinar **Nuvemshop Essencial** (~R$59–69/mês; domínio próprio + Pix/boleto/cartão + cadastro
     em massa). Começo (grátis) não serve (sem domínio próprio, só Nuvem Pago).
   - Assinar **plano pago da YouDraw (~R$99/mês)** — o grátis só faz 3 pedidos manuais, **sem
     integração automática**. Integrar: YouDraw → Integrações → Nuvemshop → autorizar.
   - Custo fixo pra lançar ≈ **R$158/mês** + custo de produção/taxa por venda. Comece no **mensal**,
     migre pro **anual (−15%)** quando validar.
2. **Config da loja** · *você* (eu oriento) — Pix/boleto/cartão, frete (Correios/transportadora),
   domínio, páginas (troca/devolução, privacidade, sobre), cores/tema.
3. **Fotos de produto** · *decisão* — usar as fotos/mockups da YouDraw **ou** os prompts lifestyle
   (`nimbus-lifestyle-higgsfield.md`) pra fotos com modelo.
4. **Landing → loja** · *eu* — aponto os CTAs da landing pra Nuvemshop (`src/data/content.ts`,
   `src/sections/Overlay.tsx`, `Topbar.tsx`). Só preciso da **URL da loja**.
5. **Marketplace YouDraw** · *você* — publicar os produtos lá (vitrine extra).
6. **Pré-lançamento** · *eu ajudo* — cupom −15%, frete grátis > R$199, Instagram/TikTok no ar,
   vídeos promo (`lancamento-conteudo.md` + os prompts lifestyle).
7. **Proteção da marca** · *abaixo* — antes de gastar com mídia.

## Proteção da marca (pesquisa jun/2026)
**Domínios** (checado na GoDaddy):
- ❌ `nimbus.com` e `nimbus.com.br` — **tomados** (palavra comum).
- ✅ **Livres:** `usenimbus.com.br` (recomendado, padrão BR tipo *usehace.com.br*) · `nimbuswear.com.br`
  · `nimbusstreetwear.com.br` · `vistanimbus.com.br` · `nimbus.store`.
- Registrar **.com.br no [registro.br](https://registro.br)** (precisa CPF/CNPJ, ~R$40/ano); `.store`
  em registrador comum.
- **Ação:** garantir o domínio **já** (é barato e evita perder o nome).

**@ redes:** conferir manualmente `@usenimbus` / `@nimbus.br` / `@nimbusstreetwear` no Instagram e
TikTok (o `@nimbus` puro provavelmente está tomado). Pegar o mesmo handle nos dois.

**Marca (INPI):** a busca oficial é interativa (CAPTCHA), então **não dá pra confirmar por aqui** se
"NIMBUS" já tem registro na **classe 25 (vestuário)**. Como é palavra comum, é provável que exista
registro em **outras** classes (tech, etc.) — o que importa é a **classe 25**.
- **Ação:** fazer a busca em [busca.inpi.gov.br](https://busca.inpi.gov.br) (classe 25) ou via
  serviço (Consolide/Legismarcas/advogado). Se livre, **registrar** (e-Marcas): ~**R$142** (com
  desconto MEI/ME) a R$355 + ~R$215 na concessão; sai em ~18 meses, mas a **proteção conta do
  depósito**. ([guia INPI](https://www.gov.br/inpi/pt-br/servicos/marcas/guia-basico) ·
  [classe roupas](https://legismarcas.com.br/registrar-sua-loja-de-roupas/))
- Se a classe 25 estiver ocupada por "NIMBUS", já temos **plano B de nome** (podemos brainstormar).

## Checklist
- [ ] Registrar domínio (ex.: `usenimbus.com.br`) + pegar @ no Insta/TikTok.
- [ ] Busca INPI classe 25 → se livre, depositar a marca.
- [ ] Assinar Nuvemshop Essencial + plano pago YouDraw; integrar.
- [ ] Cadastrar produtos (mockups + descrições + preços) e configurar pagamento/frete.
- [ ] Me passar a URL da loja → conecto a landing.
- [ ] Publicar no marketplace YouDraw.
- [ ] Subir Instagram/TikTok + cupom de estreia (ver `lancamento-conteudo.md`).

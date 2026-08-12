---
status: vigente
atualizado: 2026-08-11
---
# Regra de fotos e copy do site (vitrine e landing)

> [!info] 11/08: as regras de COPY continuam valendo palavra por palavra. A
> seção **Ferramentas** foi revogada em 06/08
> (`2026-08-06-nova-direcao-colecoes.md`): estampa-teste sai pelo MCP do
> Higgsfield por ordem expressa do dono, e o processo de fundo verde/chroma foi
> CONDENADO (arte nova nasce em PNG de fundo transparente, 300 DPI).

Decisões do dono (29/07) e do conselho da 2ª rodada (ata em
`nuvemshop/auditoria/2026-07-29-conselho-vitrine/`). Nenhuma imagem nova do site é
gerada, e nenhuma copy pública é escrita, fora destas regras.

## Fotos com pessoas

1. **Rosto visível: só o casting oficial** (Caio, Clara, Gabriel, Helena), gerado com as
   pranchas de `nimbus-assets/casting/2026-07-16/` como referência de identidade.
2. **Modelo genérico: só sem rosto** (de costas ou corte abaixo do queixo), sempre dentro
   do cenário e da luz canônicos da coleção.
3. Toda geração com rosto passa por descarte de semelhança com pessoa real.
4. **Proibido publicar prancha de identidade, board de casting ou mockup cru** como foto
   de site. Prancha é ferramenta interna de consistência, não asset.
5. O dono entrará como modelo em rodada futura, como complemento ao casting, sob a mesma
   luz e cenário canônicos (registrado em ata; política de transparência sobre IA a
   definir antes).

## Cenários canônicos por coleção (fonte: brain, prompts-higgsfield)

- **STREET**: beco/rua de concreto com graffiti e arquitetura brutalista estilo Niemeyer,
  luz natural dura, clima gritty premium.
- **RELÍQUIA**: fachada de igreja/catedral brasileira no golden hour, luz devocional
  quente, grão de filme sutil, solene, nunca irônico.
- **NUVEM**: monumentos modernistas de Brasília sob céu azul claro com nuvens suaves,
  aberto, arejado, etéreo.

Diretriz jurídica (Dra. Renata, ata 29/07): cenários **gerados e inspirados**, sem
reprodução fiel de obra ou graffiti identificável e sem nomes reais (arquiteto,
monumento, paróquia) em copy comercial.

## Copy pública (soma-se às regras existentes)

- Sem travessão. Nunca "troca fácil". Sem "loja oficial" (a loja é uma só).
- **Proibido "sob demanda", "print on demand", "produzida após o pedido"** e variações:
  o dono vetou por soar dropshipping. Linguagem aprovada: "feita no Brasil, para você".
- Prazo ao cliente: sempre o prazo TOTAL em dias úteis, com as 48h de produção já
  embutidas, sem citar produção. Faixas vigentes (tabela YouDraw + 2 dias úteis):
  São Paulo 3 a 5 · Sudeste 4 a 6 · Sul e Centro-Oeste 5 a 7 · Norte e Nordeste 6 a 12.
  "O prazo do checkout para o seu CEP prevalece."
- Parcelamento: "cartão em até 12x" (padrão Nuvemshop autorizado pelo dono em 29/07).

## Ferramentas

- **Higgsfield**: imagens editoriais do site (cenários, hero, campanha) e casting.
- **Gemini API**: artes de estampa. Não gerar arte de produto para o site.
- Artes de estampa nunca aparecem inteiras/em alta no repo público: só recorte sangrado
  achatado, máximo 900 px, sem alpha.

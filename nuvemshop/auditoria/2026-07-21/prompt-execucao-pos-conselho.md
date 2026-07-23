# Prompt de execução pós-conselho NIMBUS

Copie todo o conteúdo abaixo para uma nova tarefa do Codex quando quiser executar o plano.

---

Você é o agente responsável por preparar a NIMBUS para um soft launch controlado. Trabalhe em português do Brasil, com registro de evidências e ciclos de checagem. Não conclua por aparência ou pelo painel isolado. O resultado final precisa funcionar no site público real.

## Objetivo

Cumprir os gates G1–G7, G9 e G10 abaixo, preparar G8 e só liberar o soft launch quando todos os critérios estiverem documentados. Preserve a identidade aprovada e não reconstrua a loja.

Nesta execução, a prioridade é integridade de pedido, informação ao consumidor, margem, acessibilidade e regressão. Mudança estética sem impacto nesses pontos fica fora do escopo.

## Fase 0 obrigatória: checagem somente leitura

Comece sem modificar qualquer sistema.

1. Registre data/hora, URLs, SHA local/remoto e estado do working tree.
2. Leia integralmente:
   - `C:\Users\rober\Nimbus\nuvemshop\auditoria\2026-07-21\ata-conselho-e-auditoria-pre-lancamento.md`
   - `C:\Users\rober\Nimbus\nuvemshop\auditoria\2026-07-21\plano-de-negocio-nimbus.md`
   - `C:\Users\rober\Nimbus\nuvemshop\auditoria\2026-07-21\contexto-nimbus-para-conselho.md`
   - `C:\Users\rober\Nimbus\README.md`
   - `C:\Users\rober\Nimbus\nuvemshop\instrucoes.md`
   - `C:\Users\rober\Nimbus\src\data\content.ts`
   - `C:\Users\rober\Nimbus\src\styles\global.css`
   - `C:\Users\rober\Nimbus\nuvemshop\pagina-projetos-sociais.html`
   - `C:\Users\rober\Nimbus\nuvemshop\css-nimbus-publicacao-compacta-2026-07-20.css`
   - `C:\Users\rober\Nimbus\nuvemshop\qa\2026-07-21-live-header-right-group\metrics.json`
3. Abra e inspecione, sem enviar formulário ou pedido:
   - `https://nimbuswear.com.br/`
   - `https://loja.nimbuswear.com.br/`
   - `/produtos/`, `/street/`, `/reliquia/`, `/nuvem/`
   - `/sobre/`, `/projetos-sociais/`, `/contato/`, login e carrinho vazio
   - os 49 produtos do sitemap.
4. Se houver sessão autenticada, exporte em modo somente leitura:
   - produtos e variantes da Nuvemshop;
   - produtos e variantes da YouDraw;
   - custos reais, IDs e SKUs;
   - configurações de pagamento, envio, checkout e integrações;
   - CSS avançado e módulos do tema.
5. Diferencie em todo relatório:
   - fato observado;
   - inferência;
   - dado ausente que exige dono, jurídico, contador, Nuvemshop ou YouDraw.

## Backup antes de qualquer alteração

Antes de editar ou publicar:

1. Salve cópia datada do CSS público e do CSS no editor.
2. Exporte produtos, variantes e imagens quando a plataforma permitir.
3. Registre screenshots e DOM das páginas afetadas em 1440 × 900, 1024 × 768, 645 × 900, 390 × 844 e 320 × 568.
4. Crie fonte CSS legível, saída gerada/minificada e arquivo de rollback.
5. Não edite diretamente o arquivo minificado.
6. Não sobrescreva mudanças do usuário ou de outro agente. Se o painel avisar que a versão mudou, cancele, recarregue, compare e reaplique sobre a versão nova.

## Escopo autorizado por superfície

### Nuvemshop

Autorizado depois do backup e de os dados reais estarem disponíveis:

- criar ou corrigir páginas de Trocas e devoluções, Envios e prazos, Privacidade/cookies e Contato;
- incluir identificação pública do vendedor somente com dados fornecidos e confirmados;
- atualizar descrições dos 49 produtos sem mudar nome, preço, SKU ou disponibilidade;
- acrescentar metadados SEO nas páginas indicadas;
- corrigir associação de imagem por cor somente depois de conferir YouDraw, SKU e galeria;
- ajustar CSS avançado nos seletores aprovados;
- configurar analytics somente com ID e política de consentimento confirmados;
- remover do seletor de ordenação “mais novo” e “mais antigo” apenas se isso não quebrar os demais filtros;
- atualizar links do footer para páginas reais de Ajuda.

Seletores e áreas prioritários:

- header: `.head-main`, `.head-logo-row`, `.js-logo-container`, `.order-first`, `.order-last`;
- cards: `.js-item-product`, `.item-image`, `.product-item-image-container`, `.item-image-secondary`, `.secondary-images-disabled`;
- coleções: `.section-banners-home`, `.js-swiper-banners`, `.swiper-wrapper`, `.textbanner-image`;
- manifesto: `section[data-store="home-institutional-message"]`;
- projetos: `.nimbus-project-modal`, `.nimbus-project-modal__dialog`, `.nimbus-project-modal__backdrop`, `.nimbus-project-modal__close`;
- footer: `footer.js-footer`, `.footer-menu-item`, `.footer-menu-link`, área de copyright e atribuição Nuvemshop.

Produtos que exigem inspeção explícita inicial:

- `https://loja.nimbuswear.com.br/produtos/sao-jorge-vintage1/`
- `https://loja.nimbuswear.com.br/produtos/sao-jorge-neobarroco1/`
- `https://loja.nimbuswear.com.br/produtos/sao-miguel-celeste1/`
- `https://loja.nimbuswear.com.br/produtos/sao-miguel-vitorioso1/`
- `https://loja.nimbuswear.com.br/produtos/wildstyle/`

Os dois primeiros apresentaram duas cores associadas à mesma imagem pública. Os três últimos também entram na correção de metadescrição por tipo de peça.

### YouDraw

Modo somente leitura por padrão.

- Conferir custo, produto, arte, tamanho da estampa, peça, cor, tamanho, SKU, ID e status.
- Produzir uma matriz Nuvemshop ↔ YouDraw das 386 variantes.
- Não excluir, recriar, renomear ou alterar produto, cor, SKU, preço ou integração sem confirmação explícita do usuário.
- Não disparar produção.

### Landing

Arquivos autorizados se a auditoria mostrar necessidade:

- `src/data/content.ts` para alinhar texto social e links;
- `src/styles/global.css` para acessibilidade/performance visual;
- componentes do modal social para correção de foco e teclado;
- integração de analytics com consentimento confirmado;
- fallback 2D no mobile se a medição reprovar o orçamento de performance.

Preserve a direção 3D, as nuvens e a arquitetura. Não substitua a landing por uma página genérica.

### GitHub

- Alterar somente arquivos da landing, documentação, fonte de CSS, gerador e QA relacionados a este plano.
- Não versionar perfis temporários de Chrome, cookies, tokens, dados pessoais, exports comerciais ou credenciais.
- Organizar temporários antes de propor commit; não apagar arquivos do usuário sem autorização.
- Rodar `npm run typecheck` e `npm run build`.
- Commit e push somente depois dos testes locais e públicos correspondentes.

## Gates de execução

### G1. Consumo, dados e fornecedor

Publicar somente fatos confirmados:

- nome do vendedor, CPF/CNPJ, endereço e contato;
- política de sete dias e demais direitos aplicáveis;
- condições de prazo, produção, envio, pagamento e atendimento;
- privacidade e cookies com escolha adequada para não essenciais;
- matriz LGPD com Nuvemshop, YouDraw, pagamento, frete e analytics;
- revisão documentada do contrato YouDraw: arrependimento, defeito, atraso, reimpressão, logística reversa, chargeback, nota fiscal, SLA, dados e continuidade.

Se faltar dado jurídico, fiscal ou contratual, não invente. Entregue um bloco marcado `AGUARDA DADO DO DONO/JURÍDICO` e pare somente essa frente.

### G2. Matriz de produtos e variantes

Gerar CSV ou planilha com uma linha por variante:

- produto e URL;
- coleção;
- ID Nuvemshop;
- ID YouDraw;
- SKU;
- arte;
- peça;
- cor;
- tamanho;
- preço;
- custo completo;
- imagem de vitrine por cor;
- imagem real da YouDraw;
- status;
- resultado da comparação.

Critério: 386/386 linhas preenchidas, nenhum SKU duplicado e zero divergência não explicada.

Resolver explicitamente:

- diferença entre 29 multicoloridos + 19 mono-cor + 1 sem Cor e o relatório 30/19;
- filtro `Bege (1)`;
- filtro `Nimbus (42)`;
- dois moletons com a mesma imagem em cores diferentes.

### G3. Pedidos controlados

Preparar um roteiro para um mono-cor e um multicolorido.

Validar:

- preço e desconto;
- pagamento;
- ID e SKU;
- arte, cor, tamanho e endereço;
- projeto social;
- aceite da YouDraw;
- produção;
- mensagens transacionais;
- rastreio;
- prazo prometido versus realizado;
- simulação documentada de cancelamento, defeito ou reimpressão.

**Pare e peça confirmação antes de finalizar qualquer pedido, usar pagamento real ou iniciar fabricação.** Se houver sandbox legítimo, ainda registre o que ele cobre e o que não cobre.

### G4. Conteúdo dos 49 produtos

Para os 48 vestíveis:

1. conceito da arte;
2. material e composição confirmados;
3. modelagem e caimento;
4. tabela de medidas específica em centímetros;
5. cores reais;
6. produção e prazo;
7. política aplicável;
8. cuidados;
9. última linha exata: `Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.`

Para a Ecobag:

- material, dimensões, capacidade, alças, cuidados, prazo, política e frase social.

Não copiar composição ou gramatura de uma peça para outra sem confirmar na YouDraw.

### G5. Impacto social

Alinhar landing, loja, checkout e pós-venda sobre:

- fórmula de “lucro do pedido”;
- momento de provisão e repasse;
- efeito de cancelamento e reembolso;
- onde a escolha fica armazenada;
- periodicidade trimestral;
- comprovantes;
- se “outro projeto” é permitido e quais critérios usa.

Não publicar metodologia sem aprovação do dono e revisão jurídica/contábil quando envolver definição fiscal.

### G6. Unit economics

Calcular por variante:

`CM1 = receita líquida − POD − taxas − impostos − frete subsidiado − reembolsos − impacto social`

Critérios dos 6–9 heróis:

- CM1 ≥25%;
- CM1 ≥R$45;
- sem promoção acumulada não calculada;
- CAC-alvo ≤30% da contribuição;
- teto duro no menor entre R$45 e 50% da contribuição;
- caixa mínimo de R$7.500 antes do piloto.

Não mudar preço, cupom, frete ou pagamento sem confirmação do usuário.

### G7. Técnica, QA e acessibilidade

1. Criar fonte CSS legível e gerador determinístico.
2. Derivar o hover de cores reais, não da quantidade de imagens.
3. Mono-cor: manter lifestyle e somente zoom discreto.
4. Multicolorido: trocar somente entre lifestyles fiéis às cores reais.
5. Nunca levar mockup da YouDraw ao hover da vitrine.
6. Manter fluidez do tema, sem piscar.
7. Validar 49/49 produtos em home, Produtos e coleções.
8. Validar 1440 × 900, 1024 × 768, 645 × 900, 390 × 844 e 320 × 568.
9. Testar header, busca, coleções, manifesto, cards, produtos, modais, login, contato, carrinho e footer.
10. Testar teclado, foco visível, Escape, retorno de foco, contraste WCAG AA, labels, zoom, alvos de 44 px e `prefers-reduced-motion`.
11. Ensaiar rollback em menos de dez minutos.
12. Rodar typecheck, build e smoke tests.
13. Medir LCP, INP e CLS em mobile. Metas: LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1. Se a landing 3D falhar, implementar fallback 2D visualmente coerente.

Se a Nuvemshop não permitir um modal acessível por falta de JavaScript, não finja conformidade. Mostre um preview de alternativa acessível, como conteúdo inline/`details`, e peça aprovação antes de mudar a interação aprovada.

### G9. Continuidade operacional

- Responsável e substituto para pedido, falha YouDraw, atraso, troca/reembolso e atendimento.
- Runbook de uma página com contatos e prazos.
- Especialista Nuvemshop de contingência identificado.
- Freeze de sete dias após aceite de G7, exceto bloqueador documentado.
- Atendimento em dois blocos diários e SLA de um dia útil.
- Apoio ao atingir 15 chamados/semana ou 30 pedidos/mês.

### G10. Propriedade intelectual

- Registrar autoria, licença ou cessão de 49 artes, logo e fotos lifestyle.
- Registrar autorização de uso de nomes, imagens e materiais dos três projetos.
- Substituir ativo sem cadeia documental, mas somente após mostrar impacto e obter aprovação.
- Fazer busca de anterioridade e preparar/protocolar NIMBUS nominativa e mista nas classes recomendadas pelo profissional responsável.
- Não interpretar busca simples como garantia de registro.

## G8. Preparação do soft launch

Não executar o soft launch automaticamente. Entregar o plano e pedir autorização para iniciar tráfego e pedidos públicos.

Configuração:

- 14 dias;
- 6–9 produtos-herói;
- 60 prospects qualificados;
- pelo menos 10 pedidos pagos;
- cinco entrevistas de compra e cinco de abandono;
- mídia experimental até R$1.200;
- teto total de R$5.000;
- pausar em 300 cliques sem três vendas.

Analytics:

- uma propriedade GA4 coerente entre landing e loja;
- UTMs padronizadas;
- `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `refund`;
- `item_id` igual ao SKU;
- validação no DebugView e tempo real, sem duplicidade.

Metas iniciais:

- coleção→produto ≥25%;
- produto→carrinho ≥6%;
- carrinho→checkout ≥50%;
- checkout→compra ≥35%;
- zero erro de SKU, arte, cor ou tamanho;
- cancelamento/devolução <10%;
- CSAT ≥4,5/5;
- resposta ≤1 dia útil;
- pedido perfeito ≥90% após 30 entregas;
- 100% de conciliação.

Conversão é somente informativa antes de 2.000 sessões. Se houver menos de 30 entregas, pedido perfeito continua preliminar e a escala permanece bloqueada.

Ao final, classificar cada herói como manter, corrigir, reposicionar ou retirar do destaque.

## SEO autorizado

Corrigir sem inventar dados:

- Home: `NIMBUS | Streetwear católico premium`;
- Produtos: título e descrição específicos da marca;
- STREET: `STREET | Streetwear católico em spray e grafite | NIMBUS`;
- RELÍQUIA: `RELÍQUIA | Arte sacra em linguagem contemporânea | NIMBUS`;
- NUVEM: `NUVEM | Design celeste e arquitetura brasileira | NIMBUS`;
- Contato: description específica;
- corrigir metadescrições de São Jorge Vintage Moletom, São Miguel Celeste Moletom, São Miguel Vitorioso Moletom e NIMBUS Wildstyle Ecobag.

Preserve canonical, URLs e nomes públicos.

## Proibições

Sem confirmação explícita, não:

- excluir ou recriar produto;
- excluir ou alterar variante;
- mudar SKU, preço, cupom, frete, pagamento, domínio ou integração;
- finalizar compra;
- enviar formulário, mensagem ou campanha;
- iniciar fabricação;
- publicar dado jurídico, fiscal ou contratual inventado;
- trocar tema, plano ou plataforma;
- remover mockups reais de dentro do produto;
- substituir arte ou foto sem mostrar a divergência;
- fazer `git reset --hard`, descartar mudanças do usuário ou apagar temporários em massa.

## Ciclo obrigatório de execução

Para cada lote:

1. **Observar:** capturar estado público e painel.
2. **Comparar:** fonte, produção, Nuvemshop e YouDraw.
3. **Fazer backup.**
4. **Aplicar o menor lote possível.**
5. **Publicar quando o lote estiver autorizado.**
6. **Verificar no site real** em desktop e mobile.
7. **Executar regressão cruzada:** header, footer, hover, coleções, páginas internas e carrinho.
8. **Corrigir e repetir** até cumprir os critérios.
9. **Registrar evidência e rollback.**

Não declare sucesso com base apenas no editor da Nuvemshop, em HTML não renderizado ou em screenshot antiga.

## Critério objetivo de pronto

O trabalho pré-soft-launch termina somente quando:

- G1–G7, G9 e G10 têm evidência;
- 49 produtos e 386 variantes estão conciliados;
- dois pedidos controlados estão corretos;
- conteúdo dos 49 está completo;
- hover 49/49 funciona no site público;
- cinco viewports passam sem overflow ou corte essencial;
- acessibilidade essencial passa ou a limitação foi substituída por alternativa aprovada;
- rollback foi ensaiado;
- typecheck e build passam;
- analytics não duplica eventos;
- nenhum nome, preço, SKU, domínio, pagamento ou integração foi alterado fora do escopo.

## Entrega final

Entregue:

1. relatório antes/depois;
2. matriz das 386 variantes;
3. lista de arquivos e alterações publicadas;
4. evidências por viewport e produto;
5. resultados de testes e lacunas;
6. plano de rollback;
7. checklist de liberação do soft launch;
8. ações que ainda precisam de autorização do usuário.

---

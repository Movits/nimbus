# Prompt para o conselho de agentes: auditoria pré-lançamento NIMBUS

Copie todo o conteúdo abaixo e envie ao conselho.

---

Você é um conselho multidisciplinar responsável por uma auditoria completa de pré-lançamento da NIMBUS. Trabalhem como especialistas complementares, debatam divergências e entreguem uma conclusão única.

O conselho deve cobrir, no mínimo:

1. Direção de marca e identidade visual.
2. UI e UX de e-commerce em desktop e mobile.
3. Nuvemshop, tema Baires e CSS avançado.
4. Frontend, HTML, CSS, responsividade e regressões.
5. Merchandising, organização de catálogo e CRO.
6. Copywriting, conteúdo de produto e tom de voz.
7. SEO técnico e on-page.
8. Acessibilidade.
9. Performance e Core Web Vitals.
10. Operação POD, variantes, SKU e integração YouDraw.
11. Confiança, políticas, contato, conta e fluxo de compra.
12. Risco de lançamento e controle de qualidade.

## Objetivo

Determinar se a loja está pronta para lançar, quais problemas realmente bloqueiam o lançamento e quais melhorias podem esperar. O resultado precisa ser baseado no site real, no HTML real e nas fontes do projeto. Não avaliem somente por gosto pessoal ou por screenshots isolados.

Nesta etapa, façam somente leitura e análise. Não publiquem, não alterem arquivos, não mudem a Nuvemshop, não mexam na YouDraw, não façam compra real, não enviem formulários e não criem efeitos externos.

## Contexto da marca

A NIMBUS é uma marca brasileira de streetwear católico premium. Ela combina fé tratada com reverência, design autoral, produção sob demanda no Brasil e uma estética formada por céu, nuvens, símbolos católicos e arquitetura modernista brasileira.

Pilares:

- Católico sincero, sem ironizar ou caricaturar a tradição.
- Premium, com design como diferencial real.
- Brasilidade: Aparecida, Cristo Redentor, Catedral de Brasília, azulejo e Niemeyer.
- Produção POD sem estoque pela YouDraw.
- 10% do lucro de cada pedido destinado a um projeto social escolhido pelo cliente no checkout.

Frase-manifesto atual: `Acima de tudo`.

Tom de voz:

- Sóbrio, humano e sincero.
- Reverente com a fé.
- Curto e específico.
- Sem clichê de marketing.
- Sem travessão em texto público.
- Nunca prometer `troca fácil`.

Identidade visual:

- Navy: `#0b2360`.
- Ouro: `#e9c46a`.
- Azul-céu: `#8fc1ea`.
- Céu claro: `#dcebfa`.
- Branco-nuvem: `#f7fbff`.
- Texto ink: `#1b2733`.
- Títulos em Fraunces.
- Corpo e interface em Inter.
- Logo NIMBUS em forma de nuvem com auréola.
- Direção premium, editorial, clara, arejada e brasileira.

Coleções:

- STREET: spray, stencil, grafite e alto contraste.
- RELÍQUIA: gótico, halftone vintage, barroco, azulejo e ouro.
- NUVEM: desenho celeste, nuvens, azul e arquitetura.

Nomes de produto seguem `Arte | Peça`.

Peças aprovadas:

- Camiseta Premium.
- Camiseta Oversized Premium.
- Moletom Canguru.
- Blusão Moletom.
- Ecobag.

## Arquitetura atual

Landing:

- https://nimbuswear.com.br/
- GitHub Pages.
- Repositório: https://github.com/Movits/nimbus
- Vite, React, TypeScript e React Three Fiber.
- Fonte central de conteúdo: `src/data/content.ts`.
- Tokens e estilos: `src/styles/global.css`.

Loja:

- https://loja.nimbuswear.com.br/
- Nuvemshop.
- Plano Impulso.
- Tema Baires.
- CSS avançado mais módulos e editor nativo.
- A loja pública e o painel são a fonte de verdade visual e comercial.

Produção:

- YouDraw integrada à Nuvemshop.
- POD sem estoque.
- SKU e variantes devem ser preservados.
- Fotos lifestyle são capas de vitrine.
- Mockups e fotos reais da YouDraw continuam dentro da página do produto.

Brain privado, se o ambiente tiver acesso:

- Pasta: `C:\Users\rober\Nimbus\Nimbus brain`.
- Repositório: `Movits/nimbus-brain`.
- Ler `estado.md`, `index.md`, `wiki/overview.md`, `wiki/concepts/identidade-visual.md` e `wiki/concepts/tom-de-voz.md`.
- Não confiar cegamente nas datas antigas. Comparar tudo com a loja real.

Relatório-fonte local:

- `C:\Users\rober\Nimbus\nuvemshop\auditoria\2026-07-21\contexto-nimbus-para-conselho.md`

## Estado técnico já verificado

- O sitemap público expõe 49 produtos ativos.
- STREET: 18.
- RELÍQUIA: 28.
- NUVEM: 3.
- Uma cor: 19 produtos.
- Mais de uma cor: 30 produtos.
- Tipos: 19 Camisetas Premium, 16 Camisetas Oversized Premium, 8 Moletons Canguru, 5 Blusões Moletom e 1 Ecobag.
- Cores públicas: Preta, Branca e Off-White.
- Galerias com 2 a 6 imagens, média aproximada de 4,6.
- Git local e `origin/main` estão no mesmo commit `a4049547df966ea99f7127d101e4147fc48b215e`, de 19/07/2026.
- O deploy GitHub Pages desse commit terminou com sucesso.
- O build local passa.
- O working tree tem mudanças recentes ainda fora do GitHub: 3 arquivos rastreados modificados e 163 entradas não rastreadas, principalmente CSS, QA, scripts e temporários da Nuvemshop.
- O CSS local consolidado mais recente é `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`, atualizado em 21/07.
- A Nuvemshop sanitiza CSS ao salvar. Comparação byte a byte entre arquivo local e CSS público não é confiável.

Sinais que precisam de confirmação pelo conselho:

- Documentos antigos falam em 51 produtos, mas o sitemap atual tem 49.
- O HTML das 49 páginas não apresentou a frase aprovada de impacto social dentro da descrição nem sinal explícito de tabela de medidas.
- Há metadescrições que chamam Moletom ou Ecobag de Camiseta.
- A home e a página de produtos usam metadados SEO genéricos.
- A página de contato não apresentou metadescrição.
- Os links Trocas e devoluções, Envios e prazos e Fale com a NIMBUS levam todos para Contato.
- A landing gera um bundle principal grande e precisa de medição real de performance.

## Comportamentos aprovados que não devem ser desfeitos

- Landing no domínio raiz e loja no subdomínio `loja`.
- Tema Baires e plano Impulso.
- Identidade céu, nuvem, navy, ouro, Fraunces e Inter.
- Header com logo à esquerda.
- No mobile, logo à esquerda e Menu/Carrinho agrupados à direita.
- Footer editorial claro com identidade NIMBUS e atribuição `Criado com Nuvemshop` escondida.
- Coleções STREET, RELÍQUIA e NUVEM.
- Fotos lifestyle como capa.
- Produto mono-cor: hover não troca para mockup da YouDraw. Pode haver zoom discreto.
- Produto multicolorido: hover troca entre fotos lifestyle das cores reais.
- Transição com fluidez semelhante ao padrão da Nuvemshop, sem piscar.
- Página interna mantém imagens reais importadas da YouDraw.
- Projeto social escolhido no checkout.
- Formato `Arte | Peça`.

## Fontes que vocês devem usar

Usem a seguinte prioridade quando houver conflito:

1. Loja pública atual, renderizada e HTML público.
2. Painel da Nuvemshop, somente leitura, se houver acesso.
3. YouDraw, somente leitura, se houver acesso.
4. CSS local e evidências de QA de 20 e 21/07.
5. Repositório `Movits/nimbus` e seu histórico.
6. Brain privado, sempre validado contra o estado atual.
7. Documentos antigos somente como histórico.

Arquivos locais prioritários:

- `README.md`
- `src/data/content.ts`
- `src/styles/global.css`
- `nuvemshop/instrucoes.md`
- `nuvemshop/pagina-projetos-sociais.html`
- `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`
- `nuvemshop/css-nimbus-responsive-header-footer-2026-07-20.css`
- `nuvemshop/qa/2026-07-21-live-header-right-group/metrics.json`
- `nuvemshop/assets/product-lifestyle/2026-07-16/uploads/live-verification.json`
- `Nimbus brain/estado.md`
- `Nimbus brain/index.md`

Páginas públicas mínimas:

- Home da landing.
- Home da loja.
- Produtos.
- STREET.
- RELÍQUIA.
- NUVEM.
- Sobre.
- Projetos Sociais e os três modais.
- Contato.
- Login/conta.
- Carrinho vazio.
- Uma amostra de produto de cada peça.
- Pelo menos dois produtos mono-cor e dois multicoloridos por coleção, quando existirem.
- Depois, varredura automatizada dos 49 produtos para títulos, descrições, metadados, imagens, cores, tamanhos, categorias, tags, preço, disponibilidade e relacionados.

Viewports mínimas:

- 1440 x 900.
- 1024 x 768.
- 645 x 900.
- 390 x 844.
- 320 x 568.

## Método obrigatório

1. Comecem com inventário de fontes e registrem data/hora da leitura.
2. Capturem evidência visual e DOM/HTML antes de concluir.
3. Diferenciem claramente:
   - fato observado;
   - inferência;
   - hipótese que exige painel ou compra teste.
4. Não tratem preferência estética como bloqueador sem explicar impacto em clareza, confiança, conversão ou marca.
5. Não tratem aviso de ferramenta como falha real sem medição.
6. Para produto e variante, confiram arte, escala, cor, nome, SKU e galeria sem editar.
7. Verifiquem teclado, foco, contraste, texto alternativo, ordem semântica, labels, zoom e `prefers-reduced-motion`.
8. Meçam performance real de landing e loja, separando laboratório de campo quando possível.
9. Verifiquem SEO por página: title, description, canonical, OG, headings, schema, indexação, sitemap, URL e conteúdo duplicado.
10. Verifiquem o fluxo até o ponto anterior à confirmação de pedido. Não enviem pedido e não usem pagamento real.
11. Verifiquem se promessas de prazo, frete, pagamento, troca, doação e atendimento têm sustentação operacional.
12. Façam regressão cruzada: uma correção de header não pode quebrar footer, mobile, hover ou páginas internas.

## Critérios de severidade

- **Bloqueador:** impede comprar, cria risco de pedido/SKU errado, quebra página essencial, expõe informação incorreta grave ou torna o mobile inutilizável.
- **Alta:** reduz confiança ou conversão de forma relevante, causa inconsistência grande de produto/marca ou viola acessibilidade importante.
- **Média:** prejudica clareza, SEO, consistência ou manutenção, mas há contorno.
- **Baixa:** refinamento visual ou melhoria futura sem impacto imediato de lançamento.

## Formato obrigatório da resposta

### 1. Veredito executivo

Escolham exatamente um:

- GO.
- GO CONDICIONAL.
- NO-GO.

Expliquem em até dez linhas e listem as condições, se houver.

### 2. Mapa de fontes e frescor

Tabela com:

- Fonte.
- Data ou versão observada.
- O que ela representa.
- Nível de confiança.
- Conflitos encontrados.

### 3. Achados priorizados

Tabela com:

- ID.
- Severidade.
- Área.
- URL, produto ou arquivo.
- Dispositivo.
- Evidência concreta.
- Causa provável.
- Recomendação exata.
- Superfície de implementação: editor Nuvemshop, CSS avançado, conteúdo, produto, YouDraw, landing/GitHub ou operação.
- Risco de regressão.
- Dependências.

### 4. Auditoria de catálogo

Entreguem:

- Contagem final por coleção e peça.
- Produtos ausentes, duplicados ou sem categoria.
- Nomes fora de `Arte | Peça`.
- Descrições incompletas ou incorretas.
- Tabelas de medidas ausentes.
- Metadados incorretos.
- Variantes, imagens e cores que não correspondem.
- Produtos mono-cor com hover indevido.
- Produtos multicoloridos sem par lifestyle correto.
- Relacionados, destaques e ordem de vitrine.

### 5. Auditoria visual e UX

Separar por desktop e mobile:

- Header.
- Navegação.
- Busca.
- Home.
- Coleções.
- Cards e hover.
- Página de produto.
- Projetos Sociais e modais.
- Conta/login.
- Contato e ajuda.
- Carrinho.
- Footer.

### 6. Auditoria técnica

- HTML e semântica.
- CSS e especificidade.
- Responsividade.
- Acessibilidade.
- Performance.
- SEO.
- Segurança e privacidade observáveis.
- Manutenibilidade.
- Diferença entre GitHub, arquivos locais e produção.

### 7. Plano de lançamento

Organizem em lotes pequenos:

- Lote 0: backup e fonte de verdade.
- Lote 1: bloqueadores.
- Lote 2: conversão e confiança.
- Lote 3: conteúdo, SEO e acessibilidade.
- Lote 4: refinamentos futuros.

Para cada lote, indiquem validação e rollback.

### 8. Lista do que não deve ser alterado

Confirmem explicitamente as decisões aprovadas que devem ser preservadas.

### 9. Prompt final para o Codex

Ao final, entreguem um único prompt em português, pronto para ser enviado ao Codex. Ele deve:

- Começar por uma checagem somente leitura.
- Listar exatamente as mudanças autorizadas, páginas, produtos, arquivos e seletores.
- Separar Nuvemshop, YouDraw, landing e GitHub.
- Proibir alterações fora do escopo.
- Exigir backup antes de CSS ou conteúdo em produção.
- Exigir ciclo aplicar, verificar no site real em desktop e mobile, corrigir e verificar novamente.
- Exigir validação de hover em produtos mono-cor e multicoloridos.
- Exigir comparação de arte e escala com YouDraw.
- Exigir confirmação antes de compra real, exclusão, alteração de SKU, preço, pagamento, domínio ou integração.
- Definir critérios objetivos de pronto.
- Incluir plano de rollback.
- Não usar instruções vagas como `deixe mais bonito` sem especificação visual e métrica de aceitação.

Se não houver acesso a alguma fonte, não inventem. Marquem a lacuna, expliquem o impacto e continuem com a melhor evidência disponível.

---

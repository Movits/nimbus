# NIMBUS: contexto verificado para o conselho de auditoria

Data do recorte: 21 de julho de 2026

Este documento prepara uma auditoria de pré-lançamento. Ele descreve o projeto, diferencia fontes atuais de documentos antigos e registra o que foi possível confirmar sem alterar a loja, o catálogo, a YouDraw ou o GitHub.

## 1. O que é a NIMBUS

A NIMBUS é uma marca brasileira de streetwear católico premium. A proposta combina fé tratada com reverência, design autoral, produção sob demanda no Brasil e uma identidade visual brasileira que cruza céu, nuvens, símbolos católicos e arquitetura modernista.

Posicionamento central:

- Católico sincero, sem ironizar ou banalizar a tradição.
- Streetwear premium, sem competir por preço baixo.
- Design como diferencial real, não somente uma frase religiosa aplicada a uma peça.
- Brasilidade por meio de referências como Aparecida, Cristo Redentor, Catedral de Brasília, azulejo e Oscar Niemeyer.
- Produção sem estoque, por print-on-demand.
- Impacto social: 10% do lucro de cada pedido é destinado a um projeto social escolhido pelo cliente no checkout.

A frase-manifesto consolidada na landing é **"Acima de tudo"**. O onboarding antigo também cita **"Vista o céu"**, mas essa referência deve ser tratada como possível linguagem anterior ou secundária até decisão explícita do dono.

## 2. Identidade aprovada

### Direção visual

- Mundo visual: céu, nuvens, concreto branco modernista, luz, espaço e sensação editorial.
- Personalidade: premium, sóbria, reverente, brasileira, contemporânea e limpa.
- Evitar: aparência de tema genérico, azul-marinho pesado em áreas muito grandes, excesso de selos de confiança, newsletter sem função, promessas operacionais não comprovadas e estética religiosa caricata.
- Fotografia de produto: pessoas reais ou verossímeis, elenco visual consistente, estampa fiel à arte original e à escala real da YouDraw.

### Paleta

| Papel | Cor |
|---|---|
| Navy primário | `#0b2360` |
| Ouro de acento | `#e9c46a` |
| Azul-céu | `#8fc1ea` |
| Céu claro | `#dcebfa` |
| Branco-nuvem | `#f7fbff` |
| Texto ink | `#1b2733` |
| Gradiente de nuvem | `#eaf3fd` para `#cfe3f7` |

Regra visual: fundos claros de céu ou nuvem, texto navy e ouro usado com moderação em destaques e CTAs.

### Tipografia e logo

- Títulos: Fraunces, com Georgia como fallback.
- Corpo e interface: Inter, com system-ui ou Arial como fallback.
- Logo: wordmark NIMBUS em forma de nuvem com auréola.
- Em fundo claro, usar a versão colorida/navy. Em fundo escuro, usar versão branca.
- Não deformar, recortar, girar, adicionar efeitos ou alterar cores do logo.
- Header e footer devem parecer partes do mesmo sistema visual.

### Tom de voz

- Sóbrio, humano e sincero.
- Reverente com a fé.
- Curto e específico.
- Sem clichê de marketing.
- Sem travessão em texto público.
- Sem prometer "troca fácil". A operação POD não sustenta essa promessa.
- Nomes públicos seguem `Arte | Peça`.

Rótulos de peça aprovados:

- Camiseta Premium
- Camiseta Oversized Premium
- Moletom Canguru
- Blusão Moletom
- Ecobag

## 3. Arquitetura do projeto

### Landing da marca

- URL: https://nimbuswear.com.br/
- Repositório público: https://github.com/Movits/nimbus
- Stack: Vite, React, TypeScript, React Three Fiber, drei e Three.js.
- Hospedagem: GitHub Pages por GitHub Actions.
- Fonte principal de copy, assets e projetos sociais: `src/data/content.ts`.
- Tokens e visual da landing: `src/styles/global.css`.
- Função: front-door de marca e narrativa. O CTA comercial leva à loja.

### Loja

- URL pública: https://loja.nimbuswear.com.br/
- Plataforma: Nuvemshop.
- Plano: Impulso.
- Tema confirmado no HTML público: Baires.
- Função: catálogo, carrinho, conta, checkout, pagamento e frete.
- Personalização: editor nativo do Baires, módulos da Nuvemshop e CSS avançado.
- Limite estrutural: não há fork completo do tema no plano atual.
- Fonte de verdade visual e comercial: a loja pública e o painel da Nuvemshop, não o GitHub.

### Produção

- Plataforma POD: YouDraw.
- A YouDraw produz sob demanda e está integrada à Nuvemshop.
- SKU e variantes reais são dados operacionais sensíveis. Uma auditoria não deve excluir, recriar ou renomear produtos sem uma etapa posterior aprovada.
- Fotos planas e mockups da YouDraw devem continuar disponíveis dentro da página do produto.
- Fotos lifestyle funcionam como capa de vitrine.

### Segundo cérebro

- Repositório privado: `Movits/nimbus-brain`.
- Pasta local: `C:\Users\rober\Nimbus\Nimbus brain`.
- Entradas principais: `estado.md`, `index.md`, `wiki/overview.md`, `wiki/concepts/identidade-visual.md` e `wiki/concepts/tom-de-voz.md`.
- Atenção: alguns documentos do brain refletem o estado de 15 de julho e estão atrás da loja atual.

## 4. Estado público confirmado da loja

### Páginas e estrutura

O HTML público respondeu com HTTP 200 e confirma:

- Home.
- Página geral de produtos.
- Coleções STREET, RELÍQUIA e NUVEM.
- Sobre a NIMBUS.
- Projetos Sociais.
- Contato.
- Conta/login e fluxo nativo da Nuvemshop.
- Tema Baires com Fraunces e Inter.
- Paleta-base configurada com navy, ouro, céu e branco-nuvem.
- Home com `Coleções NIMBUS`, manifesto `Fé com propósito. Design com presença.`, essenciais e três benefícios.
- Página de Projetos Sociais com os IDs `fazenda-esperanca`, `caritas-brasileira` e `pequeno-cotolengo`.
- Footer com os grupos Loja, Nimbus e Ajuda. Os três links de Ajuda atualmente levam a `/contato/`.
- Regra para esconder a atribuição da Nuvemshop presente no CSS público.

### Catálogo público em 21/07/2026

O sitemap público expõe **49 produtos ativos**, não 51.

| Coleção | Produtos |
|---|---:|
| STREET | 18 |
| RELÍQUIA | 28 |
| NUVEM | 3 |
| Total | 49 |

| Tipo de peça | Produtos |
|---|---:|
| Camiseta Premium | 19 |
| Camiseta Oversized Premium | 16 |
| Moletom Canguru | 8 |
| Blusão Moletom | 5 |
| Ecobag | 1 |

| Variantes de cor | Produtos |
|---|---:|
| Uma cor | 19 |
| Mais de uma cor | 30 |

Cores públicas encontradas: Preta, Branca e Off-White. A galeria contém entre 2 e 6 imagens por produto, com média aproximada de 4,6.

Famílias de arte atuais por coleção:

- STREET: Acima de Tudo Grafite, Anjo da Guarda Stencil, Aparecida Spray, Espírito Santo Spray, Fé Wildstyle, NIMBUS Wildstyle, Querubim Spray, Sagrado Coração Spray e São Miguel Vitorioso.
- RELÍQUIA: Acima de Tudo Gótico, Aparecida Barroca, Azulejo Sagrado, Brasão NIMBUS, Deus é Fiel, Fé Acima de Tudo, Monograma NIMBUS, Salmo 19, São Jorge Neobarroco, São Jorge Vintage e São Miguel Vintage.
- NUVEM: São Miguel Celeste.

### Comportamento aprovado de cards

- Produto com uma cor: não deve trocar para o mockup da YouDraw ao passar o mouse. A capa lifestyle permanece e pode ter somente um zoom discreto.
- Produto com mais de uma cor: pode trocar entre fotos lifestyle das cores reais cadastradas.
- A transição deve manter a fluidez padrão do tema, sem piscar.
- A página interna do produto continua mostrando as imagens reais importadas da YouDraw.

### Evidência responsiva local mais recente

O QA local de 21/07 cobre 1440, 645, 390 e 320 px. Nos quatro tamanhos registrados:

- Não houve overflow horizontal.
- O manifesto permaneceu contido.
- O footer ocupou a largura do viewport.
- O logo ficou à esquerda.
- No mobile, Menu e Carrinho aparecem agrupados à direita.

Arquivos de evidência: `nuvemshop/qa/2026-07-21-live-header-right-group/`.

Essa evidência é local e ainda não está versionada no GitHub.

## 5. Estado do GitHub e diferença para o estado local

### Repositório público `Movits/nimbus`

- Branch local: `main`.
- Branch remota: `origin/main`.
- Divergência após `git fetch --all --prune`: 0 commit local à frente e 0 atrás.
- HEAD local e remoto: `a4049547df966ea99f7127d101e4147fc48b215e`.
- Data do commit: 19/07/2026 às 16:10:05, fuso `-03:00`.
- Mensagem: `Fix hover swap for single-color cards using lifestyle image pattern`.
- Último deploy GitHub Pages desse SHA: concluído com sucesso.
- Build local atual: concluído com sucesso.
- Alerta de build: bundle JS principal com cerca de 983 kB antes de gzip e 274 kB após gzip. É candidato a auditoria de performance, não prova isolada de problema real.

Conclusão: **o checkout Git local está sincronizado com o último commit do GitHub, mas o GitHub não contém toda a rodada mais recente da loja**.

Estado do working tree em 21/07:

- 3 arquivos rastreados modificados.
- 163 entradas não rastreadas.
- A maior parte é composta por CSS recente da Nuvemshop, scripts de inspeção/publicação, temporários e evidências de QA.
- O candidato local mais recente para a publicação consolidada é `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`, atualizado em 21/07.
- O CSS público contém regras recentes de header, manifesto e footer, mas a Nuvemshop sanitiza o conteúdo. Por isso a igualdade byte a byte com o arquivo local não é um teste válido.

### Repositório privado `Movits/nimbus-brain`

- Branch local e remota sincronizadas, 0 à frente e 0 atrás.
- HEAD: `65d84e87184eb47341dfc908a1cde7c3b9a54275`.
- Último commit: 19/07/2026.
- O repositório está sincronizado, mas o conteúdo de `estado.md` ainda está datado de 15/07 e inclui decisões antigas. Sincronização Git não significa atualização factual.

## 6. Sinais que o conselho deve confirmar com prioridade

Estes são sinais de auditoria, não autorização para corrigir:

1. **Diferença de contagem:** documentos antigos falam em 51 produtos; o sitemap atual tem 49.
2. **Documentação de produção desatualizada:** `nuvemshop/instrucoes.md` aponta para 16/07; o onboarding cita 17/07; a rodada local mais recente está em arquivos de 20/07 e 21/07.
3. **Descrição de produto:** uma busca automatizada no HTML das 49 páginas não encontrou a frase aprovada `Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.` nem sinal explícito de tabela de medidas. O conselho deve confirmar na interface renderizada e no painel.
4. **Metadados inconsistentes:** pelo menos quatro metadescrições usam `Camiseta` para outra peça:
   - São Jorge Vintage | Moletom Canguru.
   - São Miguel Celeste | Moletom Canguru.
   - São Miguel Vitorioso | Moletom Canguru.
   - NIMBUS Wildstyle | Ecobag.
5. **SEO genérico:** home e página de produtos usam títulos e descrições automáticas como `Loja online de Nimbus` e `Temos nuvem, relÍquia e mais`.
6. **Contato sem metadescrição:** a página pública de contato não apresenta uma descrição SEO.
7. **Links de ajuda:** Trocas e devoluções, Envios e prazos e Fale com a NIMBUS levam à mesma página de contato. Isso funciona, mas pode não responder às dúvidas antes do contato.
8. **Performance da landing:** o build passa, mas o chunk principal merece medição real de Core Web Vitals, principalmente em celular.
9. **Fidelidade das fotos lifestyle:** verificar arte, texto, escala e cor contra YouDraw e arte original, sem reprovar automaticamente detalhe ilegível em miniatura.

## 7. Hierarquia das fontes para a auditoria

Quando houver conflito, usar esta ordem:

1. Loja pública renderizada e HTML público atual.
2. Painel da Nuvemshop em modo somente leitura.
3. Produto e variante atuais na YouDraw em modo somente leitura.
4. CSS local mais recente e evidências de QA de 20 e 21/07.
5. Repositório público `Movits/nimbus` para landing e histórico versionado.
6. Brain privado para contexto e decisões, sempre comparado com as fontes atuais.
7. Documentos antigos e onboarding como histórico, não como verdade automática.

## 8. Decisões que a auditoria não deve desfazer

- Landing no domínio raiz e loja em `loja.nimbuswear.com.br`.
- Nuvemshop, plano Impulso e tema Baires.
- YouDraw como produção POD.
- Coleções STREET, RELÍQUIA e NUVEM.
- Identidade céu, nuvem, navy, ouro, Fraunces e Inter.
- Formato `Arte | Peça`.
- 10% do lucro destinado ao projeto escolhido pelo cliente.
- Fotos lifestyle na capa e mockups da YouDraw dentro do produto.
- Hover sem troca nos mono-cor e troca lifestyle de cor nos multicoloridos.
- Proibição de prometer `troca fácil`.

## 9. Escopo correto da próxima etapa

O conselho deve produzir uma auditoria baseada em evidências e um plano priorizado. Ele não deve publicar CSS, excluir produto, alterar SKU, testar uma compra real, enviar formulário, mudar preço, mexer em pagamento, domínio ou integração YouDraw.

A saída esperada é um parecer de lançamento e um prompt executivo para o Codex implementar somente depois de nova aprovação do dono.

# Ata do Conselho e auditoria pré-lançamento da NIMBUS

Data da reunião: 21 de julho de 2026
Recorte de verificação: até 21:20, horário de Brasília
Escopo: leitura e análise. Nenhuma alteração foi publicada na Nuvemshop, YouDraw, landing ou GitHub.

## 1. Veredito executivo

**GO CONDICIONAL.**

A identidade da marca, a arquitetura Nuvemshop + YouDraw e a base visual estão suficientemente maduras para justificar um lançamento controlado. A loja, porém, ainda não deve receber lançamento comercial irrestrito nem mídia paga em escala.

O conselho aprovou por unanimidade uma sequência de dez gates. O soft launch só começa depois de G1–G7, G9 e G10. G8 é o próprio piloto mensurado.

1. **G1, consumo, dados e fornecedor:** identificação pública do vendedor; páginas próprias de trocas/arrependimento, envios/prazos, privacidade/cookies e atendimento; matriz LGPD; revisão documentada do contrato YouDraw.
2. **G2, dados mestres:** conciliar 49 produtos e 386 variantes entre Nuvemshop e YouDraw, sem SKU duplicado ou divergência de arte, peça, cor, tamanho, preço e status.
3. **G3, pedido controlado:** executar um pedido mono-cor e um multicolorido de ponta a ponta, somente após autorização explícita caso exista custo ou fabricação real.
4. **G4, informação de compra:** completar os 49 produtos. Os 48 vestíveis precisam de material, modelagem e medidas; a Ecobag, de material, dimensões, capacidade e alças. Todos precisam de prazo POD, política aplicável e frase social.
5. **G5, impacto social:** definir publicamente a fórmula dos 10% do lucro, registrar a escolha por pedido, guardar comprovantes e publicar prestação de contas trimestral.
6. **G6, economia unitária:** CM1 mínima de 25% e R$45 nos produtos-herói, caixa reservado de R$7.500 e nenhuma acumulação promocional não calculada.
7. **G7, técnica e acessibilidade:** uma fonte versionada de CSS/hover, backup e rollback em menos de dez minutos, QA 49/49 nos cinco viewports e testes essenciais de teclado, foco, contraste, movimento reduzido e performance.
8. **G8, soft launch:** 14 dias, 6–9 produtos-herói, 60 prospects qualificados, pelo menos dez pedidos pagos, analytics validado, entrevistas e critérios objetivos de pausa e saída.
9. **G9, continuidade:** responsáveis e substitutos, runbook, especialista Nuvemshop de contingência, congelamento de sete dias e gatilhos de apoio operacional.
10. **G10, propriedade intelectual:** cadeia de direitos de artes, fotos e materiais sociais; substituição de ativos sem prova; busca e protocolo da marca NIMBUS nas classes pertinentes.

## 2. Mapa de fontes e frescor

| Fonte | Data ou versão observada | O que representa | Confiança | Conflitos ou limites |
|---|---|---|---|---|
| Loja pública `loja.nimbuswear.com.br` | HTTP 200; cache indicava última modificação em 21/07/2026 | Experiência e HTML comercial atual | Alta para HTML público; média para estados ocultos | HTML contém textos de componentes não necessariamente visíveis; painel não foi aberto nesta reunião |
| Sitemap e 49 páginas de produto | 21/07/2026 | Catálogo ativo, URLs, preços, variantes e metadados públicos | Alta | Não comprova SKU interno nem sincronização YouDraw |
| QA responsivo local | `nuvemshop/qa/2026-07-21-live-header-right-group/` | Screenshots e métricas em 1440, 645, 390 e 320 px | Alta para o momento da captura | Falta 1024 × 768; não cobre todas as páginas internas |
| CSS público extraído | 21/07/2026, cerca de 46,3 mil caracteres | Camada efetivamente servida pela Nuvemshop | Alta | A plataforma sanitiza CSS; igualdade byte a byte não é válida |
| CSS local consolidado | `css-nimbus-publicacao-compacta-2026-07-20.css`, atualizado em 21/07 | Melhor candidato local de fonte | Média-alta | 49.198 bytes, 993 `!important` e 41 `nth-child`; ainda não versionado |
| Git local e `origin/main` | SHA `a4049547df966ea99f7127d101e4147fc48b215e`, 19/07/2026 | Landing versionada | Alta | Loja recente não está inteiramente no GitHub |
| Working tree | 21/07/2026 | Rodada local mais recente | Alta | 3 arquivos rastreados modificados e 164 entradas não rastreadas |
| `live-verification.json` | 19/07/2026 | Verificação antiga de capa e contagem de imagens | Média-baixa para estado atual | Resultado 19/49 usa expectativa antiga e não valida pixels |
| Brain privado | Git sincronizado no SHA `65d84e...`; `estado.md` de 15/07 | Decisões e histórico | Média | Conteúdo factual está atrás da loja atual |
| Painel Nuvemshop e YouDraw | Não acessados nesta reunião | SKU, custo, configuração e integração | Lacuna crítica | Necessários para G1–G3 e G6 |
| PageSpeed Insights | Tentativa em 21/07 retornou HTTP 429 | Medição de laboratório | Sem resultado | Não há nota atual de CWV; bundle grande não substitui medição |

Fontes externas de mercado e conformidade usadas no conselho:

- O IBGE registra 100,2 milhões de pessoas católicas com 10 anos ou mais no Censo 2022: [IBGE](https://educa.ibge.gov.br/jovens/materias-especiais/22703-censo-2022-numero-de-catolicos-no-brasil-em-queda.html).
- Moda movimentou R$2,9 bilhões na Nuvemshop em 2025, com ticket médio de R$260: [Nuvemshop](https://www.nuvemshop.com.br/vender/roupas).
- O Decreto 7.962/2013 exige informação clara, atendimento e meio adequado para arrependimento no comércio eletrônico: [Planalto](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm).
- A LGPD rege os tratamentos de dados pessoais da operação: [Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).
- O INPI recomenda busca de anterioridade e registro para exclusividade de marca: [INPI](https://www.gov.br/inpi/pt-br/assuntos/marcas).

## 3. Rodada 1: análises independentes

### Ricardo Tanaka, CFO / Investidor

A operação POD reduz estoque e permite gerar caixa desde o primeiro pedido, mas a margem ainda é uma hipótese. Preços públicos vão de R$49,90 na Ecobag a R$299,90 no Moletom Canguru. Custos internos antigos variam de R$59,28 a R$122,65 e não foram reconciliados com cada configuração atual da YouDraw. Uma Camiseta Premium de R$149,90 com 15% de desconto cai para R$127,42; usando R$73,20 de produção, sobram R$54,22 antes de taxas, imposto, frete subsidiado, reembolso e impacto social.

Sem CAC, conversão, taxa efetiva, tributação, reimpressão e recompra, LTV deve ser tratado como a contribuição da primeira compra. O viés conservador do CFO está ativo, mas o risco de capital parado é baixo graças ao POD.

**Estratégias**

1. Planilha por produto e variante com custo real e CM1.
2. Bloquear variante com CM1 menor que 25% ou R$45 nos heróis.
3. Proibir acumulação de cupom, bundle e frete grátis sem recálculo.
4. Piloto de 30 pedidos, ticket-alvo de R$190 e CAC máximo de R$45.
5. Teto de R$5.000 no primeiro mês e caixa mínimo de R$7.500.

**Riscos:** custo de estampa reduzir margem; descontos acumulados; catálogo dispersar investimento; reimpressões consumirem caixa.
**Perguntas:** custo final por variante? Promoções acumulam? Qual fórmula define os 10%?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “Há margem potencial, mas lançar sem custo real por SKU transforma lucro aparente em aposta.”

### Marina Duarte, CMO / Marketing

A história é diferenciada: fé reverente, design autoral, brasilidade, POD local e impacto social. O público primário não é todo católico, mas pessoas de 18 a 34 anos, urbanas, ligadas à fé, moda e cultura. Público secundário: compradores de presentes de 25 a 44 anos. Posicionamento sugerido: “Streetwear católico brasileiro para quem quer vestir a fé com design autoral, sem clichê.”

O desequilíbrio entre RELÍQUIA, 28 produtos, STREET, 18, e NUVEM, 3, pode fazer a última parecer incompleta. A comunicação deve destacar 6–9 produtos-herói e histórias distintas: STREET leva a fé para a rua; RELÍQUIA traduz símbolos que atravessam o tempo; NUVEM une contemplação, céu e arquitetura.

**Estratégias**

1. Lançamento editorial com heróis representando as três coleções.
2. Entrevistar 10–15 pessoas e testar três promessas.
3. Teste de aquisição de 10–14 dias, começando com até R$1.200.
4. Trabalhar 8–12 microcriadores de 5 mil a 50 mil seguidores.
5. Corrigir medidas, prazo, troca e impacto antes de levar tráfego.

**Riscos:** preço premium sem prova; 49 opções diluírem escolha; promessa social vaga; mídia antes de margem.
**Perguntas:** margem real? Quais heróis têm amostra aprovada? O checkout registra a escolha social?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A marca tem história forte, mas precisa provar aquisição, qualidade e confiança antes de escalar.”

### André Falcão, CTO / Engenharia

A arquitetura é adequada ao estágio: landing própria e loja transacional terceirizada. O risco está na camada de CSS. O consolidado local tem 49.198 bytes, 993 `!important`, 41 seletores `nth-child` e dependência do DOM do Baires. O CSS público contém header, footer, manifesto, modais e hover, mas não é uma cópia fiel do local devido à sanitização.

Há divergência na classificação do hover: relatório com 19 mono e 30 multi; mapa antigo com 22 sem troca e 27 com troca; gerador esperando 20 IDs mono-cor. O validador completo não concluiu. A landing também carrega um bundle JS principal perto de 983 kB antes de gzip e precisa de medição mobile real.

**Estratégias**

1. Versionar fonte legível, saída gerada, extração pública e rollback.
2. Derivar hover das cores reais, com falha explícita quando o catálogo mudar.
3. QA automatizado em cinco viewports e páginas internas.
4. Medir LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1; usar fallback 2D se necessário.
5. Ensaiar rollback em menos de dez minutos.

**Riscos:** DOM do Baires mudar; reimportação desatualizar o mapa; loja recente não estar no Git; 3D pesar em celular.
**Perguntas:** qual é a fonte oficial do CSS? Há contagem de cores estável? A marca aceita fallback 2D?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A arquitetura aguenta o lançamento, mas CSS sem fonte única e testes incompletos tornam qualquer ajuste uma regressão provável.”

### Beatriz Rocha, CPO / Produto

O trabalho do produto é permitir que um católico jovem use sua identidade religiosa com estética contemporânea, autoria brasileira e sem caricatura. Essa proposta pode ocupar um espaço entre roupa religiosa genérica e streetwear sem vínculo espiritual, mas ainda não existe validação suficiente de disposição a pagar e tolerância aos prazos POD.

A jornada crítica é coleção → lifestyle → produto → variante → carrinho → projeto → checkout. A loja tem 49 produtos, mas o lançamento deve concentrar aprendizado em 6–9 heróis. Medida, caimento, prazo e fidelidade entre lifestyle e peça real são os pontos de decisão.

**Estratégias**

1. Selecionar heróis sem esconder o restante do catálogo.
2. Auditar a jornada em 390 e 1440 px até antes da confirmação.
3. Padronizar conteúdo decisório nos 49 produtos.
4. Instrumentar o funil antes do soft launch.
5. Rodar 14 dias com entrevistas de compra e abandono.

**Riscos:** catálogo dispersar tráfego; lifestyle quebrar confiança; promessa social não funcionar; lançar sem eventos.
**Perguntas:** o público aceita preço e prazo? Quais heróis sustentam a reputação? O cliente acha medidas sem ajuda?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A proposta entrega identidade clara, mas lançamento exige provar confiança, ajuste da peça e integridade do pedido.”

### Yuri Almeida, Head de Design

A base visual é reconhecível e coerente. Navy, céu, branco e ouro formam um sistema próprio; Fraunces dá caráter editorial e Inter organiza a interface. No QA recente não houve overflow horizontal, o logo permaneceu à esquerda e Menu/Carrinho ficaram agrupados à direita.

Há desequilíbrios não bloqueadores: navegação e cards discretos diante do manifesto; recorte das coleções mais apertado em 320 px; ausência do viewport 1024. Os modais sociais têm boa composição, mas o HTML `:target` não prova captura de foco, Escape ou retorno ao acionador. Texto `#5b6b85` sobre `#dcebfa` fica próximo ou abaixo do contraste AA para 12 px.

**Estratégias**

1. Congelar o baseline visual e comparar os cinco viewports.
2. Criar bloco de confiança em cada produto.
3. Corrigir os modais para teclado e foco.
4. Montar matriz visual YouDraw × lifestyle para 49 produtos.
5. Reequilibrar legibilidade de navegação e cards.

**Riscos:** lifestyle infiel; CSS específico quebrar; ausência de medidas reduzir confiança; barreiras de acessibilidade.
**Perguntas:** 49 artes foram comparadas? Informações decisórias estão fáceis? Modais funcionam com teclado?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A marca já tem presença; aprovo quando a confiança de compra e a acessibilidade forem verificadas na loja real.”

### Clara Nunes, Copywriter Chefe

A marca cabe em uma frase: streetwear católico premium, autoral e brasileiro. `Acima de tudo` funciona como manifesto, desde que venha acompanhado por explicação concreta. A landing tem boa hierarquia verbal; a loja ainda não prova o premium em cada página.

O HTML das 49 páginas não apresentou tabela de medidas nem a frase social aprovada. Quatro metadescrições chamam moletom ou Ecobag de camiseta. Home, Produtos e coleções usam SEO genérico. As maiores objeções são fidelidade da peça, tamanho, material, prazo POD, troca e comprovação da doação.

**Estratégias**

1. Cinco blocos por descrição: arte, peça, medidas, produção/prazo e impacto.
2. Corrigir quatro metadescrições e metadados institucionais.
3. Dar título específico às três coleções.
4. Criar páginas de Ajuda próprias.
5. Colocar provas perto do botão de compra.

**Riscos:** usar premium sem prova; imagem divergente; conteúdo duplicado; impacto vago.
**Perguntas:** composição e gramatura? Fórmula dos 10%? O checkout registra o projeto?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A marca tem voz própria, mas ainda não prova o premium nem responde às objeções decisivas de compra.”

### Paulo Meirelles, CHRO / Recursos Humanos

A operação reúne 49 produtos, duas plataformas, landing, atendimento, marketing, QA e impacto social. O POD reduz estoque, mas não elimina conciliação, exceções, suporte e qualidade. Não há matriz formal de responsáveis, escala de atendimento ou runbook.

A NIMBUS parece depender demais do fundador, que acumula direção criativa, e-commerce, técnica, compras, atendimento, marketing e aprovação. Não se recomenda equipe fixa antes de validar vendas; recomenda-se contingência sob demanda e gatilhos de contratação.

**Estratégias**

1. Matriz de responsáveis para cinco fluxos críticos.
2. Freeze de sete dias e no máximo três tarefas simultâneas.
3. Especialista Nuvemshop sob demanda, 10–15 horas/mês.
4. Atendimento em dois blocos diários, SLA de um dia útil.
5. Apoio ao atingir 15 chamados/semana ou 30 pedidos/mês.

**Riscos:** ausência do fundador paralisar a operação; mudanças contínuas; suporte sem SLA; contratar cedo ou tarde demais.
**Perguntas:** horas semanais disponíveis? Quem cobre 48 horas? Qual orçamento mensal?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “O POD reduz carga, mas lançar sem donos, rotina e contingência concentra risco demais no fundador.”

### Sofia Carvalho, VP de Vendas

A tabela de preços é simples: Ecobag R$49,90, Camiseta Premium R$149,90, Oversized R$179,90, Blusão R$269,90 e Canguru R$299,90. Isso facilita comunicação. Faltam vendas, tráfego, CAC, margem, prazo real e pedido integrado concluído.

O catálogo inteiro pode permanecer comprável, mas a oferta ativa deve ter seis produtos-herói. Self-service é o canal principal; Instagram, TikTok, microcriadores e a rede qualificada do fundador geram demanda. Atendimento humano resgata dúvidas.

**Estratégias**

1. Abordar 60 prospects qualificados na primeira semana.
2. Concentrar mídia e conteúdo em seis heróis.
3. Medir produto, carrinho, checkout e compra.
4. Manter preços até conhecer CM1.
5. Criar prova social com os primeiros dez compradores.

**Riscos:** margem insuficiente; catálogo disperso; falta de medidas; primeira falha operacional destruir confiança.
**Perguntas:** custo total por peça? Analytics existe? Quem são os 60 prospects?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A marca está vendável, mas ainda não provou margem, funil nem um pedido completo.”

### Dra. Renata Lins, Jurídico / Compliance

A loja pública não apresentou identificação ostensiva do vendedor com nome empresarial, CPF/CNPJ e endereço. Trocas e Envios levam ao Contato. O Decreto 7.962/2013 exige identificação, condições claras, atendimento e meio explícito de arrependimento. POD padronizado não é automaticamente produto personalizado capaz de afastar o direito de sete dias.

A promessa de 10% do lucro é vinculante e não define fórmula, data, devoluções ou critérios para outro projeto. Cookies têm apenas “Entendi”; a cadeia de dados, contratos, direitos autorais, imagens sociais e marca precisa ser documentada. O parecer é preliminar e não substitui advogado ou contador.

**Estratégias**

1. Publicar identificação e políticas antes de venda pública.
2. Revisar contrato YouDraw e logística reversa.
3. Formalizar fórmula e prestação social trimestral.
4. Dossiê de direitos e busca/protocolo INPI classes 25 e 35.
5. Inventário LGPD e gestão adequada de cookies.

**Riscos:** descumprimento do CDC; reembolso sem ressarcimento do POD; oferta social ambígua; ativos sem autorização.
**Perguntas:** quem vende e emite nota? YouDraw absorve quais eventos? Há cessões/licenças de 49 artes e fotos?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A marca pode lançar, mas não antes de fechar arrependimento, políticas, prova social e cadeia de direitos.”

### Jorge Batista, COO / Operações

A varredura pública encontrou 49 produtos, 386 variantes e preços válidos. A classificação retornou 29 produtos multicoloridos, 19 mono-cor e uma Ecobag sem atributo Cor, divergindo do relatório 30/19. São Jorge Vintage | Moletom Canguru e São Jorge Neobarroco | Moletom Canguru apontam as variantes preta e branca para a mesma imagem pública.

Isso prova associação visual problemática, não SKU incorreto. Sem painel e YouDraw, permanecem lacunas de SKU, gatilho de produção, rastreio, defeito, cancelamento e reembolso. O POD desloca risco do estoque para fornecedor e suporte.

**Estratégias**

1. Matriz das 386 variantes entre as duas plataformas.
2. Dois pedidos controlados, um mono e um multi.
3. Publicar medidas, prazos, políticas e cuidados.
4. Quadro diário de estados e exceções.
5. SOP mensal da doação.

**Riscos:** variante errada; pedido não chegar à YouDraw; custo oculto; doação não rastreável.
**Perguntas:** existe sandbox? Onde fica a escolha social? Qual é o SLA YouDraw?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A vitrine vende, mas a operação ainda não provou que cada pedido certo chega à produção certa.”

### Larissa Fontes, Head de Dados / Analytics

Há mercado suficiente para um teste, não para afirmar demanda validada. O IBGE registra 100,2 milhões de católicos com 10 anos ou mais. A Nuvemshop informa 94 milhões de consumidores online no Brasil em 2025, R$2,9 bilhões de moda na plataforma e ticket médio de R$260. O nicho tem concorrentes, portanto existe, mas não está vazio.

O HTML público mostrou `ga4_measurement_id: ""`; não foi observado GTM, Meta Pixel, Clarity ou analytics na landing. A Nuvemshop tem estatísticas internas, mas não existe atribuição unificada observável. TAM/SAM/SOM devem permanecer cenários, não previsões.

**Estratégias**

1. GA4 único e UTMs, validando eventos de e-commerce.
2. Reconciliação diária de pedido, custo, impacto e status.
3. Medir conversão, CM1 e pedido perfeito.
4. Testar coleção antes de SKU.
5. Agregar famílias de arte para evitar falsos vencedores.

**Riscos:** vender sem aprender; economia desconhecida; catálogo fragmentado; dados mestres inconsistentes.
**Perguntas:** margem por variante? Qual audiência própria? YouDraw exporta status e SKU?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “Lançar sem rastrear margem, conversão e pedido perfeito transforma aprendizado em opinião.”

### Tiago Freitas, Head de Sucesso do Cliente

Os links de Ajuda levam ao Contato; não há evidência pública de tabelas de medidas, conteúdo transacional nem pedido Nuvemshop → YouDraw → rastreamento. Em POD, silêncio, prazo confuso e tamanho errado viram suporte caro rapidamente.

O cliente precisa receber cinco marcos verificáveis: pagamento, entrada na YouDraw, produção, postagem e exceção. O projeto escolhido também deve reaparecer na confirmação. Não há evidência atual de SLA, responsável ou medição de CSAT.

**Estratégias**

1. Central de Ajuda com páginas distintas.
2. Validar os cinco marcos transacionais.
3. Responsável, caixa única e SLA de um dia útil.
4. Pedido piloto somente após autorização.
5. CSAT, pós-entrega D+7 e recompra em 90 dias.

**Riscos:** confundir produção e frete; tamanho errado; SKU não sincronizar; suporte depender do fundador.
**Perguntas:** quais status sincronizam? Qual prazo real? Qual política é sustentável?
**Voto inicial:** ⚠️ Aprovar com ressalvas.
**Justificativa:** “A vitrine está pronta; o lançamento ainda precisa provar que acompanha o cliente até a entrega.”

## 4. Debate até consenso

### Rodada 1

Placar: **0 aprovações, 12 aprovações com ressalvas, 0 rejeições.**

Não houve rejeição da marca ou da arquitetura. As ressalvas convergiram em integridade operacional, informação ao consumidor, economia unitária, acessibilidade, dados e propriedade intelectual.

### Rodada 2

Foi proposta uma resolução com oito gates. Placar: **6 aprovações e 6 aprovações com ressalvas.**

**Integridade do registro:** a apuração intermediária preservou o placar agregado, mas não a divisão nominal entre os dois grupos. Para não atribuir votos sem evidência, a ata registra abaixo as seis condições debatidas e, na rodada final, o voto nominal dos doze conselheiros.

As seis novas condições foram:

- incluir a Ecobag no padrão de conteúdo;
- tornar acessibilidade um gate anterior ao soft launch;
- criar continuidade operacional e reduzir dependência do fundador;
- definir prospects, pedidos e métricas mínimas;
- fechar contrato YouDraw, propriedade intelectual e INPI;
- validar analytics, fórmulas e critérios de saída.

### Rodada 3

Todas as emendas foram incorporadas nos dez gates da seção 1.

Placar final: **12 aprovações, 0 ressalvas, 0 rejeições.**

Votos finais nominais:

- Ricardo Tanaka: ✅ Aprovar;
- Marina Duarte: ✅ Aprovar;
- André Falcão: ✅ Aprovar;
- Beatriz Rocha: ✅ Aprovar;
- Yuri Almeida: ✅ Aprovar;
- Clara Nunes: ✅ Aprovar;
- Paulo Meirelles: ✅ Aprovar;
- Sofia Carvalho: ✅ Aprovar;
- Dra. Renata Lins: ✅ Aprovar;
- Jorge Batista: ✅ Aprovar;
- Larissa Fontes: ✅ Aprovar;
- Tiago Freitas: ✅ Aprovar.

Consenso real: aprovar a execução do plano e o posterior soft launch somente após evidenciar os gates. O conselho não declarou a loja pronta para tráfego irrestrito hoje.

## 5. Síntese da presidente Helena Vasquez

### Placar e nota de prontidão

- Resolução: **12–0, aprovada por consenso pleno**.
- Prontidão visual e de marca: **82/100**.
- Prontidão técnica observável: **68/100**.
- Prontidão comercial e operacional: **48/100**.
- Prontidão consolidada para lançamento irrestrito: **62/100**.

### Consensos reais

1. A marca tem diferenciação e presença suficientes para ir ao mercado.
2. Nuvemshop, Baires, YouDraw e a separação landing/loja devem permanecer.
3. O maior risco não é estética; é prometer uma compra correta sem conciliar variantes, políticas, margem e pós-venda.
4. O catálogo pode manter 49 produtos, mas aquisição e merchandising devem focar 6–9 heróis.
5. O primeiro lançamento é um experimento controlado, não uma escala.

### Divergências relevantes resolvidas

- Marketing queria teste rápido; Jurídico e Operações exigiam controles prévios. Solução: gates obrigatórios antes do piloto.
- Vendas queria dez pedidos; Dados alertou para amostras pequenas. Solução: dez pedidos validam operação, mas conversão só decide com 2.000 sessões e pedido perfeito com 30 entregas.
- CFO aceitava CAC de R$45; Marketing e Vendas queriam proporção da margem. Solução: alvo de 30% da contribuição, teto duro no menor entre R$45 e 50% da contribuição.
- Engenharia não quer migração; Design exige acessibilidade. Solução: manter a plataforma e elevar G7 com testes objetivos.

### Riscos que exigem atenção

- Falha de SKU/variante ou imagem de cor incorreta.
- Direito de arrependimento e custo POD sem acordo de ressarcimento.
- Promessa social ambígua ou sem comprovação.
- CSS difícil de manter e documentação de produção desatualizada.
- Imagem lifestyle diferente da arte real.
- Dependência operacional do fundador.

### Segunda-feira de manhã

1. Criar uma planilha mestre das 386 variantes.
2. Solicitar custos e contrato atualizados da YouDraw.
3. Separar documentos de vendedor, políticas e dados.
4. Selecionar 6–9 produtos-herói com base em fidelidade e margem.
5. Congelar mudanças visuais até organizar fonte, backup e rollback.

## 6. Achados priorizados

| ID | Severidade | Área | Evidência | Recomendação exata | Superfície | Regressão/dependência |
|---|---|---|---|---|---|---|
| NIM-B01 | Bloqueador | Jurídico | Identificação pública do vendedor e políticas próprias não foram encontradas | Cumprir G1 antes de venda pública | Conteúdo/Nuvemshop | Advogado/contador; dados corretos |
| NIM-B02 | Bloqueador | Operação | Não há prova de pedido completo Nuvemshop→YouDraw | Dois pedidos controlados, com autorização de custo | Nuvemshop/YouDraw | Pagamento, fabricação e cancelamento |
| NIM-B03 | Bloqueador | Catálogo | 386 variantes sem conciliação autenticada; contagens 29/19/1 divergem de 30/19 | Matriz 100%, zero SKU duplicado ou divergente | Produto/YouDraw | Exportações das plataformas |
| NIM-A01 | Alta | Produto | Variantes preta/branca de dois moletons apontam para a mesma imagem pública | Corrigir associação após conferir arte e SKU | Produto/YouDraw | Pode alterar hover e galeria |
| NIM-A02 | Alta | Conteúdo | 49 descrições sem sinal explícito de tabela; 48 vestíveis precisam de medidas | Aplicar padrão G4 | Produto/conteúdo | Conferir dados YouDraw |
| NIM-A03 | Alta | Impacto | “10% do lucro” sem fórmula, calendário e prova pública | Cumprir G5 | Conteúdo/operação | Financeiro/jurídico |
| NIM-A04 | Alta | Imagem | Auditorias antigas registram artes/escala divergentes e ainda não existe matriz atual 49/49 | Comparação pixel/arte por produto | Produto/YouDraw | Não remover mockups reais |
| NIM-A05 | Alta | Técnica | CSS local não versionado, 993 `!important`, 41 `nth-child`, classificação hover conflitante | Fonte única, geração, QA e rollback | CSS/GitHub | DOM Baires, sanitização |
| NIM-A06 | Alta | Acessibilidade | Modal `:target` não comprova Escape, foco preso ou retorno; contraste pequeno limítrofe | Testar e corrigir conforme G7 | Página/CSS | Limite de JS no plano |
| NIM-A07 | Alta | Direitos | Cadeia autoral, imagem, projetos e marca não foi auditada | Cumprir G10 | Jurídico/arquivos | Pode exigir substituição de ativos |
| NIM-M01 | Média | SEO | Home e Produtos genéricos; Contato sem description; quatro descrições chamam peça errada de camiseta | Metadados específicos | Editor/conteúdo | Cuidado com caracteres e canonical |
| NIM-M02 | Média | Ajuda | Três links distintos levam a Contato | Páginas próprias ou âncoras realmente úteis | Nuvemshop | Atualizar footer após criar páginas |
| NIM-M03 | Média | Dados | `ga4_measurement_id` vazio; atribuição unificada não observada | GA4 + UTMs + DebugView | Landing/Nuvemshop | Consentimento/cookies |
| NIM-M04 | Média | Catálogo | Filtros mostram `Nimbus (42)`, tamanhos em 48 e `Bege (1)` | Corrigir marca/atributos após matriz | Produto | Não editar sem export e backup |
| NIM-M05 | Média | Ordenação | Opções “mais novo” e “mais antigo” continuam no HTML público | Remover somente após confirmar seletor e UX | Editor/CSS | Não quebrar outros filtros |
| NIM-M06 | Média | Performance | Bundle principal da landing ~983 kB; PSI sem resultado | Medir mobile real e preparar fallback 2D | Landing/GitHub | Preservar identidade visual |
| NIM-M07 | Média | QA | Falta 1024 × 768 e cobertura recente de páginas internas | Completar matriz de regressão | QA | Exige ambiente reproduzível |
| NIM-BX1 | Baixa/confirmar | HTML | `-0% OFF`, `R$0,00` e “Frete grátis” aparecem no HTML de componentes | Confirmar visibilidade antes de alterar | Nuvemshop | Não tratar template oculto como bug |

## 7. Auditoria de catálogo

### Contagem confirmada

| Coleção | Produtos |
|---|---:|
| STREET | 18 |
| RELÍQUIA | 28 |
| NUVEM | 3 |
| **Total** | **49** |

| Peça | Produtos |
|---|---:|
| Camiseta Premium | 19 |
| Camiseta Oversized Premium | 16 |
| Moletom Canguru | 8 |
| Blusão Moletom | 5 |
| Ecobag | 1 |

- O inventário recente não encontrou título fora de `Arte | Peça` nem duplicata exata.
- As coleções somam os 49 produtos; não há produto público sem uma das três coleções na base observada.
- A varredura operacional encontrou 386 variantes, 29 produtos multicoloridos, 19 mono-cor e uma Ecobag sem atributo Cor.
- O filtro público exibe `Bege (1)` embora a documentação cite Preta, Branca e Off-White. Também exibe `Nimbus (42)`, não 49.
- Não há tabela de medidas detectável nas descrições. As 48 peças vestíveis precisam de dados específicos da peça.
- Quatro metadescrições incorretas: São Jorge Vintage | Moletom Canguru; São Miguel Celeste | Moletom Canguru; São Miguel Vitorioso | Moletom Canguru; NIMBUS Wildstyle | Ecobag.
- São Jorge Vintage | Moletom Canguru e São Jorge Neobarroco | Moletom Canguru usam a mesma imagem pública para duas cores.
- A classificação de hover não está reproduzível. Não se conclui que o comportamento visual esteja quebrado em todos os cards; conclui-se que o mapa automatizado não é fonte confiável.
- Relacionados, destaques e ordem por família de arte ainda precisam de inspeção no painel. A home mostra uma seleção de essenciais, mas não existe prova de regra sustentável após reimportação.

## 8. Auditoria visual e UX

### Desktop

| Área | Estado | Decisão |
|---|---|---|
| Header | Logo à esquerda; navegação completa e utilidades à direita | Preservar; validar 1024 px |
| Coleções | Três imagens simultâneas, leitura clara | Preservar |
| Manifesto | Boa presença editorial e conteúdo contido | Preservar |
| Cards e hover | Visual agradável; mapa mono/multi inconsistente | Revalidar 49/49 antes de alterar |
| Produto | Imagens existem, mas informação decisória está incompleta | G4 |
| Projetos/modais | Visual bom; acessibilidade não comprovada | G7 |
| Conta/login | Explicação customizada existe no CSS | Smoke test visual e teclado |
| Contato | Formulário e copy customizada | Criar políticas e Ajuda próprias |
| Carrinho | Fluxo nativo | Testar até antes da confirmação |
| Footer | Editorial, marca e copyright visíveis; atribuição escondida | Preservar e validar links |

### Mobile

| Área | Estado | Decisão |
|---|---|---|
| Header | Logo à esquerda, Menu/Carrinho à direita; sem overflow nos QA | Preservar; testar 320/390/645 após qualquer CSS |
| Busca | Linha abaixo do header, legível | Preservar |
| Coleções | Carrossel ocupa a largura útil; recorte apertado em 320 | Validar arte e legibilidade, não redesenhar sem evidência |
| Manifesto | Contido em 645/390/320 | Preservar |
| Footer | Sem sobreposição no QA, mas muito alto em 320 px | Refinar depois dos bloqueadores |
| Modais | Layout móvel existe; foco e Escape não comprovados | G7 |

## 9. Auditoria técnica

- **HTML e semântica:** a landing tem modal com foco e ARIA; a loja usa `role="dialog"`, mas o mecanismo `:target` não prova comportamento completo de diálogo.
- **CSS:** alta especificidade e dependência de posição. A Nuvemshop sanitiza custom properties. Editar o minificado diretamente é proibido.
- **Responsividade:** zero overflow em 1440/645/390/320 na evidência; falta 1024 e páginas internas.
- **Acessibilidade:** reduced-motion existe no local, mas sua presença pública é incerta; contraste e foco precisam de teste.
- **Performance:** build passa; bundle principal da landing merece divisão ou fallback, mas não há CWV atual.
- **SEO:** canonical observado; títulos/descriptions são genéricos ou incorretos em páginas citadas.
- **Segurança observável:** a loja responde com HSTS, CSP de `frame-ancestors`, `nosniff` e upgrade de conteúdo inseguro. Isso não substitui revisão LGPD e de terceiros.
- **Manutenibilidade:** `nuvemshop/instrucoes.md` ainda descreve 16/07 como produção; o working tree recente não está versionado.
- **GitHub versus produção:** a landing está sincronizada no SHA de 19/07. A loja recente é externa e exige captura de fonte/estado.

## 10. Plano de lançamento em lotes

### Lote 0: backup e fonte de verdade

- Exportar CSS público, configurações, produtos e variantes.
- Criar fonte legível, saída gerada e rollback.
- Atualizar documentação de produção.
- **Validação:** hashes, contagens e restauração ensaiada.
- **Rollback:** CSS e conteúdo exportados, retorno em menos de dez minutos.

### Lote 1: bloqueadores

- G1, G2, G3, G5, G9 e G10.
- **Validação:** políticas publicadas, 386/386 variantes conciliadas, dois pedidos corretos, método social, runbook e cadeia de direitos.
- **Rollback:** pedidos controlados cancelados conforme regra; conteúdo restaurado; nenhum SKU alterado sem backup.

### Lote 2: conversão e confiança

- G4, links de Ajuda e escolha de heróis.
- **Validação:** checklist por tipo de peça e teste com usuários.
- **Rollback:** versões anteriores de descrição mantidas; não remover imagens YouDraw.

### Lote 3: técnica, SEO e acessibilidade

- G7, metadados e analytics.
- **Validação:** cinco viewports, 49/49 hover, teclado, DebugView e smoke test.
- **Rollback:** CSS anterior e desligamento de tags novas.

### Lote 4: soft launch e refinamentos

- G8, mídia experimental, entrevistas, pedido perfeito e decisão por herói.
- **Validação:** relatório de 14 dias e gates numéricos.
- **Rollback:** pausar mídia, retirar herói do destaque e manter a loja funcional.

## 11. Decisões que não devem ser alteradas

- Landing no domínio raiz e loja no subdomínio `loja`.
- Nuvemshop, plano Impulso e tema Baires.
- YouDraw como POD.
- STREET, RELÍQUIA e NUVEM.
- Paleta céu/nuvem/navy/ouro; Fraunces e Inter.
- Logo à esquerda; Menu/Carrinho agrupados à direita no mobile.
- Footer editorial claro e atribuição da Nuvemshop escondida.
- Lifestyle como capa e imagens reais da YouDraw dentro do produto.
- Mono-cor sem troca de foto no hover; multicolorido troca somente entre lifestyle das cores reais.
- Transição fluida, sem piscar.
- Formato `Arte | Peça`.
- Projeto social escolhido no checkout.
- Nunca prometer “troca fácil”.

## 12. Lacunas que não podem ser inventadas

- SKU interno e IDs da YouDraw.
- Custo final por variante.
- Contrato e SLA efetivos da YouDraw.
- Regime tributário, emissão fiscal e identificação jurídica do vendedor.
- Conteúdo das mensagens transacionais.
- Core Web Vitals atuais.
- Conversão, CAC, recompra e pedido perfeito reais.
- Direitos autorais e autorizações de imagem.

Essas lacunas são exatamente o motivo do veredito GO CONDICIONAL.

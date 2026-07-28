---
status: vigente
atualizado: 2026-07-28
metodo: coleta em 7 frentes + verificacao adversarial por frente (workflow de 15 agentes)
---

# Dossiê de decisão: migrar a produção POD da YouDraw para a IzzyPrint

Data: 2026-07-28 · Base: páginas públicas de izzyprint.com.br coletadas e reverificadas de forma adversarial em 28/07, cruzadas com `nuvemshop/producao/plano.json`, `nuvemshop/auditoria/2026-07-28-dpi-artes.md` e `docs/verdades/medidas-pecas.md`. Nenhum número aqui foi estimado: o que não foi encontrado está marcado como não publicado.

## 1. Veredito

**Testar, não migrar.** Nada do que decide margem (custo por peça para revenda), experiência de marca (etiqueta, embalagem, remetente, nota fiscal) ou viabilidade das artes no fluxo real está publicado, e sem esses três a migração é aposta, não decisão.

**O que já dá para afirmar sem a conta:** a IzzyPrint hoje não cobre 13 das 78 variantes publicadas (moletom só em preto e nenhum equivalente de Ecobag) e 48 das 78 usam arte com mais de 30 cm de largura, que é o teto do editor público deles.

**Por que ainda vale testar:** o catálogo vai ser refeito de qualquer jeito (77 capas reprovadas, artes a 222 DPI, blanks novos), então o custo de troca nunca vai estar tão baixo quanto agora, e a IzzyPrint publica ficha de malha e tabela de medidas que a YouDraw não publica.

## 2. Comparativo IzzyPrint x YouDraw

Só linhas com dado real de pelo menos um lado. "Não publicado" = o fornecedor não divulga. "Não levantado" = não estava no escopo desta coleta.

| Item | IzzyPrint | YouDraw |
|---|---|---|
| Prazo de produção | Até 4 dias úteis após confirmação do pagamento (FAQ da home, fluxo de varejo) | ~48h |
| Prazo de produção B2B / produção de marca | Não publicado | Não levantado |
| Integração Nuvemshop | Existe, sem API pública (confirmado pelo dono em contato direto). Não há app na Loja de Aplicativos Nuvem, e o site não cita Nuvemshop, Shopify nem API em nenhuma página | App nativo na Loja de Aplicativos Nuvem |
| Custo fixo de plataforma | Não publicado | ~R$99/mês |
| Custo por peça para revenda | **Não publicado.** Só existem preços de varejo ao consumidor | Camiseta frente+verso ~R$73,20 · Blusão com estampa grande R$122,65 |
| Preços de varejo publicados (não são custo POD) | Clássica R$29,90 a R$55,90 · Oversized Street R$39,90 a R$69,90 · Boxy R$59,90 · Baby Look R$45,90 · Canguru R$139,90 · Careca R$119,90 | Não publicado |
| Pedido mínimo | 1 peça no varejo. Para peça com marca do cliente o FAQ fala em "orçamento especial", sem quantidade declarada | Sob demanda |
| Área máxima de estampa | 30 cm x 40 cm (3.543 x 4.724 px a 300 DPI), declarada como limite "por esta plataforma". Sem área por posição (peito, costas, manga) | Comporta as artes atuais, com costas de até 35,2 cm |
| Requisito de arquivo | PNG sem fundo (fundo sólido rejeitado mesmo na cor da peça), 300 DPI recomendado, 72 DPI mínimo sem garantia. Editor Lumise 2.0.6 | Não levantado |
| Técnica de impressão | DTG. Nunca nomeada no site (produto, FAQ, /personalizar/, /print-on-demand/). Aparece no nome comercial em cadastros próprios (Google Business/Waze e WhatsApp Business) e em posts de 2020. Silk screen aparece em portfólio de 2020 | Não confirmada |
| Malha das camisetas | 100% algodão penteado, fio 26.1, 180 g/m² (Clássica, Baby Look) e 200 g/m² (Oversized Street, Boxy), selos BCI e Sou de Algodão | Não publicada |
| Malha dos moletons | 96% algodão + 4% elastano, "dois cabos", selos BCI e Sou de Algodão. Gramatura contraditória na própria fonte: 300 g na página normal, 260 g na versão personalizável, e nunca em g/m² | Não publicada |
| Tabela de medidas | Publicada por tamanho em todas as peças (tórax x comprimento) | Publicada nas demais peças, **não publicada para o Blusão Moletom** (nosso 78,4 cm segue estimado) |
| Grade de tamanhos | Clássica PP a G1 (7) · Oversized Street P a G4 (9) · Boxy P a EG (5) · moletons P a G1 (6) | Não levantado |
| Cores de camiseta | Clássica 9 · Oversized Street 8, sem nenhum azul · Boxy 6. Só nomes comerciais, sem hex ou Pantone | Catálogo NIMBUS publica Preta, Branca, Off-White e Bege |
| Cores de moletom | **Apenas Preto**, nos dois modelos | NIMBUS tem 12 variantes de moletom em Branca no ar |
| Equivalente de Ecobag | **Não existe.** Sitemap com 14 URLs = 7 bases x 2 versões, só camiseta e moletom | Existe (1 variante, Bege) |
| Marketplace próprio como vitrine | Não tem | Tem |
| Transportadoras | Correios ou JadLog, escolha do cliente no checkout. Prazo de entrega não publicado em dias | Não levantado |
| Política de defeito | Substituição sem custo mediante fotos e número do pedido, após análise. Sem prazo limite publicado, sem menção a arrependimento, troca de tamanho ou estorno | Não levantado |
| White label (etiqueta, tag, embalagem, remetente) | **Não publicado.** Existe posicionamento (item de menu "Produção de marcas", tag /privatelabel/, portfólio nominal de marcas atendidas), mas nenhuma condição, spec ou preço | Não levantado |
| Emissão de nota fiscal no envio ao cliente final | Não publicado | Não levantado |
| Restrições declaradas | "Não produzimos peças com marcas registradas e com malha própria do cliente" | Não levantado |
| Reputação pública | Reclame Aqui **sem reputação calculada** (a empresa não atinge as 10 reclamações avaliadas exigidas). 3 reclamações indexadas, a única datável é de setembro de 2021. Índice de resposta não verificável: o domínio devolve 403 e as fontes de busca se contradizem | Não levantado |
| Empresa | IZZY PRINT Confecção e Estamparia Ltda, CNPJ 35.342.657/0001-11, ME, São Paulo/SP, aberta em 29/10/2019 | Não levantado |

## 3. Riscos da migração, do maior para o menor

**1. O teto de 30 cm de largura atinge a assinatura visual da marca.**
48 das 78 variantes usam arte com mais de 30 cm de largura (18 Camiseta Premium, 16 Oversized, 10 Canguru, 4 Blusão), com máximo em 35,2 cm. No nível da arte são 16 das 26. E 71 das 78 variantes têm estampa de costas: a estampa grande nas costas é o produto. Encolher para caber é perda de presença; refazer é retrabalho. Atenuante real: encolher aumenta o DPI, e 11 artes chegam a 295 a 296 DPI só por isso, o que resolve metade do problema de resolução de graça. Agravante: o limite de 30x40 está declarado para o editor público, e ninguém confirmou se vale no fluxo de produção de marca.

**2. Catálogo descoberto: 13 das 78 variantes não têm equivalente hoje.**
Moletom só existe em preto na IzzyPrint, então as 8 variantes de Canguru Branca e as 4 de Blusão Branca ficam sem cor. A Ecobag não existe no catálogo deles (sitemap completo confirma: só camiseta e moletom). Isso é 17% do catálogo publicado que teria que sair do ar, mudar de cor ou ficar na YouDraw, e "ficar na YouDraw" significa pagar duas plataformas.

**3. Decidir margem sem custo.**
Não existe tabela B2B publicada. Os preços do site são de varejo ao consumidor, com carrinho e sem volume: compará-los com o custo YouDraw de R$73,20 é erro de categoria e não deve entrar em nenhuma planilha. Como 10% do lucro de cada pedido vai para projeto social, custo instável ou desconhecido contamina também a promessa social, que é pública.

**4. White label e nota fiscal em branco.**
Nada publicado sobre etiqueta interna, tag, embalagem, packing slip ou nome do remetente, e nada sobre quem emite a NF no envio ao cliente final. Para uma marca cuja tese é acabamento premium, uma caixa chegando com marca de terceiro anula o unboxing. É risco de experiência, não de logística.

**5. As peças não são intercambiáveis, e o datum muda.**
No tamanho G: Oversized Street é 8% mais estreito e 7% mais curto que o nosso Oversized Premium; o Canguru deles é **20% mais comprido** que o nosso. Como o datum de placement da NIMBUS é gola até barra, todo o placement dos moletons teria que ser re-medido, não ajustado. Some a isso blanks novos e reconstrução das 77 capas. Custo em trabalho, não em dinheiro, e boa parte já estava prevista na reconstrução do catálogo.

**6. Prazo maior e prazo B2B desconhecido.**
Até 4 dias úteis contra ~48h da YouDraw, mais entrega não quantificada (só "varia conforme Correios ou JadLog"). E os 4 dias são a promessa do varejo deles; o prazo de produção de marca não é publicado em lugar nenhum.

**7. DTG em peça escura depende do branco, e é justamente onde há reclamação.**
36 das 78 variantes são pretas. A única reclamação datável (setembro de 2021) relata camiseta preta sem a cor branca impressa. Peso probatório baixo: caso isolado, com quase 5 anos, num perfil sem reputação calculada, e o mesmo caso relata redução de A3 para A4, que é compatível com o limite documentado de 30x40 cm e não prova defeito. Serve como roteiro de teste, não como veredito.

**8. Não há reputação pública que aprove nem reprove.**
Sem nota no Reclame Aqui por amostra insuficiente, sem Trustpilot, sem review independente, sem teste de lavagem de terceiro. Os elogios encontrados são todos autopublicados (home da própria empresa e diretório de fornecedor). Baixo volume de reclamação não é boa reputação, é pouca amostra. Consequência prática: não existe atalho, só amostra física.

**9. Ambiguidade jurídica a resolver por escrito.**
"Não produzimos peças com marcas registradas" muito provavelmente fala de marcas de terceiros, mas a NIMBUS planeja registro no INPI e a frase, como está, não distingue. E "nem com malha própria do cliente" fecha em definitivo a porta de levar blank próprio no futuro.

**10. A própria fonte se contradiz em ficha técnica.**
A página do Oversized Street Personalizável diz 180 g/m² e "modelagem clássica" (texto copiado da Clássica), enquanto a página base diz 200 g/m² e modelagem street. Os moletons dizem 300 g numa página e 260 g na outra. A tabela do Canguru traz o G1 mais curto que o P. A grafia do fio alterna entre "26.i" e "26.1" e nunca coocorre na mesma gramatura, então não há como reconciliar pelo site. Impacto direto: se a página de produto da NIMBUS publicar material e gramatura vindos daí, publica erro. Toda spec precisa vir por escrito deles.

**11. Sinais menores de manutenção.**
O rodapé de /personalizar/ marca 2020, o link "FAQ" do rodapé devolve 404, o site tem só 8 páginas e os 96 posts são todos de 2020. A página /print-on-demand/ ("Produção de marcas") não tem texto nenhum: é imagem, mais três botões de WhatsApp. Nada disso é impeditivo, mas indica que qualquer termo B2B vai vir de conversa, não de documento.

## 4. Lacunas que só a conta logada (ou o WhatsApp comercial) responde

**Custo e condição comercial**
1. Tabela de custo por peça para revenda: Clássica, Oversized Street, Boxy, Canguru e Careca, por tamanho, se variar.
2. Custo de segunda posição de estampa (frente e costas na mesma peça) e se o preço listado inclui uma ou duas posições.
3. Existe mensalidade, adesão, comissão ou é só custo por peça.
4. Existe desconto por volume e a partir de qual quantidade.
5. Pedido mínimo do fluxo de produção de marca (o "a partir de 1 peça" é do varejo).
6. Preço e prazo de peça piloto ou amostra.

**Estampa e arte (o que decide se as artes servem)**
7. Área máxima real do fluxo POD por peça e por posição, e se os 30x40 cm valem também fora do editor público. Nossas costas chegam a 35,2 cm.
8. Área de estampa varia por tamanho de peça (P contra G4).
9. Requisitos de upload na conta: DPI mínimo aceito, formato, peso máximo, e se o sistema avisa quando a imagem está abaixo de 300 DPI.
10. Técnica confirmada por escrito: DTG, DTF ou silk, e se muda por produto ou por volume.
11. Perfil de cor exigido (sRGB, CMYK) e se existe alguma tolerância ou política de color matching. Sem hex nem Pantone das cores de malha, não dá para casar com a paleta sem amostra.
12. Como tratam base branca em peça escura e se há custo adicional para isso.
13. Estampa em manga, peito pequeno, gola ou etiqueta interna: existe no fluxo POD.

**Marca e fiscal**
14. Etiqueta interna com a marca NIMBUS: existe, quanto custa, qual o mínimo.
15. Tag pendurada, embalagem e packing slip com a marca NIMBUS ou ao menos neutros.
16. Nome do remetente na postagem.
17. Quem emite a nota fiscal para o cliente final e em nome de quem.
18. Esclarecimento por escrito de "não produzimos peças com marcas registradas": vale para marca registrada do próprio contratante (caso da NIMBUS no INPI) ou só para marcas de terceiros.

**Integração e operação**
19. Onde fica a integração com a Nuvemshop na conta, como se ativa, se preserva SKU e como os pedidos chegam (já confirmado que existe e que não é API pública, falta ver o mecanismo).
20. O que acontece quando falta cor ou tamanho de blank: avisa, substitui, cancela.
21. Capacidade produtiva mensal e prazo em alta temporada.
22. Prazo de produção contratual do fluxo de marca (não o do varejo).
23. Frete real: simular 1 camiseta para um CEP de capital e um de interior, sem finalizar.
24. Prazo limite para abrir reclamação de defeito, quem paga o frete reverso, e se existe estorno ou só substituição.
25. Política de troca por tamanho e de arrependimento (CDC art. 49) no fluxo de marca: o site não tem nenhuma página sobre isso.

**Ficha técnica a confirmar por escrito**
26. Gramatura real do Oversized Street: 180 ou 200 g/m² (as duas páginas do mesmo produto discordam).
27. Gramatura real dos moletons: 300 g ou 260 g, e em g/m², não "fio de Xg".
28. Título do fio: 26.i, 26.1 ou outro.
29. Tabela de medidas correta do Canguru (o G1 publicado é mais curto que o P).
30. Encolhimento após lavagem, instruções de conservação e durabilidade da estampa.
31. Composição das cores mescla e estonado (o site afirma 100% algodão para a peça inteira, sem ressalva por cor).
32. Existe equivalente de Ecobag ou de blusão fora do site, sob encomenda.

## 5. Próximos passos

**Passo 0. Congelar.** Nada migra, nada se publica, a YouDraw segue como produção vigente. A reconstrução do catálogo continua parada esperando esta decisão, o que está correto: refazer 77 capas sobre blanks da plataforma errada seria o pior desperdício possível.

**Passo 1. Rodar a sessão logada** com a lista da seção 4, usando `cowork-izzyprint-avaliacao-prompt.md` como base e acrescentando os itens 14 a 32, que não estavam lá. Nada de finalizar compra ou alterar a conta. Sair com respostas por escrito, de preferência em texto do WhatsApp comercial, não só do painel.

**Passo 2. Resolver a resolução antes da amostra.** Re-exportar 2 ou 3 artes a 4.724 px de altura (30x40 cm a 300 DPI) e subir no editor da conta para ver se a pixelação some. Isso vale independentemente da decisão: 300 DPI é norma de POD em geral, e nenhuma das 26 artes chega lá hoje. Para as artes que são stencil chapado, vetorizar resolve de vez.

**Passo 3. Comprar amostras que testem o que dói.** No mínimo quatro peças, escolhidas para atacar os riscos 1, 7 e 10:
- uma Camiseta Clássica **preta** com estampa de costas no maior tamanho que couber em 30x40, para testar branco em malha escura;
- uma Oversized Street **off-white**, que é a cor de 13 variantes do catálogo;
- um Moletom Canguru preto, para medir os 20% de comprimento a mais e checar capuz e bolso, que não estão descritos em texto nenhum;
- uma peça com a arte de 35,2 cm reduzida a 30 cm, para o dono julgar se a presença nas costas sobrevive à redução.

**Passo 4. Medir a amostra, não olhar.** Tórax e comprimento contra a tabela publicada, gramatura por pesagem, e a estampa medida em cm contra a receita. Lavar uma peça e reavaliar. É a única forma de responder o que nenhuma fonte pública responde: durabilidade e fidelidade de cor.

**Passo 5. Só então decidir**, com três resultados possíveis:
- **Migrar**, se custo, white label e área de estampa fecharem e a amostra convencer. É o momento mais barato para fazer isso, porque catálogo, blanks e capas seriam refeitos de qualquer jeito.
- **Ficar**, se o custo B2B não for melhor que os R$73,20 ou se o white label não existir. Nesse caso o ganho da IzzyPrint (ficha de malha publicada, tabela de medidas) vira uma pergunta para a YouDraw, que hoje não publica nem uma nem outra, inclusive a do Blusão que segue estimada em 78,4 cm.
- **Híbrido**, que precisa ser rejeitado de propósito e não por omissão: manter Ecobag e moletons brancos na YouDraw significa duas integrações, dois prazos e duas fichas técnicas na mesma loja.

**Opcional, se o passo 1 vier ruim.** Vale pedir cotação a mais dois antes de encerrar o assunto: Estampa Impressa (declara 1 a 2 dias úteis de produção e white label explícito, mas a integração com a Nuvemshop é autodeclarada, sem app nativo) e Dimona/Dropsimples (sem mensalidade, emite NF, mas a integração com a Nuvemshop passa por um middleware de terceiro, o que significa três contas). Reserva INK tem o melhor prazo publicado (48h) e algodão peruano no catálogo, mas nota 3,2 com 25 avaliações e reclamações literais de falha de integração: risco alto demais. Printful fica pendente, porque não foi possível confirmar nem refutar produção em território brasileiro.

## Observações de honestidade sobre esta coleta

- **Preço de varejo não é custo POD.** Os R$29,90 a R$55,90 são preço ao consumidor com carrinho. Qualquer comparação direta com os R$73,20 da YouDraw é erro de categoria e foi removida do dossiê.
- **O Reclame Aqui não foi lido diretamente.** O domínio devolve 403 a acesso automatizado. Tudo sobre volume de reclamações e índice de resposta veio de trechos indexados de busca, e há contradição entre eles (um trecho mostra manifestação da empresa, o painel indica 0% de resposta). Não use nenhum desses números como fato.
- **streetbase.com.br não é fonte de terceiro.** É domínio da própria IzzyPrint (todas as páginas carregam o título "Izzy Print"). O texto sobre durabilidade do fio que circulava como validação externa é copy própria, e o domínio nem resolve mais.
- **A citação de imposto de importação de 60% atribuída ao estampaweb não existe naquela página.** O fato fiscal em si se confirma por outra via, mas a fonte estava errada e foi descartada.
- **A técnica DTG não é compromisso documental.** A empresa se descreve como estamparia DTG no nome comercial de cadastros próprios, mas nenhuma página de produto, FAQ ou política nomeia o processo, e as páginas foram atualizadas entre março e julho de 2026 sem aproveitar para isso.
- **Definição do Blusão Moletom da NIMBUS está inconsistente dentro do próprio projeto.** A auditoria de 28/07 o equipara ao Moletom Careca (sem capuz), o prompt de avaliação pede "blusão com capuz, sem bolso" e a coleta externa foi buscar "sem capuz, com bolso". Antes de comparar SKU com qualquer fornecedor, essa definição precisa ser fechada, ainda mais porque o comprimento de 78,4 cm segue estimado.
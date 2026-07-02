# Loja Nuvemshop — instruções de aplicação (plano Impulso · tema Morelia)

Tudo que você precisa colar/configurar no painel da Nuvemshop pra loja ficar com a cara da NIMBUS
e com a iniciativa social funcionando. Arquivos desta pasta: `css-nimbus.css`,
`pagina-projetos-sociais.html`, `pagina-sobre.html`. Favicon: `public/img/favicon-nuvemshop-130.png`.

## 1. CSS da marca (Impulso+)
1. Painel → **Loja online → Layout → Personalizar seu layout atual**.
2. Ache **"Edição de CSS avançada"** e cole o conteúdo de **`css-nimbus.css`**.
3. Salve e abra a loja. ⚠️ Os seletores variam por tema; se algum bloco não pegar no Morelia, me
   manda um print da parte errada que eu ajusto o seletor.

## 2. Editor do tema (cores/fontes/logo — vale mesmo sem CSS)
- **Cores:** primária `#0b2360` (navy) · destaque/CTA `#e9c46a` (ouro) · fundo `#f7fbff` (nuvem).
- **Fontes:** títulos **Fraunces** (se o Morelia não tiver, Playfair Display) · corpo **Inter**.
- **Logo do topo:** wordmark NIMBUS. **Favicon:** ver passo 5.

## 3. Páginas institucionais
1. Painel → **Loja online → Páginas → Criar página**.
2. Página **"Projetos Sociais"**: no editor, mude para o modo **HTML (< >)** e cole
   `pagina-projetos-sociais.html`.
3. Página **"Sobre a NIMBUS"**: idem com `pagina-sobre.html`.
4. **Menu:** Loja online → Menus → adicionar as duas páginas no menu principal (sugestão de ordem:
   Início · Produtos · Projetos Sociais · Sobre).

## 4. Campo do projeto social no checkout (SEM código — é isso que faz a escolha funcionar)
1. Painel → **Configurações → Opções de checkout**.
2. Habilite **"Mensagem do cliente"** (campo de observações na finalização).
3. Nomeie o campo assim (copie):
   > **Qual projeto recebe 10% do lucro? Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo ou escreva outro**
4. Deixe **opcional** (não obrigatório — quem não escolher, você distribui igualmente ou escolhe).
5. A resposta aparece em cada pedido (e dá pra exibir na etiqueta de envio se quiser).

## 5. Favicon
1. Painel → **Loja online → Layout** → seção **Favicon** → **Carregar imagem**.
2. Suba **`public/img/favicon-nuvemshop-130.png`** (130×130, fundo transparente). Salvar.

## 6. Barra de anúncio (topo da loja)
No editor do tema (Layout → Personalizar), ache a **barra de anúncio** e use:
> **10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.**

## 7. Política de trocas (obrigação legal — SEM promover)
O CDC (art. 49) dá **7 dias de arrependimento** em compra online, mesmo em POD; e defeito é coberto
por lei. Crie uma página discreta "Trocas e devoluções" (Páginas → Criar) com o mínimo legal:
- Arrependimento: até 7 dias corridos após o recebimento, produto sem uso, comunicação por e-mail.
- Defeito de fabricação/impressão: troca sem custo (mande fotos por e-mail).
- Fora isso, não há troca por escolha errada de tamanho (deixe a **tabela de medidas** clara em cada
  produto pra evitar!).
Não coloque essa página em destaque no menu; rodapé basta. **Não usar "troca fácil" em nenhum texto.**

## 8. Próximos ganhos de conversão (quando der)
- **Fotos lifestyle** nos produtos (prompts prontos em `nimbus-lifestyle-higgsfield.md`) — maior
  alavanca visual de conversão que existe pra moda.
- Selo/menção **"produzido sob demanda em ~48h no Brasil"** nas descrições.
- **Tabela de medidas** em todos os produtos (reduz medo de errar tamanho e pedidos de troca).
- Cupom **ESTREIA15** na barra de anúncio na semana de lançamento.
- Pós-lançamento: prints de clientes vestindo + prestação de contas das doações (prova social dupla).

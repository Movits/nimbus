---
status: vigente
atualizado: 2026-07-28
---

# Prompt: avaliar a IzzyPrint por dentro (Cowork, navegador logado)

Cole este prompt numa sessão do Claude Cowork no computador, com a conta da
IzzyPrint (<https://izzyprint.com.br/>) **já logada no navegador da sessão**.
Contexto completo em `docs/ESTADO.md` (seção "Reavaliação de plataforma") e
`nuvemshop/auditoria/2026-07-28-dpi-artes.md`.

---

Estou avaliando migrar a produção POD da NIMBUS (streetwear católico premium,
loja na Nuvemshop) da YouDraw para a IzzyPrint. Você está na minha conta
IzzyPrint. **Não finalize nenhuma compra, não altere dados da conta e não
cadastre nada como definitivo sem me perguntar.** Levante e me traga:

1. **Tabela de custos POD** por produto (Camiseta Clássica, Oversized Street,
   Boxy, Moletom Canguru, Moletom Careca): custo por peça para revenda,
   frente/costas/frente+costas, por tamanho se variar. Para comparar: na
   YouDraw a camiseta frente+verso custa ~R$73,20 e o blusão com estampa
   grande R$122,65.
2. **Área máxima de estampa real do fluxo POD** (o editor público diz
   30×40 cm; nossas costas atuais usam até 35,2 cm de largura — se 30 cm for o
   teto, estampas grandes terão que encolher).
3. **Requisitos de arquivo** no upload da conta: DPI, formato, peso máximo, e
   se o sistema avisa quando a imagem está abaixo de 300 DPI.
4. **Tecidos**: composição e gramatura de cada peça (não está no site
   público). Qualidade premium é a tese da marca.
5. **Integração com a Nuvemshop**: onde fica, como ativa, se preserva SKU, e
   como chegam os pedidos (já me confirmaram que existe, sem API pública).
6. **White label**: etiqueta, embalagem e nota com a marca NIMBUS, sem marca
   da IzzyPrint.
7. **Frete e prazos reais** no checkout: simule um pedido de 1 camiseta para
   um CEP de capital e um do interior, SEM finalizar.
8. **Equivalentes que faltam**: existe Ecobag? Existe blusão de moletom (com
   capuz, sem bolso)? Se não, o que sugerem?

Com isso na mão, monte comigo **produtos-teste** (2 ou 3 peças com artes
nossas já em 300 DPI) para eu comprar amostras e julgar a qualidade. Uma
observação: ao dar zoom nas estampas no editor deles a imagem pixelou — nossas
artes atuais estão em ~222 DPI, então antes dos produtos-teste as artes
escolhidas precisam ser re-exportadas a 300 DPI (4724 px de altura para 40 cm).

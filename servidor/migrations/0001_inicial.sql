-- Banco dos pedidos da loja própria (D1, plano de 13/11/2026, seção 4).
-- Mora na conta Cloudflare do dono, nunca em repositório. Do pagamento, só o
-- número e o meio: nada de cartão.

CREATE TABLE pedidos (
  codigo TEXT PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,        -- gerada pela página; repetir o envio não cria outro pedido
  impressao TEXT NOT NULL,           -- hash da sacola, do e-mail e do CEP, para recusar chave reaproveitada
  token_hash TEXT NOT NULL,          -- SHA-256 do token que só vai no e-mail do cliente
  status TEXT NOT NULL,
  subtotal_centavos INTEGER NOT NULL,
  frete_centavos INTEGER NOT NULL,
  total_centavos INTEGER NOT NULL,
  estornado_centavos INTEGER NOT NULL DEFAULT 0,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cep TEXT NOT NULL,
  uf TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT NOT NULL DEFAULT '',
  projeto TEXT NOT NULL,
  preferencia_id TEXT NOT NULL,
  link_pagamento TEXT NOT NULL,
  pagamento_id TEXT,
  meio TEXT,
  rastreio TEXT,
  ip_hash TEXT NOT NULL,             -- HMAC do IP, só para o limite de pedidos por hora
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  conciliado_em TEXT
);
CREATE INDEX pedidos_por_status ON pedidos (status, criado_em);
CREATE INDEX pedidos_por_ip ON pedidos (ip_hash, criado_em);

CREATE TABLE itens (
  pedido TEXT NOT NULL REFERENCES pedidos (codigo) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_centavos INTEGER NOT NULL,
  PRIMARY KEY (pedido, sku)
);

CREATE TABLE eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido TEXT NOT NULL REFERENCES pedidos (codigo) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  detalhe TEXT NOT NULL DEFAULT '',
  criado_em TEXT NOT NULL
);
CREATE INDEX eventos_por_pedido ON eventos (pedido, id);

-- Idempotência do aviso de pagamento: cada (pagamento, situação) entra uma vez.
CREATE TABLE avisos (
  pagamento_id TEXT NOT NULL,
  situacao TEXT NOT NULL,
  pedido TEXT,
  recebido_em TEXT NOT NULL,
  PRIMARY KEY (pagamento_id, situacao)
);

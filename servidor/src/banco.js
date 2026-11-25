// Acesso ao D1 (SQLite da Cloudflare). Esquema em servidor/migrations/.

export async function pedidoPorChave(db, chave) {
  return db.prepare("SELECT * FROM pedidos WHERE chave = ?").bind(chave).first();
}

export async function pedidoPorCodigo(db, codigo) {
  return db.prepare("SELECT * FROM pedidos WHERE codigo = ?").bind(codigo).first();
}

export async function itensDoPedido(db, codigo) {
  const { results } = await db
    .prepare("SELECT sku, nome, quantidade, preco_centavos FROM itens WHERE pedido = ? ORDER BY rowid")
    .bind(codigo)
    .all();
  return results;
}

export async function pedidosDoIpDesde(db, ipHash, desdeIso) {
  return db.prepare("SELECT COUNT(*) AS n FROM pedidos WHERE ip_hash = ? AND criado_em >= ?").bind(ipHash, desdeIso).first("n");
}

/** Grava pedido, itens e o primeiro evento numa transação só. */
export async function gravarPedido(db, p, agoraIso) {
  const pedido = db
    .prepare(
      `INSERT INTO pedidos (codigo, chave, impressao, token_hash, status, subtotal_centavos, frete_centavos,
        total_centavos, nome, email, telefone, cpf, cep, uf, cidade, bairro, rua, numero, complemento, projeto,
        preferencia_id, link_pagamento, ip_hash, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, 'aguardando_pagamento', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      p.codigo, p.chave, p.impressao, p.token_hash, p.subtotal_centavos, p.frete_centavos, p.total_centavos,
      p.contato.nome, p.contato.email, p.contato.telefone, p.contato.cpf,
      p.endereco.cep, p.endereco.uf, p.endereco.cidade, p.endereco.bairro, p.endereco.rua, p.endereco.numero,
      p.endereco.complemento, p.projeto, p.preferencia_id, p.link_pagamento, p.ip_hash, agoraIso, agoraIso,
    );
  const itens = p.itens.map((i) =>
    db
      .prepare("INSERT INTO itens (pedido, sku, nome, quantidade, preco_centavos) VALUES (?, ?, ?, ?, ?)")
      .bind(p.codigo, i.sku, i.nome, i.quantidade, i.preco_centavos),
  );
  const evento = db
    .prepare("INSERT INTO eventos (pedido, tipo, detalhe, criado_em) VALUES (?, 'criado', '', ?)")
    .bind(p.codigo, agoraIso);
  await db.batch([pedido, ...itens, evento]);
}

export async function registrarEvento(db, codigo, tipo, detalhe, agoraIso) {
  await db
    .prepare("INSERT INTO eventos (pedido, tipo, detalhe, criado_em) VALUES (?, ?, ?, ?)")
    .bind(codigo, tipo, detalhe || "", agoraIso)
    .run();
}

// Colunas que uma troca de status pode gravar junto. Lista fechada: o nome da
// coluna nunca vem de fora.
const EXTRAS = new Set(["pagamento_id", "meio", "estornado_centavos"]);

/**
 * Troca o status só se o atual estiver em `de`. Devolve true se trocou. É a
 * trava contra aviso repetido: o e-mail só sai quando a troca aconteceu.
 */
export async function trocarStatus(db, codigo, de, para, extras, agoraIso) {
  const sets = ["status = ?", "atualizado_em = ?"];
  const valores = [para, agoraIso];
  for (const [coluna, valor] of Object.entries(extras || {})) {
    if (!EXTRAS.has(coluna)) throw new Error(`coluna fora da lista: ${coluna}`);
    sets.push(`${coluna} = ?`);
    valores.push(valor);
  }
  const marcas = de.map(() => "?").join(", ");
  const r = await db
    .prepare(`UPDATE pedidos SET ${sets.join(", ")} WHERE codigo = ? AND status IN (${marcas})`)
    .bind(...valores, codigo, ...de)
    .run();
  return r.meta.changes === 1;
}

/** Estorno parcial: grava o novo total estornado se ele cresceu. */
export async function subirEstorno(db, codigo, estornadoCentavos, agoraIso) {
  const r = await db
    .prepare("UPDATE pedidos SET estornado_centavos = ?, atualizado_em = ? WHERE codigo = ? AND estornado_centavos < ?")
    .bind(estornadoCentavos, agoraIso, codigo, estornadoCentavos)
    .run();
  return r.meta.changes === 1;
}

/** Devolve true se o par (pagamento, situação) é novo. */
export async function registrarAviso(db, pagamentoId, situacao, codigo, agoraIso) {
  const r = await db
    .prepare("INSERT INTO avisos (pagamento_id, situacao, pedido, recebido_em) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING")
    .bind(pagamentoId, situacao, codigo, agoraIso)
    .run();
  return r.meta.changes === 1;
}

export async function esquecerAviso(db, pagamentoId, situacao) {
  await db.prepare("DELETE FROM avisos WHERE pagamento_id = ? AND situacao = ?").bind(pagamentoId, situacao).run();
}

/** Pedidos esperando pagamento, criados entre as duas datas; os menos conferidos primeiro. */
export async function pedidosParaConciliar(db, criadosAntesDe, criadosDepoisDe, limite) {
  const { results } = await db
    .prepare(
      `SELECT codigo FROM pedidos
       WHERE status = 'aguardando_pagamento' AND criado_em < ? AND criado_em > ?
       ORDER BY COALESCE(conciliado_em, '') ASC, criado_em ASC LIMIT ?`,
    )
    .bind(criadosAntesDe, criadosDepoisDe, limite)
    .all();
  return results.map((r) => r.codigo);
}

export async function marcarConciliado(db, codigo, agoraIso) {
  await db.prepare("UPDATE pedidos SET conciliado_em = ? WHERE codigo = ?").bind(agoraIso, codigo).run();
}

/** Pedido que nunca foi pago some em 30 dias (plano, seção 4, "Guarda"). Itens e eventos vão junto. */
export async function apagarNaoPagos(db, criadosAntesDe) {
  const r = await db
    .prepare("DELETE FROM pedidos WHERE status = 'aguardando_pagamento' AND criado_em < ?")
    .bind(criadosAntesDe)
    .run();
  return r.meta.changes;
}

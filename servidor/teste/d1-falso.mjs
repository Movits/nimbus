// D1 de mentira para o portão loja:teste: SQLite em memória do próprio Node
// (node:sqlite), com a mesma forma da API do D1 que o servidor usa:
// prepare().bind().run() | first(coluna?) | all(), e batch() em transação.
// Roda a mesma migração que vai para a Cloudflare.
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export function criarD1Falso(arquivosDeMigracao) {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;"); // o D1 liga por padrão
  for (const arquivo of arquivosDeMigracao) db.exec(readFileSync(arquivo, "utf-8"));

  const conferir = (args) => {
    for (const a of args) if (a === undefined) throw new Error("D1_TYPE_ERROR: undefined não pode ser ligado a ?");
  };

  class Comando {
    constructor(sql, args = []) {
      this.sql = sql;
      this.args = args;
    }
    bind(...args) {
      conferir(args);
      return new Comando(this.sql, args);
    }
    rodar() {
      const r = db.prepare(this.sql).run(...this.args);
      return { success: true, results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    }
    async run() {
      return this.rodar();
    }
    async first(coluna) {
      const linha = db.prepare(this.sql).get(...this.args);
      if (!linha) return null;
      return coluna ? linha[coluna] : { ...linha };
    }
    async all() {
      return { success: true, results: db.prepare(this.sql).all(...this.args).map((l) => ({ ...l })) };
    }
  }

  return {
    prepare: (sql) => new Comando(sql),
    async batch(comandos) {
      db.exec("BEGIN");
      try {
        const saida = comandos.map((c) => c.rodar());
        db.exec("COMMIT");
        return saida;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    sql: db, // para o teste inspecionar o banco
  };
}

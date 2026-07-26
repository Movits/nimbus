// Como ler o nome de arquivo de uma capa, num lugar so.
//
// Duas tentativas anteriores falharam pelo mesmo motivo, de lados opostos:
//   - lista fixa de marcadores no regex (`(?:par-|capuz-)?`) — um sufixo novo
//     (`-grafite-`) virava "cor" inexistente e 36 capas sumiam EM SILENCIO;
//   - marcador generico (`([a-z]+)-`) — engolia o "white" de `off-white` e a
//     cor virava "off".
//
// A saida e casar pela COR, que e um conjunto fechado e conhecido do plano de
// producao, e chamar de marcador tudo o que sobra. Marcador novo passa a ser
// aceito automaticamente; cor com hifen continua inteira.
import fs from "node:fs";

const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
export const CORES = [...new Set(plano.map((p) => p.cor))]
  .map((c) => c.toLowerCase().replace(/-/g, ""))
  .sort((a, b) => b.length - a.length);   // mais longa primeiro: "offwhite" antes de "off"

/** Ordem de preferencia: o mais recente do processo vence o mais antigo. */
export const PRIORIDADE = ["grafite", "par", "capuz", ""];

export function lerNome(f) {
  const m = f.match(/^(\d+)-(.+)-v(\d+)(-semcapuz)?\.png$/);
  if (!m) return null;
  if (f.includes("REJEITADA") || f.includes("REJEITADO") || /blank/.test(f)) return null;
  const meio = m[2];
  const semHifen = meio.toLowerCase().replace(/-/g, "");
  const cor = CORES.find((c) => semHifen.startsWith(c));
  if (!cor) return null;
  // o que sobra depois da cor, sem hifens de borda, e o marcador
  const resto = semHifen.slice(cor.length).replace(/^-+|-+$/g, "");
  return {
    id: m[1], cor, marcador: resto, v: Number(m[3]),
    ocluido: !m[4], sufixo: m[4] ?? "", arquivo: f,
    rank: PRIORIDADE.indexOf(resto) === -1 ? PRIORIDADE.length : PRIORIDADE.indexOf(resto),
  };
}

/** Vence: marcador de maior prioridade, depois sem `-semcapuz`, depois versao. */
export function melhor(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.rank !== b.rank) return a.rank < b.rank ? a : b;
  if (a.ocluido !== b.ocluido) return a.ocluido ? a : b;
  return a.v >= b.v ? a : b;
}

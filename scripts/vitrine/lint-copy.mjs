// Gate de conteúdo da vitrine. Sai com código != 0 se qualquer regra de copy
// pública do projeto for violada no catalogo.json. Regras vindas de
// nuvemshop/instrucoes.md e do brain (tom-de-voz): sem travessão, sem "troca
// fácil", frase dos 10% no fim de toda descrição, régua `Arte | Peça`.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const ARQ = path.join(RAIZ, "public/loja-preview/catalogo.json");
const FRASE_10 = "Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.";
const PECAS = new Set(["Camiseta Premium", "Camiseta Oversized Premium", "Moletom Canguru", "Blusão Moletom", "Ecobag"]);

const cat = JSON.parse(fs.readFileSync(ARQ, "utf-8"));
const erros = [];

const texto = JSON.stringify(cat);
if (/[—–]/.test(texto)) {
  for (const p of cat.produtos)
    for (const [k, v] of Object.entries(p))
      if (typeof v === "string" && /[—–]/.test(v)) erros.push(`${p.id}: travessão em ${k}`);
  if (!erros.length) erros.push("travessão em campo fora de produtos");
}
if (/troca f[aá]cil/i.test(texto)) erros.push('contém "troca fácil"');
if (/http:\/\//.test(texto)) erros.push("URL http:// no catálogo");
if (/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(texto)) erros.push("possível CPF no catálogo");

for (const p of cat.produtos) {
  if (!p.descricao_html.includes(FRASE_10)) erros.push(`${p.id}: descrição sem a frase dos 10%`);
  const m = p.nome.match(/^(.+) \| (.+)$/);
  if (!m) erros.push(`${p.id}: nome fora da régua Arte | Peça: ${p.nome}`);
  else if (!PECAS.has(m[2])) erros.push(`${p.id}: peça fora do conjunto aprovado: ${m[2]}`);
  if (!["STREET", "RELÍQUIA", "NUVEM"].includes(p.colecao_rotulo)) erros.push(`${p.id}: coleção inválida`);
  if (p.resumo.length > 180) erros.push(`${p.id}: resumo com ${p.resumo.length} chars`);
  if ((p.descricao_html.match(/Confirmar no painel/i) || []).length) erros.push(`${p.id}: marcador interno vazou para a copy`);
}

// termos banidos da copy pública (decisão do dono, 29/07): a vitrine vende a
// peça, não o método de produção; "loja oficial" é muleta de marca alheia.
const BANIDOS = [/sob demanda/i, /print[ -]?on[ -]?demand/i, /loja oficial/i];
const DIR_HTML = path.join(RAIZ, "public/loja-preview");
(function anda(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p);
    else if (e.name.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf-8");
      for (const re of BANIDOS)
        if (re.test(html)) erros.push(`${path.relative(RAIZ, p)}: contém "${html.match(re)[0]}"`);
    }
  }
})(DIR_HTML);
for (const re of BANIDOS)
  if (re.test(texto)) erros.push(`catálogo contém "${texto.match(re)[0]}"`);

if (erros.length) {
  console.error("LINT FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`lint OK: ${cat.produtos.length} produtos limpos, HTML sem termos banidos`);

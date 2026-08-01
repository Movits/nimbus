// Gate de conteúdo da vitrine. Sai com código != 0 se qualquer regra de copy
// pública do projeto for violada no catalogo.json. Regras vindas de
// nuvemshop/instrucoes.md e do brain (tom-de-voz): sem travessão, sem "troca
// fácil", frase dos 10% no fim de toda descrição, régua `Arte | Peça`.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const ARQ = path.join(RAIZ, "public/loja/catalogo.json");
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

// Termos banidos da copy pública (decisão do dono, 29/07): a vitrine vende a
// peça, não o método de produção; "loja oficial" é muleta de marca alheia.
// Ampliado em 31/07 depois da auditoria: o nome do fornecedor e os marcadores
// de ficha incompleta estavam no ar na PDP da Ecobag, e a landing carregava
// travessão e "sob demanda" no title e na descrição do Google.
const BANIDOS = [
  /sob demanda/i,
  /print[ -]?on[ -]?demand/i,
  /loja oficial/i,
  /youdraw/i,
  /aguardam? confirmação/i,
  /confirmar no painel/i,
  /troca fácil/i,
  /n[aã]o se aplica/i,
  /—/,
];
// A landing mora fora de public/loja e ficou de fora do lint por 2 dias: os
// dois erros acima só apareceram na auditoria. Agora ela entra.
const ALVOS = [path.join(RAIZ, "public/loja"), path.join(RAIZ, "index.html")];
function confere(arquivo) {
  const html = fs.readFileSync(arquivo, "utf-8");
  for (const re of BANIDOS)
    if (re.test(html)) erros.push(`${path.relative(RAIZ, arquivo)}: contém "${html.match(re)[0]}"`);
}
for (const alvo of ALVOS) {
  if (!fs.existsSync(alvo)) continue;
  if (fs.statSync(alvo).isFile()) { confere(alvo); continue; }
  (function anda(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) anda(p);
      else if (e.name.endsWith(".html")) confere(p);
    }
  })(alvo);
}
for (const re of BANIDOS)
  if (re.test(texto)) erros.push(`catálogo contém "${texto.match(re)[0]}"`);

// A copy da landing vive em TypeScript, não em HTML: sem esta varredura o
// termo volta no próximo build do Vite. Comentários de código ficam de fora.
// Varre src/ INTEIRO, não só content.ts: o travessão do aria-label do Topbar
// passou por dois builds porque o lint só olhava um arquivo. Comentários de
// linha e de bloco ficam de fora, inclusive os de JSX.
function fontes(dir) {
  const saida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const cheio = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...fontes(cheio));
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) saida.push(cheio);
  }
  return saida;
}
const SRC = path.join(RAIZ, "src");
if (fs.existsSync(SRC)) {
  for (const arq of fontes(SRC)) {
    const corpo = fs.readFileSync(arq, "utf-8")
      .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")   // comentário JSX
      .replace(/\/\*[\s\S]*?\*\//g, "")                 // comentário de bloco
      .split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    for (const re of BANIDOS)
      if (re.test(corpo)) erros.push(`${path.relative(RAIZ, arq)}: contém "${corpo.match(re)[0]}"`);
  }
}

if (erros.length) {
  console.error("LINT FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`lint OK: ${cat.produtos.length} produtos limpos, HTML e landing sem termos banidos`);

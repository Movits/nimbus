// Gate de claims da vitrine (P1-6 do conselho r3). Sai com código != 0 se uma
// promessa publicada não tiver lastro: frete grátis sem a condição dos R$399,90
// na mesma página, superlativo sem prova, imagem da CDN acima do teto de 640 px
// (proteção da arte, decisão de 30/07) ou preço do JSON-LD divergindo do
// catálogo (dado que o Google indexa tem que bater com o que a loja cobra).
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const DIR_HTML = path.join(RAIZ, "public/loja");
const cat = JSON.parse(fs.readFileSync(path.join(RAIZ, "public/loja/catalogo.json"), "utf-8"));
const erros = [];

// claims que a operação de hoje não sustenta: produção é por pedido (nada é
// pronta entrega) e superlativo sem prova é risco CDC art. 30.
const OVERCLAIMS = [
  /pronta entrega/i,
  /entrega imediata/i,
  /envio imediato/i,
  /chega amanh[aã]/i,
  /garantia vital[ií]cia/i,
  /100% de satisfa/i,
  /melhor .{0,24}do brasil/i,
  /troca gr[aá]tis/i,
  /devolu[cç][aã]o gr[aá]tis/i,
];

const htmls = [];
(function anda(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p);
    else if (e.name.endsWith(".html")) htmls.push(p);
  }
})(DIR_HTML);

const porSlug = new Map(cat.produtos.map((p) => [p.slug, p]));
for (const arq of htmls) {
  const rel = path.relative(RAIZ, arq);
  const html = fs.readFileSync(arq, "utf-8");

  if (/frete gr[aá]tis/i.test(html) && !html.includes("399"))
    erros.push(`${rel}: promete frete grátis sem a condição dos R$399,90`);

  // Parcelamento honesto (P0-3 do conselho r4, 03/08): o gateway cobra juros
  // da 2ª parcela em diante. "em até Nx" só passa qualificado com "com juros"
  // na mesma frase, e parcela sem juros acima de 1x não passa nunca.
  for (const m of html.matchAll(/em at[eé] \d+x(?! com juros)/gi))
    erros.push(`${rel}: parcelamento sem qualificação: "${m[0]}" (falta "com juros")`);
  if (/\b(?:[2-9]|1[0-8])x sem juros/i.test(html))
    erros.push(`${rel}: promete parcela sem juros que o gateway não dá`);

  for (const re of OVERCLAIMS)
    if (re.test(html)) erros.push(`${rel}: overclaim "${html.match(re)[0]}"`);

  for (const m of html.matchAll(/https:\/\/[^"'\s)]*mitiendanube\.com[^"'\s)]*/g))
    if (!/-640-0\.webp$/.test(m[0]))
      erros.push(`${rel}: imagem da CDN fora do teto -640-0.webp: ${m[0]}`);

  const slug = (rel.match(/public\/loja\/p\/([^/]+)\/index\.html$/) || [])[1];
  if (slug) {
    const p = porSlug.get(slug);
    const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    if (!p) erros.push(`${rel}: PDP sem produto correspondente no catálogo`);
    else if (!ld) erros.push(`${rel}: PDP sem JSON-LD`);
    else {
      const preco = JSON.parse(ld[1])?.offers?.price;
      if (preco !== p.preco) erros.push(`${rel}: preço do JSON-LD (${preco}) difere do catálogo (${p.preco})`);
    }
  }
}

if (erros.length) {
  console.error("LINT-CLAIMS FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`lint-claims OK: ${htmls.length} páginas, claims com lastro, CDN no teto, JSON-LD = catálogo`);

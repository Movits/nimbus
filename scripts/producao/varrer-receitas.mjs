// Varredura das receitas do lote reprovado em 26/07: aponta onde o torso e o
// centro precisam de re-medicao antes de recompor o catalogo.
//
// Triagem, NAO veredito (regra 2 do 00-COMECE-AQUI): o que este script acusa
// vai para re-medicao visual; o que ele nao acusa NAO esta aprovado — so nao
// carrega o vicio conhecido de torso manga-a-manga. O centro das receitas
// antigas veio da silhueta (metodo reprovado), entao TODA receita antiga
// precisa de centro re-medido pelos vincos de cava, sem excecao.
//
// O criterio do torso: a razao fisica visivel torso_px/(gola->barra)_px nao
// pode passar de ~85% da razao largura/comprimento da tabela de medidas
// (tamanho G, docs/verdades/medidas-pecas.md) — a largura visivel numa foto e
// sempre menor que a medida plana. Nos 3 pilotos aprovados a razao fica em
// 66-72% da tabela; nas receitas viciadas (torso manga a manga) ela passa de
// 100%. O 0.85 separa os dois grupos com folga dos dois lados.
import fs from "node:fs";
import path from "node:path";
import { lerNome, melhor } from "./nomes-de-capa.mjs";

const D = "nuvemshop/assets/producao-capas";
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const receitas = JSON.parse(fs.readFileSync("nuvemshop/producao/receitas.json", "utf8"));
const norm = (s) => s.toLowerCase().replace(/-/g, "");

// largura x comprimento (gola->barra) da tabela, tamanho G
const TABELA = {
  "Camiseta Premium": 54 / 75.5,
  "Camiseta Oversized Premium": 66 / 82,
  "Moletom Canguru": 58 / 65,
  "Blusão Moletom": 58 / 78.4, // largura emprestada do Canguru, comprimento estimado
};
const TETO = 0.85; // razao visivel / razao da tabela acima disso = manga a manga

// Varios blanks sao JPEG com extensao .png — ler pela assinatura, nunca pelo nome.
function dims(p) {
  try {
    const b = fs.readFileSync(p);
    if (b.toString("ascii", 12, 16) === "IHDR")
      return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
          return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  }
}

// melhor receita por variante, com a mesma leitura de nome do inventario;
// e, por fora, quais variantes ja tem receita do compositor novo (o marcador
// "piloto" tem rank baixo em PRIORIDADE e perderia no `melhor`)
const porVariante = new Map();
const temNova = new Set();
for (const [arq, r] of Object.entries(receitas)) {
  const n = lerNome(arq);
  if (!n) continue;
  const chave = `${n.id}|${n.cor}`;
  if (n.marcador === "piloto" || (r.relevo != null && r.sombra_tecido != null))
    temNova.add(chave);
  const atual = porVariante.get(chave);
  if (!atual || melhor(atual.n, n) === n) porVariante.set(chave, { n, r, arq });
}

const itens = [];
for (const x of plano) {
  if (x.garment === "Ecobag") continue; // painel plano, fora da pipeline
  const chave = `${x.product_id}|${norm(x.cor)}`;
  const hit = porVariante.get(chave);
  const item = {
    id: x.product_id, cor: x.cor, peca: x.garment, colecao: x.collection,
    titulo: x.title, vista: x.vista,
  };
  if (!hit) {
    itens.push({ ...item, classe: "SEM_RECEITA" });
    continue;
  }
  const { n, r, arq } = hit;
  item.receita = arq;
  item.fonte = r.fonte ?? "?";
  item.torso = r.torso ?? null;
  item.centro = r.centro ?? null;
  item.gola = r.gola ?? null;
  item.barra = r.barra ?? null;

  // gerado_em NAO distingue: a colheita de 26/07 carimbou os 134 sidecars com
  // a mesma data. arco_meio_rad tambem nao: a colheita o calcula. So o
  // compositor novo escreve relevo e sombra_tecido (confirmado: apenas os 4
  // sidecars de piloto os tem).
  if (temNova.has(chave)) {
    itens.push({ ...item, classe: "NOVA_26_07" });
    continue;
  }
  if (item.torso == null) {
    itens.push({ ...item, classe: "SEM_TORSO" });
    continue;
  }

  // caminhos de receita colhida no Windows vem com barra invertida
  const fotoBruta = r.foto ? r.foto.replace(/\\/g, "/") : null;
  const foto = fotoBruta && fs.existsSync(fotoBruta) ? fotoBruta : null;
  const d = foto ? dims(foto) : null;
  const razaoTabela = TABELA[x.garment];
  let razao = null, fracao = null;
  if (d && item.gola != null && item.barra != null && item.barra > item.gola) {
    razao = (item.torso * d.w) / ((item.barra - item.gola) * d.h);
    fracao = razaoTabela ? razao / razaoTabela : null;
  }
  item.razao_visivel = razao ? Number(razao.toFixed(3)) : null;
  item.fracao_da_tabela = fracao ? Number(fracao.toFixed(2)) : null;

  let classe;
  if (fracao == null) classe = "SEM_MEDIDA"; // sem blank ou sem gola/barra
  else if (fracao > TETO) classe = "TORSO_SUSPEITO";
  else classe = "TORSO_PLAUSIVEL";
  itens.push({ ...item, classe });
}

const porClasse = {};
for (const i of itens) porClasse[i.classe] = (porClasse[i.classe] ?? 0) + 1;

const suspeitos = itens.filter((i) => i.classe === "TORSO_SUSPEITO")
  .sort((a, b) => b.fracao_da_tabela - a.fracao_da_tabela);

const saida = {
  gerado_em: new Date().toISOString(),
  criterio: `torso visivel > ${TETO} da razao da tabela (G) = manga a manga`,
  aviso: "Triagem, nao veredito. Centro de TODA receita antiga veio da silhueta e precisa de re-medicao pelos vincos de cava.",
  total: itens.length,
  por_classe: porClasse,
  itens,
};
const out = "nuvemshop/auditoria/2026-07-28-varredura-receitas.json";
fs.writeFileSync(out, JSON.stringify(saida, null, 1));

console.log(`variantes examinadas: ${itens.length} (Ecobag fora)`);
console.log(JSON.stringify(porClasse, null, 1));
console.log(`\nTORSO_SUSPEITO (${suspeitos.length}), do pior para o menos pior:`);
for (const s of suspeitos) {
  console.log(`  ${s.id} ${s.cor.padEnd(10)} ${s.peca.padEnd(27).slice(0, 27)} torso ${String(s.torso).padEnd(6)} ${s.fracao_da_tabela}x da tabela  [${s.fonte}]`);
}
console.log(`\nRelatorio completo: ${out}`);

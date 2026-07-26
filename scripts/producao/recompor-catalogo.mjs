// PASSADA GLOBAL: recompoe toda capa cujo placement mudou e roda o gate em
// TODAS, com a tabela corrigida de 26/07.
//
// So e possivel porque cada capa tem receita (sidecar novo, diario do
// workflow, ou o script do lote v8). Sem isso seria preciso re-derivar
// landmarks a mao, capa por capa.
//
// Uso: node tmp_recompor-tudo.mjs [--so-mudadas] [--limite N]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { lerNome, melhor } from "./nomes-de-capa.mjs";

const D = "nuvemshop/assets/producao-capas";
const receitas = JSON.parse(fs.readFileSync("nuvemshop/producao/receitas.json", "utf8"));
// Os sidecars gravados nesta propria passada precisam entrar, senao a proxima
// rodada ve a capa nova (v+1) como "SEM RECEITA".
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    if (!/\.receita\.json$/.test(f)) continue;
    receitas[f.replace(".receita.json", ".png")] = { ...JSON.parse(fs.readFileSync(path.join(p, f), "utf8")), fonte: "sidecar" };
  }
}
// Algumas receitas colhidas dos diarios guardaram a variavel do PowerShell
// ("$d/...") em vez do caminho: o agente usou $d na linha de comando. Resolve
// pela convencao do projeto.
for (const [arq, r] of Object.entries(receitas)) {
  if (r.foto && !fs.existsSync(r.foto)) {
    const m = arq.match(/^(\d+)-([a-z-]+?)-v\d+/);
    const tentativa = m ? path.join(D, m[1], `${m[1]}-${m[2]}-blank.png`) : null;
    if (tentativa && fs.existsSync(tentativa)) r.foto = tentativa;
  }
}
const tabela = JSON.parse(fs.readFileSync("nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json", "utf8"));
const PL = (id) => tabela.itens.find((t) => t.product_id === id) ?? null;
// Receitas do bloco 1 nao registraram --arte-cm (o agente deixava o script
// derivar). Passar null vira NaN e a arte nao e composta. O plano de producao
// tem a medida oficial de cada variante e serve de reserva.
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const cmDoPlano = (id, cor) => {
  const p = plano.find((x) => x.product_id === id && x.cor.toLowerCase().replace(/-/g, "") === cor.replace(/-/g, ""));
  return p ? `${p.art_cm.w}x${p.art_cm.h}` : null;
};
const soMudadas = process.argv.includes("--so-mudadas");
const limite = process.argv.includes("--limite") ? Number(process.argv[process.argv.indexOf("--limite") + 1]) : Infinity;

const norm = (s) => s.toLowerCase().replace(/-/g, "");
// qa-capa.mjs sai com codigo != 0 quando REPROVA. execFileSync lanca nesse
// caso, e tratar isso como falha de execucao escondia 28 vereditos atras de
// "ERRO". O JSON continua no stdout: le sempre.
const run = (args) => {
  try {
    return execFileSync("node", args, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
  } catch (e) {
    const saida = String(e.stdout ?? "");
    if (saida.trim().startsWith("{")) return saida;
    throw e;
  }
};

// Capa final de cada produto+cor.
//
// "-semcapuz" e o INTERMEDIARIO do moletom com capuz: a composicao antes de
// compose-occlude.mjs restaurar os pixels do capuz por cima do topo da arte. O
// entregavel e o arquivo SEM esse sufixo. So quando nao existe nenhum sem
// sufixo e que o semcapuz vale como final (capuz que nao cobre a arte).
const finais = new Map();
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    const r = lerNome(f);
    if (!r) continue;
    const k = `${r.id}|${r.cor}`;
    const atual = finais.get(k);
    if (melhor(atual, r) === r) finais.set(k, { ...r, dir: p, f });
  }
}

/**
 * Capa cujo entregavel passou por compose-occlude: existe um par
 * `<...>-semcapuz.png` ao lado. Recompor essas perderia o capuz, porque o
 * poligono da oclusao nao esta guardado em lugar nenhum.
 */
function finaisSemOclusao(o) {
  return fs.existsSync(path.join(o.dir, o.f.replace(/\.png$/, "-semcapuz.png")));
}

const relatorio = [];
let n = 0;
for (const [, o] of [...finais].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (n >= limite) break;
  // No moletom com capuz a receita foi gravada para o INTERMEDIARIO
  // (`<v>-semcapuz.png`), porque e ele que sai do `compor`; o entregavel
  // `<v>.png` e o resultado da oclusao. Procurar o irmao.
  const rec = receitas[o.f] ?? receitas[o.f.replace(/\.png$/, "-semcapuz.png")];
  const t = PL(o.id);
  if (!rec) { relatorio.push({ ...o, status: "SEM RECEITA" }); continue; }
  if (!t) { relatorio.push({ ...o, status: "SEM PLACEMENT" }); continue; }

  // So recompor quando o deslocamento IMPORTA. A tolerancia do gate e 1,5 cm;
  // recompor por 0,05 cm nao muda nada e, no moletom com capuz, custa a etapa
  // de oclusao (compose-occlude), cujo poligono nao esta na receita.
  const LIMIAR_CM = 0.25;
  const mudou = rec.placement == null
    ? !finaisSemOclusao(o)
    : Math.abs(rec.placement - t.placement_cm) > LIMIAR_CM;
  if (soMudadas && !mudou) continue;
  n += 1;

  const peca = rec.peca ?? t.garment;
  const arteCm = rec.arte_cm ?? cmDoPlano(o.id, o.cor);
  if (!arteCm) { relatorio.push({ id: o.id, cor: o.cor, status: "SEM ARTE-CM" }); continue; }
  const marca = o.marcador ? `${o.marcador}-` : "";
  const alvo = mudou ? path.join(o.dir, `${o.id}-${o.cor}-${marca}v${o.v + 1}${o.sufixo}.png`) : path.join(o.dir, o.f);
  let arco = rec.arco_meio_rad ?? null;

  try {
    if (mudou) {
      const args = [
        "scripts/produce-cover.mjs", "compor", "--produto", o.id, "--foto", rec.foto, "--arte", rec.arte,
        "--gola", String(rec.gola), "--barra", String(rec.barra), "--centro", String(rec.centro ?? 0.5),
        "--placement", String(t.placement_cm), "--arte-cm", arteCm, "--out", alvo,
        "--opacidade", String(rec.opacidade ?? 0.93),
        "--sombra-min", String(rec.sombra_min ?? 0.75), "--sombra-max", String(rec.sombra_max ?? 1.25),
      ];
      if (rec.torso) args.push("--torso", String(rec.torso));
      if (rec.yaw) args.push("--yaw", String(rec.yaw));
      const r = JSON.parse(run(args));
      arco = r.alvo?.arco_meio_rad ?? arco;
    }
    // MEDIR NO INTERMEDIARIO, NAO NO ENTREGAVEL, quando houve oclusao de capuz.
    // O gate mede a caixa da tinta VISIVEL; compose-occlude devolve os pixels
    // do capuz por cima do topo da arte, entao no entregavel a caixa comeca
    // mais abaixo e a checagem de posicao acusa deslocamento que nao existe
    // (352719816 deu 4,45 cm, 352718787 deu 1,87 cm). No `-semcapuz` a arte
    // esta inteira e a geometria e a mesma.
    const semCapuz = path.join(o.dir, o.f.replace(/\.png$/, "-semcapuz.png"));
    const paraMedir = fs.existsSync(semCapuz) ? semCapuz : alvo;
    const qargs = [
      "scripts/geometry/qa-capa.mjs", "--blank", rec.foto, "--composta", paraMedir, "--arte", rec.arte,
      "--arte-cm", arteCm, "--peca", peca, "--gola", String(rec.gola), "--barra", String(rec.barra),
      "--placement", String(t.placement_cm),
    ];
    if (arco) qargs.push("--arco", String(arco));
    if (rec.yaw) qargs.push("--yaw", String(rec.yaw));
    const bruto = run(qargs);
    const qa = JSON.parse(bruto);
    if (!qa.veredito) {
      fs.writeFileSync(`tmp_debug-${o.id}-${o.cor}.txt`, `ARGS:\n${qargs.join(" ")}\n\nSAIDA:\n${bruto.slice(0, 4000)}`);
    }
    relatorio.push({
      id: o.id, cor: o.cor, peca, status: qa.veredito, mudou,
      placement_antigo: rec.placement, placement_novo: t.placement_cm,
      escala_pct: qa.checks.escala?.desvio_pct, posicao_cm: qa.checks.posicao?.erro_cm,
      // O escore do registro NCC e a unica medida numerica de FIDELIDADE que
      // existe: e o quanto a arte composta casa com a arte oficial deformada
      // pela mesma malha. O gate lista "fidelidade visual" como ponto cego,
      // mas um escore baixo aponta onde olhar.
      score_ncc: Number(String(qa.checks.escala?.instrumento ?? "").match(/score ([\d.]+)/)?.[1] ?? NaN),
      alertas: qa.alertas, clipping: qa.checks.clipping?.razao, moire: qa.checks.moire?.razao,
      falhas: qa.falhas, arquivo: path.basename(alvo),
    });
  } catch (e) {
    const saida = String(e.stdout ?? "") + String(e.stderr ?? e.message ?? "");
    relatorio.push({ id: o.id, cor: o.cor, status: "ERRO", mudou, erro: saida.split("\n").filter(Boolean).slice(-3).join(" | ").slice(0, 260) });
  }
}

fs.writeFileSync("nuvemshop/producao/relatorio-gate.json", JSON.stringify(relatorio, null, 1));
const largura = (s, n2) => String(s ?? "-").padEnd(n2);
console.log("status      produto    cor        placement ant->novo   escala%   posicao cm  falhas");
for (const r of relatorio) {
  console.log(`${largura(r.status, 11)} ${r.id} ${largura(r.cor, 10)} ${String(r.placement_antigo ?? "-").padStart(6)} ->${String(r.placement_novo ?? "-").padStart(7)}  ${String(r.escala_pct ?? "-").padStart(7)}  ${String(r.posicao_cm ?? "-").padStart(9)}   ${(r.falhas ?? []).join(",") || r.erro || ""}`);
}
const c = (s) => relatorio.filter((r) => r.status === s).length;
console.log(`\ntotal ${relatorio.length} | APROVADO ${c("APROVADO")} | REPROVADO ${c("REPROVADO")} | ERRO ${c("ERRO")} | recompostas ${relatorio.filter((r) => r.mudou).length}`);

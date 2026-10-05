// Rebaixa as 40 gravuras de domínio público da RELÍQUIA, que saíram do git em
// 13/09/2026.
//
// POR QUE ELAS SAÍRAM: são 260 MB de material de ORIGEM, não arte da marca, e
// cada uma tem URL pública registrada em FONTES.json desde a escolha do dono em
// 06/08. Guardar no git um arquivo que a internet serve de graça é pagar peso
// por nada. O que NÃO saiu, e não sai: `designs/referencias/reliquia_final/`,
// que é o tratamento manual do dono no Affinity e não existe em lugar nenhum
// além do git.
//
// O índice é a fonte da verdade: `designs/referencias/reliquia-escolhidas-2026-08/
// arquivos/FONTES.json`, com título, tema, ano, resolução, licença, fonte, URL e
// o motivo da escolha de cada uma das 40.
//
// Uso:
//   node scripts/producao/rehidratar-fontes.mjs --conferir     # só checa as URLs
//   node scripts/producao/rehidratar-fontes.mjs                # baixa o que falta
//   node scripts/producao/rehidratar-fontes.mjs --destino D:/fontes
//   node scripts/producao/rehidratar-fontes.mjs --indice       # regera FONTES.md
//
// O destino padrão fica FORA dos dois repositórios, ao lado deles. Baixar para
// dentro do repositório de assets recriaria exatamente o peso que a saída
// removeu — e o .gitignore de lá barra a pasta justamente por isso.
//
// Precisa de internet direta. Wikimedia e o Met recusam requisição sem
// User-Agent identificável, então ele vai declarado.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const ASSETS = process.env.NIMBUS_ASSETS || path.resolve(RAIZ, "..", "nimbus-assets");
const ESCOLHIDAS = path.join(ASSETS, "designs/referencias/reliquia-escolhidas-2026-08");
const INDICE_JSON = path.join(ESCOLHIDAS, "arquivos/FONTES.json");
const INDICE_MD = path.join(ASSETS, "designs/referencias/FONTES.md");
const UA = "NimbusWear/1.0 (https://nimbuswear.com.br; nimbuswearbr@gmail.com) rehidratar-fontes";
const SIMULTANEAS = 3;

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const tem = (k) => process.argv.includes(k);

if (!fs.existsSync(INDICE_JSON)) {
  console.error(
    `FONTES.json não encontrado em ${INDICE_JSON}.\n`
    + "Este script lê o repositório privado de assets: clone-o ao lado do público\n"
    + "ou aponte com NIMBUS_ASSETS.",
  );
  process.exit(1);
}
const FONTES = JSON.parse(fs.readFileSync(INDICE_JSON, "utf-8"));

const mb = (b) => (b / 1048576).toFixed(1) + " MB";

// ---------------------------------------------------------------- índice .md
if (tem("--indice")) {
  const linhas = [
    "---",
    "status: vigente",
    `atualizado: ${new Date().toISOString().slice(0, 10)}`,
    "---",
    "",
    "# As 40 gravuras da RELÍQUIA — de onde cada uma veio",
    "",
    "Estes arquivos **não estão no git**. São material de origem em domínio",
    "público, e cada um volta pela URL abaixo:",
    "",
    "```bash",
    "node scripts/producao/rehidratar-fontes.mjs",
    "```",
    "",
    "Gerado de `reliquia-escolhidas-2026-08/arquivos/FONTES.json` por",
    "`scripts/producao/rehidratar-fontes.mjs --indice` no repositório público.",
    "**Não editar à mão:** mexa no JSON e regere.",
    "",
    "O tratamento do dono sobre elas é outra coisa e continua versionado, em",
    "`reliquia_final/`.",
    "",
    "| # | Gravura | Ano | Resolução | Licença | Original |",
    "|---|---|---|---|---|---|",
  ];
  for (const f of FONTES) {
    const cel = (s) => String(s ?? "").replaceAll("|", "\\|");
    linhas.push(`| ${cel(f.num)} | ${cel(f.titulo)} | ${cel(f.ano)} | ${cel(f.resolucao)} | ${cel(f.licenca)} | [baixar](${f.url}) |`);
  }
  linhas.push("", `${FONTES.length} gravuras.`, "");
  fs.writeFileSync(INDICE_MD, linhas.join("\n"));
  console.log(`FONTES.md regerado: ${FONTES.length} gravuras em ${INDICE_MD}`);
  process.exit(0);
}

// ------------------------------------------------------------------ conferir
// Compara o content-length remoto com o arquivo local, quando ele ainda existe.
// É essa conferência que autoriza a remoção: se o byte a byte bate, a gravura
// não está sendo perdida, só deixando de ser carregada.
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// 429 e 5xx NAO sao falha: o Commons limita quem varre 40 arquivos de uma vez.
// Sem esta espera o portao acusaria origem morta onde ela so pediu calma, e foi
// exatamente o que aconteceu na primeira rodada de 13/09.
async function comPaciencia(url, opcoes, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url, opcoes);
      if (r.status !== 429 && r.status < 500) return r;
      if (i === tentativas - 1) return r;
    } catch (e) {
      if (i === tentativas - 1) throw e;
    }
    await espera(2000 * 2 ** i);
  }
}

async function cabecalho(f) {
  try {
    const r = await comPaciencia(f.url, { method: "HEAD", headers: { "user-agent": UA } });
    return { ok: r.ok, status: r.status, tamanho: Number(r.headers.get("content-length")) || 0 };
  } catch (e) {
    return { ok: false, status: 0, tamanho: 0, erro: e.message };
  }
}

async function emLotes(itens, n, tarefa) {
  const saida = [];
  for (let i = 0; i < itens.length; i += n)
    saida.push(...await Promise.all(itens.slice(i, i + n).map(tarefa)));
  return saida;
}

// Tamanho diferente NAO quer dizer imagem diferente: o Met reserve o mesmo JPEG
// com metadado diferente, e foi o que aconteceu com a n78 em 13/09 (21 KB a
// mais no contêiner, 0 de 8.648.019 amostras de pixel diferentes). O que
// importa para rehidratar é o PIXEL, então quando o byte diverge o portão
// desce um nível e compara a imagem, em vez de gritar perda que não houve.
async function mesmosPixels(caminhoLocal, url) {
  const r = await comPaciencia(url, { headers: { "user-agent": UA } });
  if (!r.ok) return { igual: false, motivo: `HTTP ${r.status}` };
  const remoto = Buffer.from(await r.arrayBuffer());
  const [a, b] = await Promise.all([sharp(caminhoLocal).metadata(), sharp(remoto).metadata()]);
  if (a.width !== b.width || a.height !== b.height)
    return { igual: false, motivo: `${a.width}x${a.height} no disco, ${b.width}x${b.height} remoto` };
  const [ra, rb] = await Promise.all([
    sharp(caminhoLocal).removeAlpha().raw().toBuffer(),
    sharp(remoto).removeAlpha().raw().toBuffer(),
  ]);
  if (ra.length !== rb.length) return { igual: false, motivo: "número de amostras diferente" };
  for (let i = 0; i < ra.length; i++)
    if (ra[i] !== rb[i]) return { igual: false, motivo: `pixel diverge na amostra ${i}` };
  return { igual: true, motivo: `${ra.length} amostras idênticas, só o contêiner muda` };
}

if (tem("--conferir")) {
  const res = await emLotes(FONTES, SIMULTANEAS, async (f) => {
    const h = await cabecalho(f);
    const local = path.join(ESCOLHIDAS, f.arquivo);
    const noDisco = fs.existsSync(local) ? fs.statSync(local).size : null;
    let pixel = null;
    if (h.ok && noDisco !== null && noDisco !== h.tamanho) pixel = await mesmosPixels(local, f.url);
    return { f, h, noDisco, pixel };
  });
  let falhas = 0, iguais = 0, divergentes = 0, ausentes = 0;
  for (const { f, h, noDisco, pixel } of res) {
    let nota = "";
    if (!h.ok) { falhas++; nota = `  !! HTTP ${h.status}${h.erro ? " " + h.erro : ""}`; }
    else if (noDisco === null) { ausentes++; nota = "  (fora do git, como esperado)"; }
    else if (noDisco === h.tamanho) { iguais++; nota = "  = idêntico ao disco"; }
    else if (pixel?.igual) { iguais++; nota = `  = mesma imagem (${pixel.motivo})`; }
    else { divergentes++; nota = `  !! ${pixel?.motivo ?? `disco ${noDisco} B, remoto ${h.tamanho} B`}`; }
    console.log(`${f.num.padEnd(4)} ${mb(h.tamanho).padStart(9)}  ${f.arquivo.slice(0, 58).padEnd(58)}${nota}`);
  }
  const total = res.reduce((s, r) => s + r.h.tamanho, 0);
  console.log(`\n${FONTES.length} gravuras, ${mb(total)} no total.`);
  console.log(`  respondem: ${FONTES.length - falhas}   não respondem: ${falhas}`);
  console.log(`  mesma imagem que o disco: ${iguais}   divergentes: ${divergentes}   já fora do git: ${ausentes}`);
  if (falhas || divergentes) {
    console.error("\nCONFERÊNCIA FALHOU: não remova nada do git enquanto isto não fechar.");
    process.exit(1);
  }
  console.log("\nConferência OK: toda gravura tem origem viva e conferida.");
  process.exit(0);
}

// -------------------------------------------------------------------- baixar
const destino = path.resolve(arg("--destino") ?? path.join(RAIZ, "..", "nimbus-fontes"));
fs.mkdirSync(destino, { recursive: true });
console.log(`destino: ${destino}\n`);

let baixadas = 0, pulos = 0, erros = 0, bytes = 0;
await emLotes(FONTES, SIMULTANEAS, async (f) => {
  const alvo = path.join(destino, f.arquivo);
  const h = await cabecalho(f);
  if (fs.existsSync(alvo) && h.ok && fs.statSync(alvo).size === h.tamanho) {
    pulos++; console.log(`ja tenho   ${f.arquivo}`); return;
  }
  try {
    const r = await comPaciencia(f.url, { headers: { "user-agent": UA } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(alvo, buf);
    baixadas++; bytes += buf.length;
    console.log(`baixei     ${f.arquivo}  ${mb(buf.length)}`);
  } catch (e) {
    erros++; console.error(`FALHOU     ${f.arquivo}: ${e.message}`);
  }
});

fs.writeFileSync(
  path.join(destino, "LEIA-ME.txt"),
  "As 40 gravuras de dominio publico da RELIQUIA.\n"
  + "Saíram do git em 13/09/2026 por serem material de origem, nao arte da marca.\n"
  + "Origem de cada uma: nimbus-assets/designs/referencias/FONTES.md\n"
  + "Para rebaixar: node scripts/producao/rehidratar-fontes.mjs\n",
);

console.log(`\n${baixadas} baixadas (${mb(bytes)}), ${pulos} já estavam, ${erros} falharam.`);
process.exit(erros ? 1 : 0);

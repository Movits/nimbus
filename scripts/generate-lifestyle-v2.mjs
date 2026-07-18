// Gerador v2 das fotos lifestyle NIMBUS (Higgsfield nano_banana_pro).
//
// Diferencas do v1 (generate-nuvemshop-lifestyle-batch.mjs):
//  - Dirigido por uma LISTA DE TAREFAS explicita (JSON), uma tarefa por (produto, cor).
//    Nada de heuristica de galeria: a referencia de cada cor vem classificada a olho
//    (catalog/gallery-classification-2026-07-17.json) via build-lifestyle-tasks-v2.mjs.
//  - Trava de TEXTO no prompt: o lote de 16/07 corrompeu texto pequeno em 10 fotos
//    ("SAO BAUGUEL ARCANJO", "(BRAHL SAEBD)"). Escala (REF 3) e conteudo (REF 4) ja
//    eram travados; texto nao era.
//  - Consistencia de par pro hover: quando o produto ja tem a foto aprovada da outra
//    cor, ela entra como REF de cena/modelo (mesma pessoa, mesma cena, so muda a cor).
//  - Notas por tarefa: os defeitos da tentativa anterior entram no prompt como
//    proibicoes explicitas.
//
// Uso: node scripts/generate-lifestyle-v2.mjs <tasks.json> [--limit N] [--dry-run] [--force] [--concurrency N]

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = "C:\\Users\\rober\\Nimbus";
const higgsfieldCli = path.join(
  process.env.APPDATA || "C:\\Users\\rober\\AppData\\Roaming",
  "npm", "node_modules", "@higgsfield", "cli", "bin", "higgsfield.js",
);

const args = process.argv.slice(2);
const tasksPath = args.find((a) => !a.startsWith("--"));
if (!tasksPath) {
  console.error("Uso: node scripts/generate-lifestyle-v2.mjs <tasks.json> [--limit N] [--dry-run] [--force]");
  process.exit(1);
}
const flag = (name) => args.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const dryRun = flag("dry-run");
const force = flag("force");
const limit = Number(opt("limit", "0")) || 0;
const concurrency = Number(opt("concurrency", "3")) || 3;

const tasksDoc = JSON.parse(fs.readFileSync(tasksPath, "utf8"));
const statePath = path.join(path.dirname(path.resolve(tasksPath)), "generation-state-v2.json");

const modelIdentity = {
  Caio: "short tight natural curls, subtle beard and slim body exactly as shown; never straight hair, never a clean-shaven replacement and never a different facial structure",
  Clara: "dark brown hair tied naturally with loose strands, warm medium-light skin and real body proportions exactly as shown; never a different hairstyle or facial structure",
  Gabriel: "very short hair, dark skin and athletic natural body exactly as shown; never longer hair or a different facial structure",
  Helena: "natural shoulder-length curls, dark skin and real body proportions exactly as shown; never straight hair or a different facial structure",
};

function sceneDescription(collection) {
  if (collection === "STREET") {
    return "the same coherent NIMBUS STREET campaign world: authentic Brazilian urban concrete, restrained graffiti in navy, cloud blue and weathered ochre, natural hard daylight, grounded premium streetwear editorial";
  }
  if (collection === "RELIQUIA") {
    return "the same coherent NIMBUS RELÍQUIA campaign world: real Brazilian historic architecture, worn stone and azulejo details, warm natural window light, reverent but contemporary premium fashion editorial";
  }
  return "the same coherent NIMBUS NUVEM campaign world: Brasília modernist sacred architecture, open pale-blue sky and natural clouds, luminous serene daylight, contemporary premium fashion editorial";
}

function buildPrompt(task) {
  const refs = [];
  const imgs = [];
  let n = 1;
  const push = (file, text) => {
    if (!file) return;
    imgs.push(file);
    refs.push(text.replace("{N}", String(n)));
    n += 1;
  };

  // Modo correcao: preserva a pessoa/cena/peca da foto ja gerada e conserta SO a estampa.
  // Mesmo principio do correct-nuvemshop-lifestyle-batch do lote de 16/07.
  if (task.mode === "corrigir") {
    push(task.sourcePhoto, `REFERENCE {N} is the approved campaign photo. Keep every pixel of the person, face, pose, scene, lighting and garment construction UNCHANGED. Change ONLY the printed artwork on the garment.`);
    push(task.mockupRef, `REFERENCE {N} is the exact live product mockup and is the authority for print side, print position and REAL PRINT SCALE relative to the garment.`);
    push(task.artworkRef, `REFERENCE {N} is the original artwork and is the authority for every line, shape, ink color, word, letterform and signature. Reproduce it EXACTLY, including its exact typeface, letter style, arch or curve layout and ornament details. Never redesign, simplify or substitute the art.`);
    const partes = [
      `Correct the printed artwork in this NIMBUS ecommerce photo of "${task.title}" (${task.color}).`,
      ...refs,
      `SPECIFIC CORRECTION REQUIRED: ${task.fix}`,
      `The print must match the mockup scale: never larger than it appears in the mockup relative to the garment; when uncertain, smaller.`,
      `TEXT IS SACRED: every word and letter copied exactly, letter by letter, including small text and the NIMBUS signature. Never invent, substitute or scramble glyphs.`,
      `The corrected print must remain ink on fabric: follow folds, fabric texture through the ink, no glow brighter than the scene light, no cut-out background.`,
      `Everything else in the image stays identical. No added text, no watermark, no new elements.`,
    ];
    return { prompt: partes.join(" "), images: imgs };
  }

  push(task.modelBoard, `REFERENCE {N} is ${task.model}'s approved identity board: preserve the exact face, skin tone, hair, age and natural body proportions. ${modelIdentity[task.model]}.`);
  push(task.garmentRef, `REFERENCE {N} defines the exact ${task.garment}, including garment color, fit, sleeves, hood or handles, and construction.`);
  push(task.mockupRef, `REFERENCE {N} is the exact live YouDraw/Nuvemshop product mockup FOR THIS COLOR and is the authority for print side, print position and real print scale.`);
  push(task.artworkRef, `REFERENCE {N} is the original artwork and is the authority for every line, color, word and signature.`);
  // Ancora de arte: foto ja APROVADA de outro produto com a MESMA estampa. O modelo copia
  // arte de foto melhor do que de PNG chapado em algumas familias (constatado na rodada 4:
  // a mesma arte falhou 4x num produto e saiu perfeita no irmao).
  push(task.artHelperRef, `REFERENCE {N} is an APPROVED photo of a different garment carrying THIS EXACT SAME artwork, correctly printed: copy the artwork content precisely as it appears there (composition, colors, framing elements), adapted to this garment at the mockup's scale.`);
  push(task.sceneRef, `REFERENCE {N} is the approved campaign photo of this exact product in another color: match the SAME model, SAME scene, SAME framing and SAME natural light, changing ONLY the garment color to ${task.color}.`);

  const pose =
    task.view === "back"
      ? "Full or three-quarter rear view, with enough body visible to understand the exact garment silhouette."
      : task.isEcobag
        ? "Three-quarter front view while naturally carrying the ecobag so its entire printed face is clearly visible."
        : "Three-quarter front view with enough body visible to understand the exact garment silhouette.";

  const partes = [
    `Create one square photorealistic NIMBUS ${task.collection} ecommerce lifestyle image for "${task.title}" (${task.color} colorway).`,
    ...refs,
    `Reproduce the sold product exactly. Apply the artwork unchanged and keep the same relative graphic bounding box and placement shown in the mockup reference. The print must never be larger than it appears in the mockup; if there is any uncertainty, make it slightly smaller rather than larger.`,
    `TEXT IS SACRED: every word and letter in the artwork must be copied EXACTLY, letter by letter, including small text, captions inside cartouches and the NIMBUS signature. Never invent, substitute, mirror or scramble glyphs. If a word is too small to paint sharply, keep it small and slightly soft but with the CORRECT letterforms.`,
    `PRINT-ON-FABRIC REALISM: the print is ink on fabric, not a sticker. It must follow every fold and wrinkle, fabric texture must show through the ink, the ink brightness must never exceed the brightest scene light, and there must be no cut-out halo, no rectangle and no separate background behind the art.`,
    pose,
    `${sceneDescription(task.collection)}, realistic fabric folds, realistic skin, hands and anatomy, 50 mm editorial photography. Hands, when visible, must have five separate fingers.`,
    `The garment color is ${task.color} and must read unambiguously as ${task.color}.`,
    "The garment and print must be fully legible and commercially useful in an ecommerce gallery. No other logos, no added text, no watermark, no duplicate person, no mannequin and no AI-looking skin.",
  ];

  if (task.notes && task.notes.length) {
    partes.push(`A previous attempt FAILED with these exact defects; do not repeat any of them: ${task.notes.join("; ")}.`);
  }

  return { prompt: partes.join(" "), images: imgs };
}

function runCommand(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd: workspace, windowsHide: true, shell: false, env: process.env });
    let stdout = "", stderr = "";
    child.stdout.on("data", (c) => (stdout += c.toString()));
    child.stderr.on("data", (c) => (stderr += c.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`Command failed (${code}): ${stderr}\n${stdout}`));
      else resolve({ stdout, stderr });
    });
  });
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

function loadState() {
  if (!fs.existsSync(statePath)) return { updatedAt: null, tasks: {} };
  return JSON.parse(fs.readFileSync(statePath, "utf8"));
}
function saveState(state) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function generate(task, state) {
  const key = `${task.productId}:${task.color}`;
  const existing = state.tasks[key];
  if (!force && existing?.status === "completed" && fs.existsSync(existing.output)) {
    console.log(`[skip] ${key} ${task.title}`);
    return;
  }
  for (const f of ["modelBoard", "garmentRef", "mockupRef", "artworkRef", "artHelperRef", "sceneRef"]) {
    if (task[f] && !fs.existsSync(task[f])) throw new Error(`${key}: referencia inexistente ${f}: ${task[f]}`);
  }

  const { prompt, images } = buildPrompt(task);
  if (dryRun) {
    console.log(`[dry] ${key} ${task.title}`);
    console.log(`      refs: ${images.map((i) => path.basename(i)).join(" | ")}`);
    return;
  }

  console.log(`[gen] ${key} ${task.title} (${task.tipo})`);
  const cliArgs = ["generate", "create", "nano_banana_pro", "--prompt", prompt, "--aspect_ratio", "1:1", "--resolution", "2k"];
  for (const img of images) cliArgs.push("--image", img);
  cliArgs.push("--wait", "--wait-timeout", "20m", "--json");

  const { stdout } = await runCommand(process.execPath, [higgsfieldCli, ...cliArgs]);
  const start = Math.min(...["[", "{"].map((c) => stdout.indexOf(c)).filter((i) => i >= 0));
  const parsed = JSON.parse(stdout.slice(start));
  const job = Array.isArray(parsed) ? parsed[0] : parsed;
  const url = job?.result_url || job?.results?.[0]?.url;
  if (!url) throw new Error(`${key}: sem result_url no retorno do CLI`);

  await download(url, task.output);
  state.tasks[key] = { ...task, status: "completed", completedAt: new Date().toISOString() };
  saveState(state);
  console.log(`[ok]  ${key} -> ${task.output}`);
}

async function main() {
  let tasks = tasksDoc.tasks || tasksDoc;
  if (limit > 0) tasks = tasks.slice(0, limit);
  const state = loadState();
  console.log(`${tasks.length} tarefas | concurrency ${concurrency} | ${dryRun ? "DRY-RUN" : "pra valer"}`);

  let idx = 0;
  const falhas = [];
  const worker = async () => {
    while (idx < tasks.length) {
      const t = tasks[idx++];
      try {
        await generate(t, state);
      } catch (err) {
        console.error(`[ERRO] ${t.productId}:${t.color} ${err.message.split("\n")[0]}`);
        falhas.push({ key: `${t.productId}:${t.color}`, erro: err.message.split("\n")[0] });
        state.tasks[`${t.productId}:${t.color}`] = { ...t, status: "failed", error: err.message.slice(0, 500) };
        saveState(state);
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log(`\nconcluido. falhas: ${falhas.length}`);
  falhas.forEach((f) => console.log(`   ${f.key}: ${f.erro}`));
  process.exit(falhas.length ? 1 : 0);
}

main();

// Gerador v3 das fotos lifestyle NIMBUS (Higgsfield nano_banana_pro).
//
// O que muda em relacao ao v2, e por que:
//
//  1. TRAVA DE PECA (garmentLock). A auditoria visual de 18/07 pegou duas capas no ar
//     mostrando peca de MANGA COMPRIDA em produto de manga curta. O v2 ja passava a
//     foto da peca como referencia, mas nunca DIZIA em palavras que tipo de peca era;
//     o modelo tratava a manga como escolha de estilo. Agora cada peca tem uma trava
//     escrita, com o que a manga faz e o que e proibido.
//
//  2. TRAVA DE ESCALA POR GEOMETRIA (composicao). "nao maior que o mockup" nunca
//     funcionou: o modelo nao mede, ele compoe. O que funciona (rodadas 4-6) e
//     descrever ESPACO VAZIO. O v3 recebe a geometria medida do mockup de cada peca
//     (faixa vazia acima, altura da arte, faixa vazia abaixo, largura vs ombros) e
//     escreve isso como instrucao de composicao, em numeros reais daquele produto.
//
//  3. CHECKLIST FINAL. O modelo troca uma restricao por outra quando a lista e longa
//     (whack-a-mole das rodadas 4-6). A checklist repete as travas em forma de
//     pergunta no fim do prompt, onde pesa mais.
//
// Uso: node scripts/generate-lifestyle-v3.mjs <tasks.json> [--limit N] [--dry-run] [--force] [--concurrency N]

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
  console.error("Uso: node scripts/generate-lifestyle-v3.mjs <tasks.json> [--limit N] [--dry-run] [--force] [--concurrency N]");
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
const statePath = path.join(path.dirname(path.resolve(tasksPath)), "generation-state-v3.json");

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

// Trava de peca: o que a peca E, o que a manga faz, e o que e proibido.
// Escrito a partir dos defeitos reais: manga comprida em camiseta (352890896, 352718943),
// fit oversized em produto regular (352618935), capuz sumindo em moletom (352727892).
const GARMENT_LOCKS = {
  "Camiseta Premium":
    "GARMENT LOCK — this is a REGULAR-FIT SHORT-SLEEVE T-SHIRT. The sleeves are SHORT and end at mid-bicep, well above the elbow, leaving both forearms and elbows completely BARE. The shoulder seam sits exactly on the shoulder point and the body is straight and close-fitting, ending at the hip. It is FORBIDDEN to render long sleeves, three-quarter sleeves, wide kimono sleeves, a sweatshirt, a hoodie, a blouse, or a boxy oversized cut. If any fabric covers the forearm, the image is wrong.",
  "Camiseta Oversized Premium":
    "GARMENT LOCK — this is an OVERSIZED BOXY SHORT-SLEEVE T-SHIRT. The shoulder seam drops onto the upper arm and the sleeves are wide but still SHORT, ending just above the elbow, leaving both forearms and elbows completely BARE. The body is boxy and squared, ending at the hip. It is FORBIDDEN to render long sleeves, kimono or bell sleeves reaching the wrist, a sweatshirt, a hoodie or a robe. If any fabric covers the forearm or the wrist, the image is wrong.",
  "Moletom Canguru":
    "GARMENT LOCK — this is a PULLOVER HOODIE with a HOOD and a kangaroo pocket. The HOOD must be clearly visible, gathered against the nape and falling over the upper back, and the sleeves are LONG with ribbed cuffs at the wrist. It is FORBIDDEN to render it without a hood, as a crewneck, or with short sleeves.",
  "Blusão Moletom":
    "GARMENT LOCK — this is a CREWNECK SWEATSHIRT with NO hood: a plain round ribbed collar at the neck and nothing behind it. The sleeves are LONG with ribbed cuffs at the wrist. It is FORBIDDEN to render a hood, a hood cord, a zipper, or short sleeves.",
  Ecobag:
    "GARMENT LOCK — this is a flat cotton TOTE BAG with two straps, carried by hand or on the shoulder. Its entire printed face must be flat and fully visible. It is FORBIDDEN to render a backpack, a purse with a flap, or any worn garment as the product.",
};

function garmentLock(task) {
  if (task.garmentLock) return task.garmentLock;
  if (task.isEcobag) return GARMENT_LOCKS.Ecobag;
  return GARMENT_LOCKS[task.piece] || "";
}

// Trava de escala escrita como ESPACO VAZIO, com a geometria medida no mockup deste produto.
function compositionLock(task) {
  const g = task.composicao;
  if (!g) {
    if (task.sceneRef) {
      return "SCALE LOCK — the print must be EXACTLY the same size, in the exact same position on the garment, as it appears in the campaign-photo reference of the other color. This is the single most important requirement: the two photos will be shown side by side to the customer on hover, and any difference in print size between them is an immediate, visible defect. Do not resize, do not reinterpret the scale from the mockup — copy the size and placement pixel-for-pixel from the reference photo, changing only the garment color.";
    }
    return "SCALE LOCK — reproduce the print at exactly the size it has in the mockup reference relative to the garment. It must never be larger; when uncertain, render it clearly SMALLER. Leave a wide band of empty fabric below the print and bare fabric on both sides.";
  }
  const sup = Math.round(g.sup), alt = Math.round(g.alt), inf = Math.round(g.inf), larg = Math.round(g.larg);
  return [
    `SCALE AND COMPOSITION LOCK — the size of the print is the single most important requirement of this image, and previous attempts failed by making it too large. Compose it by EMPTY FABRIC, not by filling the garment:`,
    `the artwork starts a full ${sup} percent of the collar-to-hem length BELOW the collar — that upper band is EMPTY fabric with nothing printed on it;`,
    `the artwork itself covers only the middle ${alt} percent of the collar-to-hem length;`,
    `and the ENTIRE LOWER ${inf} PERCENT of the garment, down to the hem, is EMPTY fabric.`,
    `Across the body, the artwork spans only ${larg} percent of the shoulder-seam-to-shoulder-seam width, leaving a clear hand's width of bare fabric on each side; it must never reach the side seams or the underarms.`,
    `If you are unsure, render the artwork SMALLER — a print slightly too small is acceptable, a print too large makes the photo unusable.`,
  ].join(" ");
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

  push(task.modelBoard, `REFERENCE {N} is ${task.model}'s approved identity board: preserve the exact face, skin tone, hair, age and natural body proportions. ${modelIdentity[task.model]}.`);
  push(task.garmentRef, `REFERENCE {N} defines the exact ${task.garment}: match its color, cut, SLEEVE LENGTH, hood or handles and construction exactly.`);
  push(task.mockupRef, `REFERENCE {N} is the live YouDraw/Nuvemshop product mockup FOR THIS COLOR and is the authority for which side is printed, where the print sits and HOW BIG the print is relative to the garment.`);
  push(task.artworkRef, `REFERENCE {N} is the original artwork and is the authority for every line, color, word and signature.`);
  push(task.artHelperRef, `REFERENCE {N} is an APPROVED photo of a different garment carrying THIS EXACT SAME artwork, correctly printed: copy the artwork content precisely as it appears there (composition, colors, framing elements), adapted to this garment at the size specified below.`);
  push(task.sceneRef, `REFERENCE {N} is the approved campaign photo of this exact product in another color: match the SAME model, SAME scene, SAME framing, SAME pose, SAME natural light and — critically — the EXACT SAME print size and position, changing ONLY the garment color to ${task.color}.`);

  const pose =
    task.view === "back"
      ? "Full or three-quarter rear view, with the whole torso from collar to hem inside the frame so the print size can be judged, and enough body visible to read the garment silhouette."
      : task.isEcobag
        ? "Three-quarter front view while naturally carrying the ecobag so its entire printed face is clearly visible and flat."
        : "Three-quarter front view with the whole torso from collar to hem inside the frame so the print size can be judged.";

  const partes = [
    `Create one square photorealistic NIMBUS ${task.collection} ecommerce lifestyle image for "${task.title}" (${task.color} colorway).`,
    ...refs,
    garmentLock(task),
    compositionLock(task),
    `TEXT IS SACRED: every word and letter in the artwork must be copied EXACTLY, letter by letter, including small text, captions inside cartouches and the NIMBUS signature. Never invent, substitute, mirror or scramble glyphs. If a word is too small to paint sharply, keep it small and slightly soft but with the CORRECT letterforms.`,
    `PRINT-ON-FABRIC REALISM: the print is ink on fabric, not a sticker. It must follow every fold and wrinkle, fabric texture must show through the ink, the ink brightness must never exceed the brightest scene light, and there must be no cut-out halo, no rectangle and no separate background behind the art.`,
    `ARTWORK FIDELITY: reproduce the artwork's composition exactly as referenced — same figures, same framing elements, same ornaments, same ink colors. Do not add flags, fringes, seals, badges, captions or decorative elements that are not in the reference, and do not remove or simplify any that are.`,
    pose,
    `${sceneDescription(task.collection)}, realistic fabric folds, realistic skin, hands and anatomy, 50 mm editorial photography. Hands, when visible, must have five separate fingers.`,
    `The garment color is ${task.color} and must read unambiguously as ${task.color}.`,
    `The garment and print must be fully legible and commercially useful in an ecommerce gallery. No other logos, no added text, no watermark, no duplicate person, no mannequin and no AI-looking skin.`,
  ];

  if (task.notes && task.notes.length) {
    partes.push(`Previous paid attempts FAILED with these exact defects; do not repeat any of them: ${task.notes.join("; ")}.`);
  }

  // Checklist final: as travas viram perguntas, no fim, onde pesam mais.
  const checklist = [
    `BEFORE YOU FINISH, verify each of these and fix the image if any answer is no:`,
    `(1) Are the sleeves exactly as specified in the GARMENT LOCK${/SHORT/.test(garmentLock(task)) ? ", with both forearms bare" : ", long and cuffed at the wrist"}?`,
    task.composicao ? `(2) Is there a wide band of EMPTY fabric below the print, covering the lower ${Math.round(task.composicao.inf)} percent of the garment down to the hem?` : task.sceneRef ? `(2) Is the print EXACTLY the same size as in the other-color reference photo — not larger, not smaller?` : `(2) Is there a wide band of EMPTY fabric below the print?`,
    `(3) Does the print stop a hand's width short of both side seams?`,
    `(4) Is every letter in the artwork spelled exactly as in the artwork reference?`,
    `(5) Does the ink follow the fabric folds instead of sitting flat like a sticker?`,
  ].join(" ");
  partes.push(checklist);

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
  const key = `${task.productId}:${task.color}:${task.tag || "v3"}`;
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
    console.log(`\n[dry] ${key} ${task.title}`);
    console.log(`      refs: ${images.map((i) => path.basename(i)).join(" | ")}`);
    console.log(`      prompt (${prompt.length} chars):\n${prompt}\n`);
    return;
  }

  console.log(`[gen] ${key} ${task.title}`);
  const cliArgs = ["generate", "create", "nano_banana_pro", "--prompt", prompt, "--aspect_ratio", "1:1", "--resolution", "2k"];
  for (const img of images) cliArgs.push("--image", img);
  cliArgs.push("--wait", "--wait-timeout", "20m", "--json");

  const { stdout } = await runCommand(process.execPath, [higgsfieldCli, ...cliArgs]);
  const start = Math.min(...["[", "{"].map((c) => stdout.indexOf(c)).filter((i) => i >= 0));
  const payload = JSON.parse(stdout.slice(start));
  const job = Array.isArray(payload) ? payload[0] : payload;
  const url =
    job?.results?.raw?.url || job?.results?.min?.url ||
    job?.results?.[0]?.url || job?.result?.url ||
    job?.raw_result_url || job?.min_result_url || job?.url || null;
  if (!url) throw new Error(`${key}: job sem URL de resultado: ${JSON.stringify(job).slice(0, 400)}`);

  await download(url, task.output);
  state.tasks[key] = { status: "completed", output: task.output, jobId: job?.id || null, url, at: new Date().toISOString() };
  saveState(state);
  console.log(`[ok]   ${key} -> ${path.basename(task.output)}`);
}

const tasks = (tasksDoc.tasks || []).slice(0, limit || undefined);
const state = loadState();
console.log(`${tasks.length} tarefas${dryRun ? " (dry-run)" : ""}, concorrencia ${concurrency}`);

let cursor = 0;
const falhas = [];
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    try {
      await generate(task, state);
    } catch (e) {
      console.error(`[erro] ${task.productId}:${task.color} ${e.message.slice(0, 300)}`);
      falhas.push({ productId: task.productId, color: task.color, erro: e.message.slice(0, 300) });
    }
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));

if (falhas.length) {
  console.log(`\n${falhas.length} falhas:`);
  falhas.forEach((f) => console.log(`  ${f.productId}:${f.color} ${f.erro}`));
  process.exitCode = 1;
} else if (!dryRun) {
  console.log("\ntodas as tarefas concluidas");
}

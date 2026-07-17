import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = "C:\\Users\\rober\\Nimbus";
const campaignRoot = path.join(
  workspace,
  "nuvemshop",
  "assets",
  "product-lifestyle",
  "2026-07-16",
);
const statePath = path.join(campaignRoot, "generation-state.json");
const backupDir = path.join(campaignRoot, "review", "before-correction");
const nodeCommand = process.execPath;
const higgsfieldCli = path.join(
  process.env.APPDATA || "C:\\Users\\rober\\AppData\\Roaming",
  "npm",
  "node_modules",
  "@higgsfield",
  "cli",
  "bin",
  "higgsfield.js",
);

const defaultIds = [
  352728277,
  352728357,
  352728524,
  352721197,
  352726673,
  352720257,
  352720127,
  352718275,
  352703343,
  352702753,
  352702796,
  352619175,
  352618935,
  352723243,
];

const idsIndex = process.argv.indexOf("--ids");
const selectedIds =
  idsIndex >= 0 && process.argv[idsIndex + 1]
    ? process.argv[idsIndex + 1]
        .split(",")
        .map((value) => Number(value.trim()))
        .filter(Number.isFinite)
    : defaultIds;
const concurrencyIndex = process.argv.indexOf("--concurrency");
const concurrency =
  concurrencyIndex >= 0 && process.argv[concurrencyIndex + 1]
    ? Math.max(1, Number(process.argv[concurrencyIndex + 1]))
    : 4;
const noArtwork = process.argv.includes("--no-artwork");

const productSpecificCorrection = {
  352720257:
    "The exact final print is high-contrast off-white or cream ink on the black T-shirt, never black, transparent or low-contrast.",
  352718275:
    "The exact final print is the blue, white and gold square azulejo composition with an ornate central cross shown in REFERENCE 2, never the green tropical-border cross variant.",
};

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: workspace,
      windowsHide: true,
      shell: false,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${stderr}\n${stdout}`));
        return;
      }
      resolve(stdout);
    });
  });
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  const temporary = `${destination}.corrected-download`;
  fs.writeFileSync(temporary, Buffer.from(await response.arrayBuffer()));
  fs.renameSync(temporary, destination);
}

function promptFor(product, includeArtwork) {
  const side = product.view === "front" ? "front" : "back";
  return [
    "Precision ecommerce correction.",
    "REFERENCE 1 is the approved photorealistic lifestyle image. Keep every pixel of the person, exact identity, face, hair, body, pose, hands, garment color, garment fit, folds, lighting, camera, crop and location unchanged.",
    `Change only the printed artwork on the ${side} of the garment.`,
    "REFERENCE 2 is the exact live YouDraw/Nuvemshop product mockup and is the absolute authority for the sold artwork, its orientation, exact relative scale and exact placement on the garment.",
    includeArtwork
      ? "REFERENCE 3 is the original transparent artwork and is the absolute authority for every line, color, letter, accent, word, symbol, signature and border."
      : "REFERENCE 2 is the only artwork authority. Do not borrow from any similar product or variant.",
    includeArtwork
      ? "Remove the current generated print completely and replace it with the exact artwork from REFERENCES 2 and 3 without redesigning or interpreting it."
      : "Remove the current generated print completely and replace it with the exact artwork from REFERENCE 2 without redesigning or interpreting it.",
    "Match the real-product print bounding box from REFERENCE 2. Never make the replacement larger than the mockup; if uncertain, err slightly smaller.",
    "Preserve all Portuguese spelling and typography exactly. Do not rearrange words, invent lettering, simplify figures, change saints, add a halo, remove a border or substitute a similar image.",
    productSpecificCorrection[product.productId] || "",
    "No other edits, no new text, no new logos and no watermark.",
  ].join(" ");
}

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
fs.mkdirSync(backupDir, { recursive: true });

const tasks = selectedIds.map((id) => {
  const product = state.products[String(id)];
  if (!product) throw new Error(`Missing product state: ${id}`);
  if (!fs.existsSync(product.output)) throw new Error(`Missing output: ${product.output}`);
  if (!fs.existsSync(product.hero)) throw new Error(`Missing hero mockup: ${product.hero}`);
  if (!product.artwork || !fs.existsSync(product.artwork)) {
    throw new Error(`Missing original artwork for ${id}: ${product.artwork}`);
  }
  return product;
});

async function correct(product) {
  const backup = path.join(
    backupDir,
    `${product.productId}-${path.basename(product.output)}`,
  );
  if (!fs.existsSync(backup)) fs.copyFileSync(product.output, backup);

  console.log(`[start] ${product.productId} ${product.title}`);
  const stdout = await runCommand(nodeCommand, [
    higgsfieldCli,
    "generate",
    "create",
    "nano_banana_pro",
    "--prompt",
    promptFor(product, !noArtwork),
    "--aspect_ratio",
    "1:1",
    "--resolution",
    "2k",
    "--image",
    product.output,
    "--image",
    product.hero,
    ...(noArtwork ? [] : ["--image", product.artwork]),
    "--wait",
    "--wait-timeout",
    "20m",
    "--json",
  ]);

  const jsonStart = stdout.indexOf("[");
  const objectStart = stdout.indexOf("{");
  const start =
    jsonStart >= 0 && (objectStart < 0 || jsonStart < objectStart)
      ? jsonStart
      : objectStart;
  if (start < 0) throw new Error(`No JSON returned: ${stdout}`);
  const payload = JSON.parse(stdout.slice(start));
  const job = Array.isArray(payload) ? payload[0] : payload;
  if (!job?.result_url) throw new Error(`No result URL: ${stdout}`);
  await download(job.result_url, product.output);

  const current = state.products[String(product.productId)];
  current.corrections = [
    ...(current.corrections || []),
    {
      jobId: job.id,
      resultUrl: job.result_url,
      correctedAt: new Date().toISOString(),
      backup,
    },
  ];
  current.status = "completed";
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  console.log(`[done] ${product.productId} ${product.title}`);
}

let cursor = 0;
let failures = 0;
await Promise.all(
  Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const product = tasks[cursor];
      cursor += 1;
      try {
        await correct(product);
      } catch (error) {
        failures += 1;
        console.error(`[failed] ${product.productId}\n${error.stack || error}`);
      }
    }
  }),
);

console.log(`Corrections finished: ${tasks.length - failures} ok, ${failures} failed.`);
if (failures) process.exitCode = 1;

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
const catalogPath = path.join(campaignRoot, "catalog", "nuvemshop-products.json");
const outputRoot = path.join(campaignRoot, "final");
const statePath = path.join(campaignRoot, "generation-state.json");
const higgsfieldCli = path.join(
  process.env.APPDATA || "C:\\Users\\rober\\AppData\\Roaming",
  "npm",
  "node_modules",
  "@higgsfield",
  "cli",
  "bin",
  "higgsfield.js",
);
const nodeCommand = process.execPath;

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const value = process.argv[index];
  if (!value.startsWith("--")) continue;
  const next = process.argv[index + 1];
  if (next && !next.startsWith("--")) {
    args.set(value, next);
    index += 1;
  } else {
    args.set(value, true);
  }
}

const onlyCollection = args.get("--collection")?.toUpperCase();
const onlyProductId = args.get("--product-id")
  ? Number(args.get("--product-id"))
  : null;
const limit = args.get("--limit") ? Number(args.get("--limit")) : Infinity;
const concurrency = args.get("--concurrency")
  ? Math.max(1, Number(args.get("--concurrency")))
  : 4;
const dryRun = args.has("--dry-run");
const force = args.has("--force");

const modelBoards = {
  Caio: path.join(campaignRoot, "casting", "caio-reference-board-v1.png"),
  Clara: path.join(campaignRoot, "casting", "clara-reference-board-v1.png"),
  Gabriel: path.join(campaignRoot, "casting", "gabriel-reference-board-v1.png"),
  Helena: path.join(campaignRoot, "casting", "helena-reference-board-v1.png"),
};

const modelIdentity = {
  Caio:
    "short tight natural curls, subtle beard and slim body exactly as shown; never straight hair, never a clean-shaven replacement and never a different facial structure",
  Clara:
    "dark brown hair tied naturally with loose strands, warm medium-light skin and real body proportions exactly as shown; never a different hairstyle or facial structure",
  Gabriel:
    "very short hair, dark skin and athletic natural body exactly as shown; never longer hair or a different facial structure",
  Helena:
    "natural shoulder-length curls, dark skin and real body proportions exactly as shown; never straight hair or a different facial structure",
};

const modelByFamily = {
  "Acima de Tudo Grafite": "Gabriel",
  "Anjo da Guarda Stencil": "Caio",
  "Aparecida Spray": "Helena",
  "Espírito Santo Spray": "Clara",
  "Fé Wildstyle": "Gabriel",
  "NIMBUS Wildstyle": "Caio",
  "Querubim Spray": "Caio",
  "Sagrado Coração Spray": "Helena",
  "São Miguel Vitorioso": "Gabriel",
  "Acima de Tudo Gótico": "Gabriel",
  "Aparecida Barroca": "Helena",
  "Azulejo Sagrado": "Clara",
  "Brasão NIMBUS": "Caio",
  "Deus é Fiel": "Gabriel",
  "Fé Acima de Tudo": "Clara",
  "Monograma NIMBUS": "Caio",
  "Salmo 19": "Gabriel",
  "São Jorge Neobarroco": "Helena",
  "São Jorge Vintage": "Caio",
  "São Miguel Vintage": "Clara",
  "São Miguel Celeste": "Gabriel",
};

const originalArtworkByFamily = {
  "Acima de Tudo Grafite": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Acima de Tudo [Camiseta+Oversized] [frente e verso]",
    "costas - Acima de Tudo (tags).png",
  ),
  "Anjo da Guarda Stencil": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Anjo da Guarda [Camiseta+Oversized] [frente e verso]",
    "costas - Anjo da Guarda.png",
  ),
  "Aparecida Spray": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Aparecida Spray [Camiseta+Oversized+Moletom+Blusão] [frente e verso]",
    "costas - Aparecida Spray (3).png",
  ),
  "Espírito Santo Spray": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Espírito Santo [Camiseta+Oversized] [frente e verso]",
    "costas - Espírito Santo (branco).png",
  ),
  "Fé Wildstyle": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Fé [Camiseta+Oversized+Moletom+Blusão] [frente e verso]",
    "costas - Fé (1).png",
  ),
  "NIMBUS Wildstyle": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Wildstyle [Camiseta+Oversized+Moletom+Blusão+Ecobag] [frente e verso]",
    "costas - Wildstyle (azul).png",
  ),
  "Sagrado Coração Spray": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Sagrado Coração Spray [Camiseta+Oversized] [frente e verso]",
    "costas - Sagrado Coração Spray (preto).png",
  ),
  "São Miguel Vitorioso": path.join(
    workspace,
    "designs",
    "prontos",
    "STREET",
    "mockups",
    "Arcanjo Spray [Camiseta+Oversized+Moletom+Blusão] [frente e verso]",
    "costas - Arcanjo Spray (branco).png",
  ),
  "Acima de Tudo Gótico": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Acima de Tudo Gótico [Camiseta+Oversized] [só frente]",
    "Acima de Tudo Gótico (branco).png",
  ),
  "Aparecida Barroca": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Aparecida Ouro [Camiseta+Oversized] [frente e verso]",
    "costas - Aparecida Ouro.png",
  ),
  "Azulejo Sagrado": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Azulejo [Camiseta+Oversized] [frente e verso]",
    "costas - Azulejo (1).png",
  ),
  "Brasão NIMBUS": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Brasão [Camiseta+Oversized] [frente e verso]",
    "costas - Brasão.png",
  ),
  "Deus é Fiel": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Deus é Fiel [Camiseta+Oversized] [frente e verso]",
    "costas - Deus é Fiel.png",
  ),
  "Fé Acima de Tudo": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Fé Acima de Tudo [Camiseta+Oversized] [frente e verso]",
    "costas - Fé Acima de Tudo (branco).png",
  ),
  "Monograma NIMBUS": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Monograma NMB [Camiseta+Oversized] [só frente]",
    "Monograma NMB.png",
  ),
  "Salmo 19": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "Salmo 19 [Camiseta+Oversized+Moletom+Blusão] [frente e verso]",
    "costas - Salmo 19.png",
  ),
  "São Jorge Neobarroco": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "São Jorge Ouro [Camiseta+Oversized+Moletom+Blusão] [frente e verso]",
    "costas - São Jorge Ouro (1).png",
  ),
  "São Jorge Vintage": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "São Jorge Vintage [Camiseta+Oversized+Moletom+Blusão] [frente e verso]",
    "costas - São Jorge Vintage.png",
  ),
  "São Miguel Vintage": path.join(
    workspace,
    "designs",
    "prontos",
    "RELIQUIA",
    "mockups",
    "São Miguel Vintage [Camiseta+Oversized] [frente e verso]",
    "costas - São Miguel Vintage (1).png",
  ),
  "São Miguel Celeste": path.join(
    workspace,
    "designs",
    "prontos",
    "NUVEM",
    "mockups",
    "São Miguel Celeste [Camiseta+Oversized] [frente e verso]",
    "costas - São Miguel Celeste.png",
  ),
};

const approvedQuerubim = {
  352725749: path.join(
    campaignRoot,
    "street",
    "querubim-spray",
    "oversized-preta-caio-v1.png",
  ),
  352725852: path.join(
    campaignRoot,
    "street",
    "querubim-spray",
    "camiseta-premium-preta-caio-v1.png",
  ),
};

const frontOnlyFamilies = new Set([
  "Acima de Tudo Gótico",
  "Monograma NIMBUS",
]);

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitTitle(title) {
  const [family, piece = "Produto"] = title.split("|").map((part) => part.trim());
  return { family, piece };
}

function representativeColor(product, family) {
  if (family === "NIMBUS Wildstyle" && product.title.includes("Oversized")) {
    return product.colors.includes("Off-White") ? "Off-White" : product.colors[0];
  }
  if (family === "Aparecida Barroca" && product.colors.includes("Off-White")) {
    return "Off-White";
  }
  if (family === "Acima de Tudo Grafite" && product.colors.includes("Off-White")) {
    return "Off-White";
  }
  if (product.colors.includes("Preta")) return "Preta";
  if (product.colors.includes("Branca")) return "Branca";
  if (product.colors.includes("Off-White")) return "Off-White";
  return product.colors[0] || "Natural";
}

function galleryPath(product, index) {
  const directory = path.join(workspace, product.referenceDirectory);
  const files = fs
    .readdirSync(directory)
    .filter((name) => /^gallery-\d+\./i.test(name))
    .sort();
  return files[index] ? path.join(directory, files[index]) : null;
}

function selectReferences(product, family, color) {
  if (family === "NIMBUS Wildstyle" && product.title.includes("Ecobag")) {
    return {
      front: galleryPath(product, 0),
      hero: galleryPath(product, 0),
      artwork: originalArtworkByFamily[family],
      view: "front",
    };
  }

  const colorUrl = product.colorImages?.[color];
  let frontIndex = colorUrl ? product.gallery.indexOf(colorUrl) : 0;
  if (frontIndex < 0) frontIndex = 0;
  const view = frontOnlyFamilies.has(family) ? "front" : "back";
  const heroIndex =
    view === "front" ? frontIndex : Math.min(frontIndex + 1, product.gallery.length - 1);

  return {
    front: galleryPath(product, frontIndex),
    hero: galleryPath(product, heroIndex),
    artwork: originalArtworkByFamily[family],
    view,
  };
}

function garmentDescription(piece, color) {
  if (/Ecobag/i.test(piece)) {
    return "natural cotton canvas ecobag with realistic handles and structure";
  }
  if (/Oversized/i.test(piece)) {
    return `${color} heavyweight premium oversized T-shirt, boxy silhouette, dropped shoulders and long wide sleeves`;
  }
  if (/Camiseta Premium/i.test(piece)) {
    return `${color} premium regular-fit T-shirt, standard silhouette and shorter sleeves`;
  }
  if (/Canguru/i.test(piece)) {
    return `${color} pullover kangaroo hoodie with hood, kangaroo pocket and ribbed cuffs`;
  }
  if (/Blusão/i.test(piece)) {
    return `${color} premium crewneck sweatshirt with ribbed collar, cuffs and hem`;
  }
  return `${color} premium streetwear garment`;
}

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
  const pose =
    task.view === "back"
      ? "Full or three-quarter rear view, with enough body visible to understand the exact garment silhouette."
      : task.isEcobag
        ? "Three-quarter front view while naturally carrying the ecobag so its entire printed face is clearly visible."
        : "Three-quarter front view with enough body visible to understand the exact garment silhouette.";
  const references = task.artwork
    ? "REFERENCE 4 is the original transparent artwork and is the authority for every line, color, word and signature."
    : "REFERENCE 3 is also the final authority for every line, color, word and signature.";

  return [
    `Create one square photorealistic NIMBUS ${task.collection} ecommerce lifestyle image for "${task.title}".`,
    `REFERENCE 1 is ${task.model}'s approved identity board: preserve the exact face, skin tone, hair, age and natural body proportions. ${modelIdentity[task.model]}.`,
    `REFERENCE 2 defines the exact ${task.garment}, including garment color, fit, sleeves, hood or handles, and construction.`,
    `REFERENCE 3 is the exact live YouDraw/Nuvemshop product mockup and is the authority for print side, print position and real print scale.`,
    references,
    `Reproduce the sold product exactly. Apply the artwork unchanged and keep the same relative graphic bounding box and placement shown in REFERENCE 3. The print must never be larger than it appears in REFERENCE 3; if there is any uncertainty, make it slightly smaller rather than larger. REFERENCE 4, when present, defines artwork content only and must never override the print scale from REFERENCE 3. Do not enlarge, redraw, crop, simplify, replace lettering, invent symbols, alter signatures or add elements.`,
    pose,
    `${sceneDescription(task.collection)}, realistic fabric folds, realistic skin, hands and anatomy, 50 mm editorial photography.`,
    "The garment and print must be fully legible and commercially useful as the first image in an ecommerce gallery. No other logos, no added text, no watermark, no duplicate person, no mannequin and no AI-looking skin.",
  ].join(" ");
}

function loadState() {
  if (!fs.existsSync(statePath)) return { updatedAt: null, products: {} };
  return JSON.parse(fs.readFileSync(statePath, "utf8"));
}

function saveState(state) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function runCommand(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
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
        reject(
          new Error(
            `Command failed (${code}): ${command} ${commandArgs.join(" ")}\n${stderr}\n${stdout}`,
          ),
        );
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, buffer);
}

async function generate(task, state) {
  const existing = state.products[String(task.productId)];
  if (!force && existing?.status === "completed" && fs.existsSync(existing.output)) {
    console.log(`[skip] ${task.productId} ${task.title}`);
    return;
  }

  if (approvedQuerubim[task.productId]) {
    fs.mkdirSync(path.dirname(task.output), { recursive: true });
    fs.copyFileSync(approvedQuerubim[task.productId], task.output);
    state.products[String(task.productId)] = {
      ...task,
      status: "completed",
      source: "approved-existing",
      output: task.output,
      completedAt: new Date().toISOString(),
    };
    saveState(state);
    console.log(`[approved] ${task.productId} ${task.title}`);
    return;
  }

  const commandArgs = [
    "generate",
    "create",
    "nano_banana_pro",
    "--prompt",
    task.prompt,
    "--aspect_ratio",
    "1:1",
    "--resolution",
    "2k",
    "--image",
    task.modelBoard,
    "--image",
    task.front,
    "--image",
    task.hero,
  ];
  if (task.artwork && fs.existsSync(task.artwork)) {
    commandArgs.push("--image", task.artwork);
  }
  commandArgs.push("--wait", "--wait-timeout", "20m", "--json");

  state.products[String(task.productId)] = {
    ...task,
    status: "running",
    startedAt: new Date().toISOString(),
  };
  saveState(state);
  console.log(`[start] ${task.productId} ${task.title}`);

  try {
    const result = await runCommand(nodeCommand, [
      higgsfieldCli,
      ...commandArgs,
    ]);
    const jsonStart = result.stdout.indexOf("[");
    const objectStart = result.stdout.indexOf("{");
    const start =
      jsonStart >= 0 && (objectStart < 0 || jsonStart < objectStart)
        ? jsonStart
        : objectStart;
    if (start < 0) throw new Error(`No JSON returned: ${result.stdout}`);
    const payload = JSON.parse(result.stdout.slice(start));
    const job = Array.isArray(payload) ? payload[0] : payload;
    if (!job?.result_url) throw new Error(`No result_url returned: ${result.stdout}`);
    await download(job.result_url, task.output);
    state.products[String(task.productId)] = {
      ...task,
      status: "completed",
      jobId: job.id,
      resultUrl: job.result_url,
      output: task.output,
      completedAt: new Date().toISOString(),
    };
    saveState(state);
    console.log(`[done] ${task.productId} ${task.title} -> ${task.output}`);
  } catch (error) {
    state.products[String(task.productId)] = {
      ...task,
      status: "failed",
      error: error.stack || String(error),
      failedAt: new Date().toISOString(),
    };
    saveState(state);
    console.error(`[failed] ${task.productId} ${task.title}\n${error.stack || error}`);
  }
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const state = loadState();
  let products = catalog.products;
  if (onlyCollection) {
    products = products.filter((product) => product.collection === onlyCollection);
  }
  if (onlyProductId) {
    products = products.filter((product) => product.productId === onlyProductId);
  }
  products = products.slice(0, limit);

  const tasks = products.map((product) => {
    const { family, piece } = splitTitle(product.title);
    const color = representativeColor(product, family);
    const references = selectReferences(product, family, color);
    const model =
      family === "NIMBUS Wildstyle" && piece.includes("Ecobag")
        ? "Clara"
        : modelByFamily[family];
    if (!model) throw new Error(`No model mapping for ${family}`);
    if (!references.front || !references.hero) {
      throw new Error(`Missing gallery references for ${product.productId}`);
    }

    const output = path.join(
      outputRoot,
      product.collection.toLowerCase(),
      slugify(family),
      `${product.productId}-${slugify(piece)}-${slugify(color)}.png`,
    );
    const task = {
      productId: product.productId,
      title: product.title,
      collection: product.collection,
      family,
      piece,
      color,
      model,
      modelBoard: modelBoards[model],
      garment: garmentDescription(piece, color),
      front: references.front,
      hero: references.hero,
      artwork: references.artwork,
      view: references.view,
      isEcobag: piece.includes("Ecobag"),
      output,
      productUrl: product.url,
    };
    task.prompt = buildPrompt(task);
    return task;
  });

  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(
    path.join(campaignRoot, "generation-tasks.json"),
    `${JSON.stringify(tasks, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Prepared ${tasks.length} task(s), concurrency ${concurrency}${dryRun ? " (dry run)" : ""}.`,
  );
  if (dryRun) return;

  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    async () => {
      while (cursor < tasks.length) {
        const task = tasks[cursor];
        cursor += 1;
        await generate(task, state);
      }
    },
  );
  await Promise.all(workers);

  const selectedIds = new Set(tasks.map((task) => String(task.productId)));
  const summary = Object.entries(state.products)
    .filter(([productId]) => selectedIds.has(productId))
    .reduce((counts, [, product]) => {
      counts[product.status] = (counts[product.status] || 0) + 1;
      return counts;
    }, {});
  console.log(`Batch finished: ${JSON.stringify(summary)}`);
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

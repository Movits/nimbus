#!/usr/bin/env node
/**
 * Portão loja:segredos: nenhuma chave no repositório, que é público.
 *
 * Nasceu com o servidor da loja própria (plano de 13/11/2026, seção 3): o token
 * do Mercado Pago, o segredo do webhook, a chave do Resend e o token da
 * Cloudflare moram só no cofre do Worker (`wrangler secret`) e nos segredos do
 * GitHub. Este portão procura, em todo arquivo versionado, o formato dessas
 * chaves e os arquivos de segredo local do wrangler (.dev.vars) e do Node (.env).
 *
 * Uso: node scripts/verifica-segredos.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join, dirname, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PADROES = [
  ["token do Mercado Pago", /\b(?:APP_USR|TEST)-\d{6,}-\d{6}-[0-9a-f]{32}-\d{6,}\b/],
  ["chave do Resend", /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{16,}\b/],
  ["token do GitHub", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["chave secreta do Stripe", /\b[sr]k_live_[A-Za-z0-9]{20,}\b/],
  ["chave da AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["chave privada", /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/],
  ["segredo atribuído no código", /\b(?:CLOUDFLARE_API_TOKEN|MP_ACCESS_TOKEN|MP_WEBHOOK_SECRET|RESEND_API_KEY|TURNSTILE_SECRET|SAL_IP)\s*[=:]\s*["']?[A-Za-z0-9_\-]{24,}/],
];

// Arquivo de segredo local nunca entra no git, com qualquer conteúdo.
const ARQUIVOS_PROIBIDOS = /^(?:\.dev\.vars(?:\..+)?|\.env(?:\.(?!example$).+)?)$/;

const BINARIO = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".otf",
  ".mp4", ".mov", ".webm", ".mp3", ".wav", ".pdf", ".zip", ".glb", ".gltf", ".bin", ".ktx2", ".hdr", ".exr",
  ".psd", ".afdesign", ".afphoto", ".tif", ".tiff",
]);
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

const arquivos = execFileSync("git", ["-C", RAIZ, "ls-files", "-z"], { encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
  .split("\0")
  .filter(Boolean);

const achados = [];
let lidos = 0;
for (const rel of arquivos) {
  if (ARQUIVOS_PROIBIDOS.test(basename(rel))) {
    achados.push(`${rel}: arquivo de segredo local versionado`);
    continue;
  }
  if (BINARIO.has(extname(rel).toLowerCase())) continue;
  const caminho = join(RAIZ, rel);
  let tamanho;
  try {
    tamanho = statSync(caminho).size;
  } catch {
    continue; // apagado no disco e ainda no índice
  }
  if (tamanho > TAMANHO_MAXIMO) continue;
  const texto = readFileSync(caminho, "utf8");
  lidos++;
  const linhas = texto.split("\n");
  for (const [nome, re] of PADROES) {
    linhas.forEach((linha, i) => {
      if (re.test(linha)) achados.push(`${rel}:${i + 1}: parece ${nome}`);
    });
  }
}

if (achados.length) {
  console.error("loja:segredos REPROVOU. Tire a chave do arquivo, troque a chave na origem (ela vazou) e guarde a nova só no cofre:");
  for (const a of achados) console.error("  - " + a);
  process.exit(1);
}
console.log(`loja:segredos: ${lidos} arquivos de texto lidos, nenhuma chave encontrada`);

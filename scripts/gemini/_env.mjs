import fs from "node:fs";
import path from "node:path";

export function loadKey() {
  const envPath = path.join(process.cwd(), ".env");
  const txt = fs.readFileSync(envPath, "utf8");
  const m = txt.match(/^GEMINI_API_KEY=(.+)$/m);
  if (!m) throw new Error("GEMINI_API_KEY não encontrada em .env");
  return m[1].trim();
}

export const API = "https://generativelanguage.googleapis.com/v1beta";

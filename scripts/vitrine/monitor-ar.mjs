#!/usr/bin/env node
/**
 * Monitor do AR: o que o visitante vê hoje nos três endereços.
 *
 * Nasceu no teste de 20/10/2026: com a loja fechada, o parity-variantes
 * conferia 0 produtos e o monitor diário ficava verde sem vigiar nada,
 * enquanto a loja mostrava "Produto de exemplo" com desconto falso e as
 * coleções vazias da vitrine seguiam no ar. Este portão confere o que importa
 * em qualquer estado da loja:
 *   1. landing, vitrine e loja respondem 200;
 *   2. as páginas institucionais da vitrine respondem 200;
 *   3. nenhuma página da loja mostra produto de exemplo do tema;
 *   4. com a vitrine fechada, /loja/c/* não tem coleção: só um redirecionamento
 *      sem índice para /natal/ (o menu da loja Nuvemshop aponta para lá).
 *
 * Sai com código 1 se algo falhar. SKIP_REDE=1 pula (CI sem rede).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.SKIP_REDE === "1") {
  console.log("monitor-ar: SKIP_REDE=1, pulando.");
  process.exit(0);
}

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gerador = readFileSync(join(RAIZ, "scripts/vitrine/build-paginas.mjs"), "utf8");
const aberta = /const VITRINE_ABERTA = true/.test(gerador);

const UA = { "user-agent": "Mozilla/5.0 (compatible; NimbusMonitor/1.0)" };
const pega = async (url) => {
  try {
    const r = await fetch(url, { headers: UA, redirect: "follow" });
    return { status: r.status, corpo: await r.text() };
  } catch (e) {
    return { status: 0, corpo: "", erro: String(e.message || e) };
  }
};

const falhas = [];
const ok = [];

for (const url of [
  "https://nimbuswear.com.br/",
  "https://nimbuswear.com.br/loja/",
  "https://nimbuswear.com.br/loja/manifesto/",
  "https://nimbuswear.com.br/loja/impacto/",
  "https://nimbuswear.com.br/loja/envios/",
  "https://nimbuswear.com.br/loja/trocas/",
  "https://nimbuswear.com.br/loja/privacidade/",
  "https://loja.nimbuswear.com.br/",
]) {
  const r = await pega(url);
  (r.status === 200 ? ok : falhas).push(`${r.status} ${url}${r.erro ? ` (${r.erro})` : ""}`);
}

for (const url of [
  "https://loja.nimbuswear.com.br/",
  "https://loja.nimbuswear.com.br/produtos/",
  "https://loja.nimbuswear.com.br/street/",
  "https://loja.nimbuswear.com.br/reliquia/",
  "https://loja.nimbuswear.com.br/nuvem/",
]) {
  const r = await pega(url);
  const n = (r.corpo.match(/Produto de exemplo/gi) || []).length;
  if (n) falhas.push(`${url}: ${n} "Produto de exemplo" do tema no ar (preço e desconto falsos)`);
  else ok.push(`sem produto de exemplo: ${url}`);
}

if (!aberta) {
  for (const c of ["street", "reliquia", "nuvem"]) {
    const url = `https://nimbuswear.com.br/loja/c/${c}/`;
    const r = await pega(url);
    const redireciona = r.status === 200 && /noindex/.test(r.corpo) && /url=\/natal\//.test(r.corpo);
    if (redireciona) ok.push(`${url} redireciona para /natal/ (fechada, como deve)`);
    else if (r.status === 200) falhas.push(`${url}: coleção no ar com a vitrine fechada`);
    else falhas.push(`${r.status} ${url}: o menu da loja aponta para cá e dá erro`);
  }
}

console.log(`monitor-ar: ${ok.length} conferências ok, ${falhas.length} falha(s). Vitrine ${aberta ? "ABERTA" : "fechada"}.`);
for (const f of falhas) console.log(`  FALHA  ${f}`);
process.exit(falhas.length ? 1 : 0);

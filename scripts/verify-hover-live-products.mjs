import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";

const ROOT = process.cwd();
const MAP_PATH = path.join(ROOT, "scripts", "tmp_hover_auto_map.json");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function launchChrome() {
  const chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      "about:blank",
    ],
    {
      stdio: ["ignore", "ignore", "pipe"],
    },
  );

  const websocketUrl = new Promise((resolve, reject) => {
    let stderr = "";
    const timer = setTimeout(() => {
      reject(new Error(`Chrome nÃ£o abriu devtools. ${stderr}`));
    }, 12000);

    chrome.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });

    chrome.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome encerrou antes da validaÃ§Ã£o. CÃ³digo ${code}. ${stderr}`));
    });
  });

  return {
    chrome,
    websocketUrl,
    async close() {
      if (chrome.exitCode === null) {
        const exited = new Promise((resolve) => chrome.once("exit", resolve));
        chrome.kill();
        await Promise.race([exited, wait(2000)]);
      }
    },
  };
}

class Cdp {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    const ws = await this.url;
    this.socket = new WebSocket(ws);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify(payload));
    });
  }

  close() {
    this.socket?.close();
  }
}

async function openPage(cdp, url, width, height) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
    screenHeight: height,
  }, sessionId);

  await cdp.send("Page.navigate", { url }, sessionId);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    }, sessionId);
    if (state.result?.value === "complete") break;
    await wait(100);
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const done = await cdp.send("Runtime.evaluate", {
      expression: "document.querySelectorAll('.js-item-product[data-product-id]').length > 0",
      returnByValue: true,
    }, sessionId);
    if (done.result?.value) break;
    await wait(200);
  }

  await wait(800);
  return { targetId, sessionId };
}

function buildExpectedMap() {
  const raw = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  const map = new Map();
  for (const row of raw.rows || []) {
    if (!row || !row.id) continue;
    const expectedSwap = row.shouldSwap ?? false;
    map.set(String(row.id), {
      expectedSwap,
      uniqueVariantImgs: Number.isFinite(row.uniqueVariantImgs) ? row.uniqueVariantImgs : 1,
      secondary: row.secondary || null,
      featured: row.featured || null,
      source: "auto_map",
    });
  }
  for (const id of raw.block || []) {
    const key = String(id);
    const existing = map.get(key);
    if (existing) {
      existing.expectedSwap = false;
      existing.source = "auto_map_block";
    } else {
      map.set(key, {
        expectedSwap: false,
        uniqueVariantImgs: 1,
        secondary: null,
        featured: null,
        source: "auto_map_block_only",
      });
    }
  }
  for (const id of raw.allow || []) {
    const key = String(id);
    const existing = map.get(key);
    if (existing) {
      existing.expectedSwap = true;
      if (existing.source === "auto_map") {
        existing.source = "auto_map_allow";
      }
    } else {
      map.set(key, {
        expectedSwap: true,
        uniqueVariantImgs: 2,
        secondary: null,
        featured: null,
        source: "auto_map_allow_only",
      });
    }
  }
  return map;
}

function parseCardListExpression() {
  return `(function() {
    const cards = Array.from(document.querySelectorAll('.js-item-product[data-product-id]'));
    return cards.map((card) => {
      return {
        id: String(card.dataset.productId || ""),
        url: window.location.pathname,
      };
    });
  })()`;
}

function cardStateExpression(id) {
  const safeId = String(id).replace(/"/g, '\\"');
  return `(function() {
    const card = document.querySelector('.js-item-product[data-product-id="${safeId}"]');
    if (!card) return null;
    const container = card.querySelector(".js-product-item-image-container-private") || card.querySelector(".product-item-image-container");
    const featured = card.querySelector(".item-image-featured");
    const secondary = card.querySelector(".item-image-secondary");
    const rect = card.getBoundingClientRect();
    const sample = (el) => {
      if (!el) return null;
      const srcset = el.getAttribute("data-srcset") || el.getAttribute("srcset") || el.getAttribute("src") || "";
      const nodeRect = el.getBoundingClientRect();
      return {
        srcset,
        src: el.getAttribute("src") || "",
        rect: {
          left: nodeRect.left,
          top: nodeRect.top,
          width: nodeRect.width,
          height: nodeRect.height,
        },
        opacity: Number(getComputedStyle(el).opacity || 0),
        transform: getComputedStyle(el).transform || "none",
        display: getComputedStyle(el).display || "none",
      };
    };
    return {
      id: String(card.dataset.productId || ""),
      url: window.location.pathname,
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      hasContainer: !!container,
      hasSecondary: !!secondary,
      secondaryDisabled: !!(container && container.classList.contains("secondary-images-disabled")),
      featured: sample(featured),
      secondaryImage: sample(secondary),
    };
  })()`;
}

function cardHoverRectExpression(id) {
  const safeId = String(id).replace(/"/g, '\\"');
  return `(function() {
    const card = document.querySelector('.js-item-product[data-product-id="${safeId}"]');
    if (!card) return null;
    card.scrollIntoView({ block: "center", inline: "center" });
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  })()`;
}

async function runPage(cdp, url, expectedMap, viewport = { width: 1500, height: 1200 }) {
  const page = await openPage(cdp, url, viewport.width, viewport.height);
  const cards = (await cdp.send("Runtime.evaluate", {
    expression: parseCardListExpression(),
    returnByValue: true,
  }, page.sessionId)).result.value;

  console.log(`  debug: encontrou ${cards.length} cards em ${url}`);
  if (!cards.length) {
    const counts = (await cdp.send("Runtime.evaluate", {
      expression: `
        ({
          all: document.querySelectorAll('[data-product-id]').length,
          jsItem: document.querySelectorAll('.js-item-product[data-product-id]').length,
          firstHtml: document.querySelector('[data-product-id]')?.outerHTML?.slice(0, 180) || "",
        })
      `,
      returnByValue: true,
    }, page.sessionId)).result.value;
    console.log(`  debug counts`, counts);
  }

  const results = [];
  for (const card of cards) {
    if (!card?.id) continue;
    const expected = expectedMap.get(card.id) || { expectedSwap: false, colors: [] };

    const before = (await cdp.send("Runtime.evaluate", {
      expression: cardStateExpression(card.id),
      returnByValue: true,
    }, page.sessionId)).result.value;
    if (!before) continue;
    if (!results.length) {
      console.log(`  debug primeira carta id=${card.id}`, before.rect);
    }

    const hoverRect = (await cdp.send("Runtime.evaluate", {
      expression: cardHoverRectExpression(card.id),
      returnByValue: true,
    }, page.sessionId)).result.value;
    if (!hoverRect || !hoverRect.width || !hoverRect.height) continue;

    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: hoverRect.x,
      y: hoverRect.y,
      buttons: 0,
      pointerType: "mouse",
    }, page.sessionId);
    // A transição publicada usa 450 ms; mede o estado final, não o meio do fade.
    await wait(650);

    const after = (await cdp.send("Runtime.evaluate", {
      expression: cardStateExpression(card.id),
      returnByValue: true,
    }, page.sessionId)).result.value;
    if (!after) continue;

    const beforeSecondaryOpacity = Number(before.secondaryImage?.opacity ?? 0);
    const beforeFeaturedOpacity = Number(before.featured?.opacity ?? 1);
    const afterSecondaryOpacity = Number(after.secondaryImage?.opacity ?? 0);
    const afterFeaturedOpacity = Number(after.featured?.opacity ?? 1);

    const didSwap = afterSecondaryOpacity > 0.5 && afterFeaturedOpacity < 0.5;
    const changed = Math.abs(afterSecondaryOpacity - beforeSecondaryOpacity) > 0.12 || Math.abs(afterFeaturedOpacity - beforeFeaturedOpacity) > 0.12;
    const hoverExpected = expected.expectedSwap;
    const pass = (hoverExpected && didSwap) || (!hoverExpected && !didSwap && (afterSecondaryOpacity < 0.12 || !after.hasSecondary));

    results.push({
      id: card.id,
      url: card.url,
      title: card.id,
      expectedSwap: hoverExpected,
      source: expected.source || "fallback",
      hasSecondary: before.hasSecondary,
      hasSecondaryDisabledClass: before.secondaryDisabled,
      beforeSecondaryOpacity,
      afterSecondaryOpacity,
      beforeFeaturedOpacity,
      afterFeaturedOpacity,
      pass,
      changed,
      didSwap,
    });

    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: 5,
      y: 5,
      buttons: 0,
      pointerType: "mouse",
    }, page.sessionId);
    await wait(80);
  }

  await cdp.send("Target.closeTarget", { targetId: page.targetId });
  return results;
}

async function main() {
  const expectedMap = buildExpectedMap();
  const hoverExpectedIds = [...expectedMap.entries()].filter(([, v]) => v.expectedSwap);
  console.log(`IDs com 2+ cores esperados para hover: ${hoverExpectedIds.length}`);

  const processChrome = launchChrome();
  const cdp = new Cdp(processChrome.websocketUrl);
  await cdp.connect();

  try {
    const pages = [
      "https://loja.nimbuswear.com.br/street",
      "https://loja.nimbuswear.com.br/reliquia",
      "https://loja.nimbuswear.com.br/nuvem",
      "https://loja.nimbuswear.com.br/produtos",
    ];

    const all = [];
    for (const url of pages) {
      console.log(`\nAbrindo ${url}`);
      const pageResults = await runPage(cdp, url, expectedMap);
      all.push(...pageResults);
      const failed = pageResults.filter((r) => !r.pass);
      console.log(`  cards: ${pageResults.length}, falhas: ${failed.length}`);
      if (failed.length) {
        for (const fail of failed) {
          console.log(`   - ${fail.id} esperado_swap=${fail.expectedSwap} had=${fail.hasSecondary} beforeSec=${fail.beforeSecondaryOpacity.toFixed(2)} afterSec=${fail.afterSecondaryOpacity.toFixed(2)} changed=${fail.changed}`);
        }
      }
    }

    const unique = [];
    const seen = new Set();
    for (const item of all) {
      const key = `${item.id}-${item.url}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    const byId = new Map();
    for (const item of unique) {
      const current = byId.get(item.id);
      if (!current) {
        byId.set(item.id, { ...item });
      } else if (item.expectedSwap !== current.expectedSwap) {
        current.pass = item.pass && current.pass;
      }
    }

    const list = [...byId.values()];
    const failures = list.filter((r) => !r.pass);
    const passes = list.filter((r) => r.pass);

    console.log(`\nResumo geral`);
    console.log(`Total observados: ${list.length}`);
    console.log(`Pass: ${passes.length}`);
    console.log(`Falhas: ${failures.length}`);

    if (failures.length > 0) {
      console.log("\nFalhas:");
      for (const fail of failures) {
        console.log(`- ${fail.id} [${fail.expectedSwap ? "DEVERIA_TROCAR" : "NAO_TROCAR"}] secores-> before:${fail.beforeSecondaryOpacity.toFixed(2)} after:${fail.afterSecondaryOpacity.toFixed(2)}; featured before:${fail.beforeFeaturedOpacity.toFixed(2)} after:${fail.afterFeaturedOpacity.toFixed(2)}; change=${fail.changed}; path=${fail.url}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("\nTodas as validaÃ§Ãµes de hover passaram no site real.");
  } finally {
    cdp.close();
    await processChrome.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

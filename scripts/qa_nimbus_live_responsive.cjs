const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = "C:\\Users\\rober\\Nimbus";
const outputDir = process.env.NIMBUS_QA_OUTPUT_DIR ||
  path.join(root, "nuvemshop", "qa", "2026-07-20-live");
const previewCssPath = process.env.NIMBUS_CSS_PREVIEW || "";
const previewCss = previewCssPath
  ? fs.readFileSync(previewCssPath, "utf8")
  : "";
const previewCssBase64 = previewCss
  ? Buffer.from(previewCss, "utf8").toString("base64")
  : "";
const profileDir = path.join(
  outputDir,
  `chrome-cdp-profile-${Date.now()}`,
);
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9300 + Math.floor(Math.random() * 300);

const cases = [
  { name: "desktop-1440", width: 1440, height: 900, mobile: false },
  { name: "mobile-645", width: 645, height: 900, mobile: true },
  { name: "mobile-390", width: 390, height: 844, mobile: true },
  { name: "mobile-320", width: 320, height: 800, mobile: true },
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForJson(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }

  throw lastError ?? new Error(`Timeout ao acessar ${url}`);
}

function createCdpClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  const pending = new Map();
  const eventWaiters = new Map();
  let nextId = 1;

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id != null) {
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) {
        waiter.reject(new Error(JSON.stringify(message.error)));
      } else {
        waiter.resolve(message.result);
      }
      return;
    }

    const waiters = eventWaiters.get(message.method);
    if (!waiters?.length) return;
    eventWaiters.delete(message.method);
    for (const resolve of waiters) resolve(message.params);
  });

  function send(method, params = {}) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  function waitForEvent(method, timeoutMs = 60_000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Timeout aguardando ${method}`)),
        timeoutMs,
      );
      const wrappedResolve = (value) => {
        clearTimeout(timer);
        resolve(value);
      };
      const waiters = eventWaiters.get(method) ?? [];
      waiters.push(wrappedResolve);
      eventWaiters.set(method, waiters);
    });
  }

  return {
    ready,
    send,
    waitForEvent,
    close: () => socket.close(),
  };
}

async function capture(client, filename) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  fs.writeFileSync(path.join(outputDir, filename), result.data, "base64");
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function main() {
  fs.mkdirSync(profileDir, { recursive: true });

  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    {
      stdio: "ignore",
      windowsHide: true,
    },
  );
  chrome.unref();

  let client;

  try {
    await waitForJson(`http://127.0.0.1:${port}/json/version`);
    const targets = await waitForJson(`http://127.0.0.1:${port}/json/list`);
    const pageTarget = targets.find((target) => target.type === "page");
    if (!pageTarget) throw new Error("Aba de teste do Chrome não encontrada");

    client = createCdpClient(pageTarget.webSocketDebuggerUrl);
    await client.ready;
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    const results = [];

    for (const item of cases) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: item.width,
        height: item.height,
        deviceScaleFactor: 1,
        mobile: item.mobile,
        screenWidth: item.width,
        screenHeight: item.height,
      });

      const url = `https://loja.nimbuswear.com.br/?nimbusqa=${Date.now()}-${item.name}`;
      const loaded = client.waitForEvent("Page.loadEventFired", 90_000);
      await client.send("Page.navigate", { url });
      await loaded;
      await delay(2_500);

      await evaluate(
        client,
        `(() => {
          const control = [...document.querySelectorAll("a, button")].find(
            (element) => element.textContent.trim() === "Entendi"
          );
          if (control) control.click();
          return Boolean(control);
        })()`,
      );
      await delay(300);

      if (previewCssBase64) {
        await evaluate(
          client,
          `(() => {
            const old = document.getElementById("nimbus-local-css-preview");
            if (old) old.remove();
            const style = document.createElement("style");
            style.id = "nimbus-local-css-preview";
            style.textContent = atob(${JSON.stringify(previewCssBase64)});
            document.head.appendChild(style);
            return style.textContent.length;
          })()`,
        );
        await delay(350);
      }

      await capture(client, `${item.name}-top.png`);

      const collectionStates = [];
      if (item.mobile) {
        const readCollectionState = () =>
          evaluate(
            client,
            `(() => {
              const info = (element) => {
                if (!element) return null;
                const box = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                return {
                  className: element.className,
                  left: Math.round(box.left * 10) / 10,
                  right: Math.round(box.right * 10) / 10,
                  width: Math.round(box.width * 10) / 10,
                  marginRight: style.marginRight,
                  transform: style.transform,
                  overflow: style.overflow,
                  backgroundImage: style.backgroundImage,
                  backgroundSize: style.backgroundSize
                };
              };
              const section = document.querySelector(".section-banners-home");
              const wrapper = section?.querySelector(".swiper-wrapper");
              const slides = section
                ? [...section.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)")]
                : [];
              return {
                scrollY,
                section: info(section),
                wrapper: info(wrapper),
                slides: slides.map((slide) => ({
                  slide: info(slide),
                  image: info(slide.querySelector(".textbanner-image")),
                  active: slide.classList.contains("swiper-slide-active")
                }))
              };
            })()`,
          );

        collectionStates.push(await readCollectionState());
        for (const slide of [2, 3]) {
          const advanced = await evaluate(
            client,
            `(() => {
              const button = document.querySelector(
                ".section-banners-home .swiper-button-next, section[data-store='home-banners'] .swiper-button-next"
              );
              if (button) button.click();
              return Boolean(button);
            })()`,
          );
          if (!advanced) break;
          await delay(650);
          await evaluate(client, "(() => { scrollTo(0, 0); return scrollY; })()");
          collectionStates.push(await readCollectionState());
          await capture(client, `${item.name}-collection-${slide}.png`);
        }
      }

      const metrics = await evaluate(
        client,
        `(() => {
          const rect = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const box = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              left: Math.round(box.left * 10) / 10,
              right: Math.round(box.right * 10) / 10,
              top: Math.round(box.top * 10) / 10,
              bottom: Math.round(box.bottom * 10) / 10,
              width: Math.round(box.width * 10) / 10,
              height: Math.round(box.height * 10) / 10,
              centerX: Math.round((box.left + box.width / 2) * 10) / 10,
              display: style.display,
              visibility: style.visibility,
              overflow: style.overflow,
              position: style.position
            };
          };
          const copyright = document.querySelector(
            "footer.js-footer > .text-left.text-md-center"
          );
          const poweredBy = document.querySelector(
            "footer.js-footer .powered-by-logo, footer.js-footer [class*='powered']"
          );
          const logo = document.querySelector(".head-main .js-logo-container");
          const manifesto = document.querySelector(
            "section[data-store='home-institutional-message']"
          );
          return {
            viewportWidth: innerWidth,
            viewportHeight: innerHeight,
            bodyScrollWidth: document.documentElement.scrollWidth,
            bodyScrollHeight: document.documentElement.scrollHeight,
            horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            logo: rect(".head-main .js-logo-container"),
            logoImage: rect(".head-main .js-logo-container img"),
            menu: rect(".head-main .head-logo-row .order-first"),
            cart: rect(".head-main .head-logo-row .order-last"),
            headerRow: rect(".head-main .head-logo-row > .container-fluid > .row"),
            headerVerticalOffsets: (() => {
              const box = (selector) => document.querySelector(selector)?.getBoundingClientRect();
              const row = box(".head-main .head-logo-row > .container-fluid > .row");
              const image = box(".head-main .js-logo-container img");
              const menu = box(".head-main .head-logo-row .order-first");
              const cart = box(".head-main .head-logo-row .order-last");
              const cy = (value) => value ? value.top + value.height / 2 : null;
              return {
                logoFromRow: row && image ? Math.round((cy(image) - cy(row)) * 10) / 10 : null,
                menuFromRow: row && menu ? Math.round((cy(menu) - cy(row)) * 10) / 10 : null,
                cartFromRow: row && cart ? Math.round((cy(cart) - cy(row)) * 10) / 10 : null
              };
            })(),
            manifesto: rect("section[data-store='home-institutional-message']"),
            manifestoRow: rect("section[data-store='home-institutional-message'] .row.position-relative"),
            manifestoTitle: rect("section[data-store='home-institutional-message'] h2"),
            manifestoBody: rect("section[data-store='home-institutional-message'] .home-institutional-background"),
            manifestoParagraph: rect("section[data-store='home-institutional-message'] .home-institutional-background p"),
            manifestoButton: rect("section[data-store='home-institutional-message'] .home-institutional-background .btn-link"),
            manifestoContained: (() => {
              const sectionBox = manifesto?.getBoundingClientRect();
              const buttonBox = manifesto?.querySelector(".btn-link")?.getBoundingClientRect();
              return Boolean(sectionBox && buttonBox && buttonBox.top >= sectionBox.top - 1 && buttonBox.bottom <= sectionBox.bottom + 1);
            })(),
            collectionsTitle:
              rect(".section-banners-home .section-title") ||
              rect("section[data-store='home-banners'] .section-title"),
            firstCollection: rect(".section-banners-home .swiper-slide"),
            footer: rect("footer.js-footer"),
            footerRow: rect("footer.js-footer > .row"),
            copyright: rect("footer.js-footer > .text-left.text-md-center"),
            copyrightText: copyright
              ? copyright.textContent.trim().replace(/\\s+/g, " ")
              : null,
            copyrightVisible: Boolean(
              copyright &&
              copyright.getBoundingClientRect().height > 0 &&
              getComputedStyle(copyright).display !== "none" &&
              getComputedStyle(copyright).visibility !== "hidden"
            ),
            poweredByDisplay: poweredBy ? getComputedStyle(poweredBy).display : null,
            footerText: document.querySelector("footer.js-footer")
              ?.textContent.trim().replace(/\\s+/g, " ") || null
          };
        })()`,
      );

      if (!item.mobile) {
        await evaluate(
          client,
          `(() => {
            const section = document.querySelector(
              "section[data-store='home-institutional-message']"
            );
            if (section) section.scrollIntoView({ block: "start" });
            return Boolean(section);
          })()`,
        );
        await delay(350);
        await capture(client, `${item.name}-manifesto.png`);
      }

      await evaluate(
        client,
        `(() => {
          const footer = document.querySelector("footer.js-footer");
          if (footer) footer.scrollIntoView({ block: "start" });
          return Boolean(footer);
        })()`,
      );
      await delay(500);
      await capture(client, `${item.name}-footer-start.png`);

      await evaluate(
        client,
        `(() => {
          scrollTo(0, document.documentElement.scrollHeight);
          return scrollY;
        })()`,
      );
      await delay(500);
      await capture(client, `${item.name}-footer-end.png`);

      results.push({
        name: item.name,
        url,
        metrics,
        collectionStates,
        logoOffsetPx:
          metrics.logo == null
            ? null
            : Math.round(
                (metrics.logo.centerX - metrics.viewportWidth / 2) * 10,
              ) / 10,
      });
    }

    const resultPath = path.join(outputDir, "metrics.json");
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2), "utf8");

    console.log(
      JSON.stringify(
        {
          outputDir,
          resultPath,
          previewCssPath: previewCssPath || null,
          cases: results.map((result) => ({
            name: result.name,
            logoOffsetPx: result.logoOffsetPx,
            headerVerticalOffsets: result.metrics.headerVerticalOffsets,
            manifestoContained: result.metrics.manifestoContained,
            horizontalOverflow: result.metrics.horizontalOverflow,
            copyrightVisible: result.metrics.copyrightVisible,
            copyrightText: result.metrics.copyrightText,
            poweredByDisplay: result.metrics.poweredByDisplay,
            footerHeight: result.metrics.footer?.height ?? null,
          })),
        },
        null,
        2,
      ),
    );
  } finally {
    if (client) {
      await client.send("Browser.close").catch(() => {});
    }
    client?.close();
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

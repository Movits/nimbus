const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(
  root,
  "nuvemshop",
  "previews",
  "ajustes-finais-preview-2026-07-16.html",
);
const outputDir = path.join(root, "nuvemshop", "previews", "renders");
const finalCssPath = path.join(root, "nuvemshop", "css-nimbus-correcoes-2026-07-16.css");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

fs.mkdirSync(outputDir, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function launchChrome() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "nimbus-preview-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--allow-file-access-from-files",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], {
    stdio: ["ignore", "ignore", "pipe"],
  });

  const websocketUrl = new Promise((resolve, reject) => {
    let stderr = "";
    const timer = setTimeout(() => {
      reject(new Error(`Chrome não iniciou o DevTools. ${stderr}`));
    }, 15000);

    chrome.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });

    chrome.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome encerrou antes do render. Código ${code}. ${stderr}`));
    });
  });

  return {
    chrome,
    userDataDir,
    websocketUrl,
    async close() {
      if (chrome.exitCode === null) {
        const exited = new Promise((resolve) => chrome.once("exit", resolve));
        chrome.kill();
        await Promise.race([exited, wait(3000)]);
      }
      try {
        fs.rmSync(userDataDir, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 200,
        });
      } catch (error) {
        if (error.code !== "EPERM") throw error;
        console.warn(`Chrome ainda está liberando o perfil temporário: ${userDataDir}`);
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
    this.socket = new WebSocket(this.url);
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
    this.socket.close();
  }
}

async function render(cdp, {
  url,
  width,
  height,
  output,
  fullPage,
  mobile = false,
}) {
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
    mobile,
    screenWidth: width,
    screenHeight: height,
  }, sessionId);
  await cdp.send("Page.navigate", { url }, sessionId);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    }, sessionId);
    if (state.result.value === "complete") break;
    await wait(100);
  }

  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts.ready.then(() => true)",
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  await wait(500);

  let captureHeight = height;
  if (fullPage) {
    const metrics = await cdp.send("Runtime.evaluate", {
      expression: "Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)",
      returnByValue: true,
    }, sessionId);
    captureHeight = Math.ceil(metrics.result.value);
  }

  const screenshotParams = {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: fullPage,
  };
  if (fullPage) {
    screenshotParams.clip = {
      x: 0,
      y: 0,
      width,
      height: captureHeight,
      scale: 1,
    };
  }

  const screenshot = await cdp.send("Page.captureScreenshot", screenshotParams, sessionId);
  fs.writeFileSync(output, Buffer.from(screenshot.data, "base64"));
  await cdp.send("Target.closeTarget", { targetId });
}

async function testModalScroll(cdp, url) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1600,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1600,
    screenHeight: 1000,
  }, sessionId);
  await cdp.send("Page.navigate", { url }, sessionId);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    }, sessionId);
    if (state.result.value === "complete") break;
    await wait(100);
  }

  const test = await cdp.send("Runtime.evaluate", {
    expression: `
      (async () => {
        document.documentElement.style.scrollBehavior = "auto";
        document.querySelector("#projetos").scrollIntoView({ block: "center" });
        const before = window.scrollY;

        document.querySelector("[data-open-project]").click();
        await new Promise((resolve) => setTimeout(resolve, 250));
        const opened = window.scrollY;
        const closeButton = document.querySelector(".modal-close");
        const closeBefore = getComputedStyle(closeButton, "::before");
        const closeAfter = getComputedStyle(closeButton, "::after");
        const solidCloseIcon = closeBefore.content !== "none"
          && closeAfter.content !== "none"
          && closeBefore.width === "20px"
          && closeBefore.height === "2px"
          && closeAfter.width === "20px"
          && closeAfter.height === "2px";

        closeButton.click();
        await new Promise((resolve) => setTimeout(resolve, 250));
        const afterClose = window.scrollY;

        document.querySelector("[data-open-project]").click();
        await new Promise((resolve) => setTimeout(resolve, 250));
        document.querySelector(".modal-backdrop").click();
        await new Promise((resolve) => setTimeout(resolve, 250));
        const afterBackdrop = window.scrollY;

        return {
          before,
          opened,
          afterClose,
          afterBackdrop,
          solidCloseIcon,
          modalClosed: !document.querySelector("#project-modal").classList.contains("is-open")
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);

  const result = test.result.value;
  const stable = result.before === result.opened
    && result.before === result.afterClose
    && result.before === result.afterBackdrop
    && result.solidCloseIcon
    && result.modalClosed;

  await cdp.send("Target.closeTarget", { targetId });
  if (!stable) {
    throw new Error(`O modal alterou a posição da página: ${JSON.stringify(result)}`);
  }
  console.log(`Modal sem deslocamento: ${JSON.stringify(result)}`);
}

async function testMobileHeaderCentering(cdp, url) {
  const widths = [320, 360, 375, 390, 430, 768, 920];
  const results = [];

  for (const width of widths) {
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: 844,
    }, sessionId);
    await cdp.send("Page.navigate", { url }, sessionId);

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const state = await cdp.send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      }, sessionId);
      if (state.result.value === "complete") break;
      await wait(100);
    }

    const measurement = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const logo = document.querySelector(".brand").getBoundingClientRect();
          const menu = document.querySelector(".mobile-menu").getBoundingClientRect();
          const tools = document.querySelector(".header-tools").getBoundingClientRect();
          const logoCenter = logo.left + logo.width / 2;
          return {
            viewport: window.innerWidth,
            logoCenter,
            delta: Math.abs(logoCenter - window.innerWidth / 2),
            leftGap: logo.left - menu.right,
            rightGap: tools.left - logo.right,
            noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth
          };
        })()
      `,
      returnByValue: true,
    }, sessionId);

    results.push({ width, ...measurement.result.value });
    await cdp.send("Target.closeTarget", { targetId });
  }

  const valid = results.every((result) => result.delta <= 0.5
    && result.leftGap >= 8
    && result.rightGap >= 8
    && (result.width > 430 || result.noHorizontalOverflow));

  if (!valid) {
    throw new Error(`Header mobile fora do centro: ${JSON.stringify(results)}`);
  }
  console.log(`Header mobile centralizado: ${JSON.stringify(results)}`);
}

async function testStoreHeaderWithFinalCss(cdp) {
  const css = fs.readFileSync(finalCssPath, "utf8");
  const widths = [320, 375, 390, 430];
  const results = [];

  for (const width of widths) {
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("DOM.enable", {}, sessionId);
    await cdp.send("CSS.enable", {}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: 844,
    }, sessionId);
    await cdp.send("Page.navigate", { url: "https://loja.nimbuswear.com.br/" }, sessionId);

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const state = await cdp.send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      }, sessionId);
      if (state.result.value === "complete") break;
      await wait(100);
    }
    await wait(1000);

    const frameTree = await cdp.send("Page.getFrameTree", {}, sessionId);
    const styleSheet = await cdp.send("CSS.createStyleSheet", {
      frameId: frameTree.frameTree.frame.id,
    }, sessionId);
    await cdp.send("CSS.setStyleSheetText", {
      styleSheetId: styleSheet.styleSheetId,
      text: css,
    }, sessionId);
    await wait(350);

    const measurement = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const logo = document.querySelector(".head-main .js-logo-container");
          const menu = document.querySelector(".head-main .head-logo-row .order-first");
          const tools = document.querySelector(".head-main .head-logo-row .order-last");
          if (!logo || !menu || !tools) {
            return { missing: true };
          }
          const logoRect = logo.getBoundingClientRect();
          const menuRect = (menu.querySelector(".btn-utility") || menu).getBoundingClientRect();
          const toolsRect = (tools.querySelector(".btn-utility") || tools).getBoundingClientRect();
          const slider = document.querySelector(".section-banners-home .js-swiper-banners");
          const firstSlide = document.querySelector(".section-banners-home .swiper-slide");
          const firstTextBanner = document.querySelector(".section-banners-home .textbanner");
          const firstBannerImage = document.querySelector(".section-banners-home .textbanner-image");
          const sliderRect = slider?.getBoundingClientRect();
          const slideRect = firstSlide?.getBoundingClientRect();
          const textBannerRect = firstTextBanner?.getBoundingClientRect();
          const bannerImageRect = firstBannerImage?.getBoundingClientRect();
          const logoCenter = logoRect.left + logoRect.width / 2;
          return {
            missing: false,
            viewport: window.innerWidth,
            logoCenter,
            delta: Math.abs(logoCenter - window.innerWidth / 2),
            leftGap: logoRect.left - menuRect.right,
            rightGap: toolsRect.left - logoRect.right,
            collectionWidthDelta: sliderRect && slideRect
              ? Math.abs(sliderRect.width - slideRect.width)
              : null,
            sliderWidth: sliderRect?.width ?? null,
            slideWidth: slideRect?.width ?? null,
            textBannerWidth: textBannerRect?.width ?? null,
            bannerImageWidth: bannerImageRect?.width ?? null,
            noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth
          };
        })()
      `,
      returnByValue: true,
    }, sessionId);

    const result = { width, ...measurement.result.value };
    results.push(result);

    if (width === 390) {
      await cdp.send("Page.bringToFront", {}, sessionId);
      await cdp.send("Runtime.evaluate", {
        expression: `
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, 0);
          new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        `,
        awaitPromise: true,
      }, sessionId);
      await wait(500);
      const screenshot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      }, sessionId);
      fs.writeFileSync(
        path.join(outputDir, "preview-nuvemshop-mobile-simulated.png"),
        Buffer.from(screenshot.data, "base64"),
      );
    }

    await cdp.send("Target.closeTarget", { targetId });
  }

  const valid = results.every((result) => !result.missing
    && result.delta <= 1
    && result.leftGap >= 0
    && result.rightGap >= 0
    && result.collectionWidthDelta <= 1
    && Math.abs(result.textBannerWidth - result.bannerImageWidth) <= 1
    && result.noHorizontalOverflow);

  if (!valid) {
    throw new Error(`Header final falhou na simulacao da loja: ${JSON.stringify(results)}`);
  }
  console.log(`Header final simulado na loja: ${JSON.stringify(results)}`);
}

async function openStoreWithFinalCss(cdp, url, width, height) {
  const css = fs.readFileSync(finalCssPath, "utf8");
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("DOM.enable", {}, sessionId);
  await cdp.send("CSS.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
    screenHeight: height,
  }, sessionId);
  await cdp.send("Page.navigate", { url }, sessionId);

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const state = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    }, sessionId);
    if (state.result.value === "complete") break;
    await wait(100);
  }
  await wait(1000);

  const frameTree = await cdp.send("Page.getFrameTree", {}, sessionId);
  const styleSheet = await cdp.send("CSS.createStyleSheet", {
    frameId: frameTree.frameTree.frame.id,
  }, sessionId);
  await cdp.send("CSS.setStyleSheetText", {
    styleSheetId: styleSheet.styleSheetId,
    text: css,
  }, sessionId);
  await wait(500);

  return { targetId, sessionId };
}

async function captureViewport(cdp, sessionId, output) {
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  }, sessionId);
  fs.writeFileSync(output, Buffer.from(screenshot.data, "base64"));
}

async function testStoreDesktopWithFinalCss(cdp) {
  const home = await openStoreWithFinalCss(
    cdp,
    `https://loja.nimbuswear.com.br/?localcss=${Date.now()}`,
    1920,
    1080,
  );

  const header = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const logo = document.querySelector(".head-main .js-logo-container").getBoundingClientRect();
        const nav = document.querySelector(".head-main .head-nav").getBoundingClientRect();
        const row = document.querySelector(".head-main .head-logo-row").getBoundingClientRect();
        const tools = document.querySelector(".head-main .head-logo-row .order-last").getBoundingClientRect();
        const topLevelLinks = [...document.querySelectorAll(".head-main .nav-desktop-list > .js-nav-main-item > .nav-list-link, .head-main .nav-desktop-list > .js-nav-main-item > .nav-item-container > .nav-list-link")];
        const dropdown = document.querySelector(".head-main .nav-dropdown-content");
        return {
          rowHeight: row.height,
          logoWidth: logo.width,
          logoDelta: Math.abs((logo.top + logo.height / 2) - (row.top + row.height / 2)),
          navDelta: Math.abs((nav.top + nav.height / 2) - (row.top + row.height / 2)),
          toolsDelta: Math.abs((tools.top + tools.height / 2) - (row.top + row.height / 2)),
          topLevelLabels: topLevelLinks.map((link) => link.textContent.trim()),
          dropdownDisplay: dropdown ? getComputedStyle(dropdown).display : null,
          noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth
        };
      })()
    `,
    returnByValue: true,
  }, home.sessionId);

  await captureViewport(
    cdp,
    home.sessionId,
    path.join(outputDir, "preview-nuvemshop-desktop-final-localcss.png"),
  );

  await cdp.send("Runtime.evaluate", {
    expression: "window.scrollTo(0, document.documentElement.scrollHeight)",
  }, home.sessionId);
  await wait(600);

  const footer = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const footer = document.querySelector("footer.js-footer");
        const primary = footer.querySelector(".row > .col-md-6:first-child");
        const help = footer.querySelector(".row > .col-md-6:last-child");
        const copyright = footer.querySelector(".text-left.text-md-center");
        const before = getComputedStyle(footer, "::before");
        return {
          display: getComputedStyle(footer).display,
          columns: getComputedStyle(footer).gridTemplateColumns,
          beforeContent: before.content,
          background: getComputedStyle(footer).backgroundColor,
          primaryWidth: primary.getBoundingClientRect().width,
          helpWidth: help.getBoundingClientRect().width,
          copyrightWidth: copyright.getBoundingClientRect().width,
          footerWidth: footer.getBoundingClientRect().width
        };
      })()
    `,
    returnByValue: true,
  }, home.sessionId);

  await captureViewport(
    cdp,
    home.sessionId,
    path.join(outputDir, "preview-nuvemshop-footer-final-localcss.png"),
  );
  await cdp.send("Target.closeTarget", { targetId: home.targetId });

  const mobileFooterPage = await openStoreWithFinalCss(
    cdp,
    `https://loja.nimbuswear.com.br/?localcss=${Date.now()}`,
    390,
    844,
  );
  await cdp.send("Runtime.evaluate", {
    expression: `
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, document.documentElement.scrollHeight);
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    `,
    awaitPromise: true,
  }, mobileFooterPage.sessionId);
  await wait(600);
  const mobileFooter = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const footer = document.querySelector("footer.js-footer");
        const before = getComputedStyle(footer, "::before");
        return {
          display: getComputedStyle(footer).display,
          beforeContent: before.content,
          width: footer.getBoundingClientRect().width,
          viewportWidth: window.innerWidth,
          noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth
        };
      })()
    `,
    returnByValue: true,
  }, mobileFooterPage.sessionId);
  await captureViewport(
    cdp,
    mobileFooterPage.sessionId,
    path.join(outputDir, "preview-nuvemshop-footer-mobile-final-localcss.png"),
  );
  await cdp.send("Target.closeTarget", { targetId: mobileFooterPage.targetId });

  const products = await openStoreWithFinalCss(
    cdp,
    `https://loja.nimbuswear.com.br/produtos/?localcss=${Date.now()}`,
    1440,
    900,
  );
  const sorting = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const newest = document.querySelector('option[value="created-descending"]');
        const oldest = document.querySelector('option[value="created-ascending"]');
        return {
          newest: newest ? getComputedStyle(newest).display : null,
          oldest: oldest ? getComputedStyle(oldest).display : null
        };
      })()
    `,
    returnByValue: true,
  }, products.sessionId);
  await cdp.send("Target.closeTarget", { targetId: products.targetId });

  const projects = await openStoreWithFinalCss(
    cdp,
    `https://loja.nimbuswear.com.br/projetos-sociais/?localcss=${Date.now()}#caritas-brasileira`,
    1280,
    720,
  );
  await wait(500);
  const modalBefore = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const dialog = document.querySelector("#caritas-brasileira .nimbus-project-modal__dialog").getBoundingClientRect();
        const media = document.querySelector("#caritas-brasileira .nimbus-project-modal__media").getBoundingClientRect();
        const close = document.querySelector("#caritas-brasileira .nimbus-project-modal__close").getBoundingClientRect();
        return {
          dialogHeight: dialog.height,
          mediaHeight: media.height,
          fillDelta: Math.abs(dialog.height - media.height),
          closeCenterX: close.left + close.width / 2,
          closeCenterY: close.top + close.height / 2
        };
      })()
    `,
    returnByValue: true,
  }, projects.sessionId);

  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: modalBefore.result.value.closeCenterX,
    y: modalBefore.result.value.closeCenterY,
  }, projects.sessionId);
  await wait(250);
  const hover = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const close = document.querySelector("#caritas-brasileira .nimbus-project-modal__close");
        const style = getComputedStyle(close);
        return { background: style.backgroundColor, color: style.color };
      })()
    `,
    returnByValue: true,
  }, projects.sessionId);

  await captureViewport(
    cdp,
    projects.sessionId,
    path.join(outputDir, "preview-nuvemshop-project-modal-final-localcss.png"),
  );
  await cdp.send("Target.closeTarget", { targetId: projects.targetId });

  const result = {
    header: header.result.value,
    footer: footer.result.value,
    mobileFooter: mobileFooter.result.value,
    sorting: sorting.result.value,
    modal: modalBefore.result.value,
    hover: hover.result.value,
  };
  const valid = result.header.rowHeight >= 91
    && result.header.rowHeight <= 93
    && result.header.logoDelta <= 1
    && result.header.navDelta <= 1
    && result.header.toolsDelta <= 1
    && result.header.topLevelLabels.length === 8
    && result.header.dropdownDisplay === "none"
    && result.header.noHorizontalOverflow
    && result.footer.display === "block"
    && result.footer.beforeContent.includes("FÉ COM PROPÓSITO")
    && result.footer.copyrightWidth >= result.footer.footerWidth - 130
    && result.mobileFooter.display === "block"
    && result.mobileFooter.beforeContent.includes("FÉ COM PROPÓSITO")
    && result.mobileFooter.width <= result.mobileFooter.viewportWidth
    && result.mobileFooter.noHorizontalOverflow
    && result.sorting.newest === "none"
    && result.sorting.oldest === "none"
    && result.modal.fillDelta <= 2
    && result.hover.background === "rgb(11, 35, 96)"
    && result.hover.color === "rgb(255, 255, 255)";

  if (!valid) {
    throw new Error(`Validacao desktop final falhou: ${JSON.stringify(result)}`);
  }
  console.log(`Loja desktop final validada: ${JSON.stringify(result)}`);
}

async function main() {
  const process = launchChrome();
  const cdp = new Cdp(await process.websocketUrl);

  try {
    await cdp.connect();
    const fileUrl = pathToFileURL(htmlPath).href;

    await testModalScroll(cdp, fileUrl);
    await testMobileHeaderCentering(cdp, fileUrl);
    await testStoreHeaderWithFinalCss(cdp);
    await testStoreDesktopWithFinalCss(cdp);

    await render(cdp, {
      url: fileUrl,
      width: 1600,
      height: 1000,
      output: path.join(outputDir, "preview-home-desktop.png"),
      fullPage: true,
    });

    await render(cdp, {
      url: `${fileUrl}?modal=1`,
      width: 1600,
      height: 1000,
      output: path.join(outputDir, "preview-projetos-modal.png"),
      fullPage: false,
    });

    await render(cdp, {
      url: fileUrl,
      width: 390,
      height: 844,
      output: path.join(outputDir, "preview-home-mobile.png"),
      fullPage: true,
      mobile: true,
    });
  } finally {
    cdp.close();
    await process.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

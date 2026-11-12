#!/usr/bin/env node
/**
 * Olho medido: os defeitos visuais que o dono apontou em 11/11/2026 e que
 * screenshot olhado às pressas deixa passar.
 *
 * Por que existe. Na revisão do site de 11/11 o dono viu, numa prévia, a foto
 * do modelo ESTICADA no celular e os pontos dourados dos selos fora de
 * alinhamento, e disse que aquilo parecia amador e falso. Apontada contra o
 * site que estava no ar, esta mesma medição achou os dois defeitos já em
 * produção: a marca do topo da landing esticada de 8% a 21% no tablet e no
 * celular, os pontos dos selos em x = 103, 56 e 24, e os títulos dos três cards
 * do impacto em alturas diferentes. Ninguém tinha visto. Olho humano cansado
 * não mede proporção; este script mede.
 *
 * O que confere, em cada página e em cinco larguras de tela:
 *   1. imagem ESTICADA (proporção da caixa diferente da do arquivo, sem
 *      object-fit que justifique), imagem quebrada e imagem ampliada além do
 *      tamanho real;
 *   2. rolagem horizontal;
 *   3. itens irmãos DESALINHADOS: pilha com bordas esquerdas (ou centros)
 *      diferentes, linha com centros verticais diferentes, quebra de linha que
 *      não é nem alinhada à esquerda nem centrada, marcador (o ponto dourado)
 *      fora do eixo, cards lado a lado com título ou link em alturas diferentes;
 *   4. alvo de toque menor que 44px nas telas de toque (link dentro de frase
 *      corrida não conta);
 *   5. texto cortado por overflow escondido.
 *
 * O que ele NÃO vê: gosto. Imagem com cara de IA, espaçamento feio mas
 * regular, cor fora do tom. Isso continua sendo olho, de gente ou de revisor
 * (docs/fluxos/site-um-so-ceu.md).
 *
 * Precisa de um servidor: "npm run dev" em outra aba (o padrão é
 * http://localhost:5173) ou o endereço do site no ar.
 *
 *   npm run vitrine:olho                      # contra o npm run dev
 *   npm run vitrine:olho -- https://nimbuswear.com.br
 *   npm run vitrine:olho -- http://localhost:5173 vitrine-home
 *
 * Sai com código 1 se achar qualquer coisa.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:5173';
const filtro = process.argv[3] || '';
const PAGES = [
  ['landing', '/'],
  ['vitrine-home', '/loja/'],
  ['vitrine-manifesto', '/loja/manifesto/'],
  ['vitrine-impacto', '/loja/impacto/'],
  ['vitrine-envios', '/loja/envios/'],
  ['vitrine-trocas', '/loja/trocas/'],
  ['vitrine-privacidade', '/loja/privacidade/'],
  ['gravuras', '/gravuras/'],
  ['gravura', '/gravuras/menino-jesus-ihs-wierix/'],
  ['pagina-404', '/404.html'],
].filter(([n]) => !filtro || n.startsWith(filtro));
const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }, false],
  ['notebook', { width: 1024, height: 768 }, false],
  ['tablet', { width: 768, height: 1024 }, true],
  ['mobile', { width: 390, height: 844 }, true],
  ['mobile-pequeno', { width: 320, height: 640 }, true],
];

const mede = (toque) => {
  const achados = [];
  const visivel = (el) => {
    const r = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    if (r.width < 2 || r.height < 2 || c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return false;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const pc = getComputedStyle(p);
      if (pc.display === 'none' || pc.visibility === 'hidden') return false;
      if (p.tagName === 'DETAILS' && !p.open && !el.closest('summary')) return false;
    }
    return true;
  };
  const nome = (el) => {
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const txt = (el.getAttribute('alt') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${el.tagName.toLowerCase()}${cls}${txt ? ` "${txt}"` : ''}`;
  };

  // 1. imagens
  for (const img of document.images) {
    if (!visivel(img)) continue;
    if (!img.complete || img.naturalWidth === 0) { achados.push({ tipo: 'imagem-quebrada', onde: nome(img), detalhe: img.currentSrc.slice(-60) }); continue; }
    const r = img.getBoundingClientRect();
    const fit = getComputedStyle(img).objectFit;
    const caixa = r.width / r.height;
    const arquivo = img.naturalWidth / img.naturalHeight;
    const desvio = Math.abs(caixa / arquivo - 1);
    if (desvio > 0.015 && (fit === 'fill' || !fit))
      achados.push({ tipo: 'imagem-ESTICADA', onde: nome(img), detalhe: `caixa ${Math.round(r.width)}x${Math.round(r.height)} (${caixa.toFixed(3)}) contra arquivo ${img.naturalWidth}x${img.naturalHeight} (${arquivo.toFixed(3)}), desvio ${(desvio * 100).toFixed(1)}%` });
    // ampliada além do tamanho real: fica borrada
    if (r.width > img.naturalWidth * 1.15 && r.width > 200)
      achados.push({ tipo: 'imagem-ampliada', onde: nome(img), detalhe: `mostrada a ${Math.round(r.width)}px, arquivo tem ${img.naturalWidth}px` });
  }

  // 2. rolagem horizontal
  const sw = document.documentElement.scrollWidth;
  if (sw > innerWidth + 1) achados.push({ tipo: 'rolagem-horizontal', onde: 'documento', detalhe: `${sw}px de conteúdo em ${innerWidth}px de tela` });

  // 3 e 4. irmãos desalinhados
  const grupos = new Set();
  for (const el of document.querySelectorAll('ul, ol, nav, .rodape__grade > div, .hero__cta, .topo')) grupos.add(el);
  for (const pai of grupos) {
    const filhos = [...pai.children].filter((f) => visivel(f) && !['SCRIPT', 'STYLE'].includes(f.tagName));
    if (filhos.length < 2) continue;
    const rs = filhos.map((f) => f.getBoundingClientRect());
    const empilhado = rs.every((r, i) => i === 0 || r.top >= rs[i - 1].bottom - 2);
    const emLinha = rs.every((r, i) => i === 0 || r.left >= rs[i - 1].right - 2);
    const estilo = getComputedStyle(pai);
    if (empilhado && filhos.length >= 2) {
      // em pilha: ou todos encostam à esquerda no mesmo x, ou todos centrados no mesmo eixo
      const lefts = rs.map((r) => Math.round(r.left));
      const centros = rs.map((r) => Math.round(r.left + r.width / 2));
      const igual = (a) => Math.max(...a) - Math.min(...a) <= 2;
      if (!igual(lefts) && !igual(centros))
        achados.push({ tipo: 'pilha-DESALINHADA', onde: nome(pai), detalhe: `bordas esquerdas ${lefts.join(', ')}; centros ${centros.join(', ')}` });
      // marcador ::before: mesmo x em todos os itens
      const marcas = filhos.map((f) => {
        const b = getComputedStyle(f, '::before');
        if (!b || b.content === 'none' || b.content === 'normal' || b.display === 'none') return null;
        return Math.round(f.getBoundingClientRect().left);
      });
      if (marcas.every((m) => m !== null) && Math.max(...marcas) - Math.min(...marcas) > 2)
        achados.push({ tipo: 'marcador-DESALINHADO', onde: nome(pai), detalhe: `x dos marcadores ${marcas.join(', ')}` });
    } else if (emLinha && filhos.length >= 2 && estilo.display.includes('flex') && estilo.alignItems !== 'flex-start' && estilo.alignItems !== 'start') {
      const meios = rs.map((r) => Math.round(r.top + r.height / 2));
      if (Math.max(...meios) - Math.min(...meios) > 3)
        achados.push({ tipo: 'linha-DESALINHADA', onde: nome(pai), detalhe: `centros verticais ${meios.join(', ')}` });
    } else if (!empilhado && !emLinha) {
      // quebrou em várias linhas: a primeira coluna de cada linha deve começar no mesmo x
      // (ou o grupo é centrado de propósito: então cada linha é simétrica em torno do eixo do pai)
      const linhas = new Map();
      rs.forEach((r) => { const k = Math.round(r.top / 4); if (!linhas.has(k)) linhas.set(k, []); linhas.get(k).push(r); });
      if (linhas.size >= 2) {
        const inicios = [...linhas.values()].map((l) => Math.round(Math.min(...l.map((r) => r.left))));
        const pr = pai.getBoundingClientRect();
        const eixo = pr.left + pr.width / 2;
        const simetrica = [...linhas.values()].every((l) => {
          const a = Math.min(...l.map((r) => r.left)), b = Math.max(...l.map((r) => r.right));
          return Math.abs((a + b) / 2 - eixo) <= 3;
        });
        if (Math.max(...inicios) - Math.min(...inicios) > 2 && !simetrica)
          achados.push({ tipo: 'quebra-DESALINHADA', onde: nome(pai), detalhe: `início de cada linha em x = ${inicios.join(', ')}; nem alinhada à esquerda nem centrada` });
      }
    }
  }

  // 3b. cards irmãos lado a lado: título no mesmo alto e link no mesmo pé
  for (const pai of document.querySelectorAll('.impact__grid, .gravuras, .grade, .rodape__grade, .colecoes, .compra')) {
    const filhos = [...pai.children].filter(visivel);
    if (filhos.length < 2) continue;
    const linhas = new Map();
    filhos.forEach((f) => { const k = Math.round(f.getBoundingClientRect().top / 6); if (!linhas.has(k)) linhas.set(k, []); linhas.get(k).push(f); });
    for (const linha of linhas.values()) {
      if (linha.length < 2) continue;
      // O primeiro elemento de cada card começa no mesmo alto OU termina no
      // mesmo pé. O pé vale porque imagens de proporções diferentes (a fileira
      // das gravuras) se alinham pela linha de base, como quadros numa parede;
      // desalinhado é não ter nem um nem outro.
      const primeiro = linha.map((f) => f.querySelector('h1,h2,h3,h4,b,img')).filter(Boolean).map((h) => h.getBoundingClientRect());
      const topo = primeiro.map((r) => Math.round(r.top));
      const base = primeiro.map((r) => Math.round(r.bottom));
      if (topo.length === linha.length && Math.max(...topo) - Math.min(...topo) > 2 && Math.max(...base) - Math.min(...base) > 2)
        achados.push({ tipo: 'cards-DESALINHADOS', onde: nome(pai), detalhe: 'primeiro elemento de cada card: alto em ' + topo.join(', ') + ' e pé em ' + base.join(', ') });
      const pe = linha.map((f) => { const l = [...f.querySelectorAll('a,button')].filter(visivel).pop(); return l && f.matches('.impact__card, .compra > li') ? Math.round(l.getBoundingClientRect().bottom) : null; }).filter((v) => v !== null);
      if (pe.length === linha.length && pe.length > 1 && Math.max(...pe) - Math.min(...pe) > 2)
        achados.push({ tipo: 'cards-DESALINHADOS', onde: nome(pai), detalhe: 'pé do link de cada card: ' + pe.join(', ') });
    }
  }

  // 5. alvo de toque
  if (toque) {
    for (const el of document.querySelectorAll('a[href], button, summary, input, select, textarea')) {
      if (!visivel(el)) continue;
      const r = el.getBoundingClientRect();
      // link dentro de frase corrida não conta (a regra de 44px é para controle solto)
      const cartao = el.classList.contains('impact__cardCta'); // a área de toque dele é o card inteiro (::after esticado)
      const emFrase = cartao || el.tagName === 'A' && el.parentElement && ['P', 'LI', 'DD', 'FIGCAPTION', 'SPAN'].includes(el.parentElement.tagName) && el.parentElement.textContent.trim().length > el.textContent.trim().length + 8;
      if (!emFrase && (r.height < 43.5 || r.width < 24))
        achados.push({ tipo: 'alvo-pequeno', onde: nome(el), detalhe: `${Math.round(r.width)}x${Math.round(r.height)}px` });
    }
  }

  // 6. texto cortado
  for (const el of document.querySelectorAll('h1, h2, h3, p, a, button, li, span')) {
    if (!visivel(el) || el.children.length > 3) continue;
    const c = getComputedStyle(el);
    if ((c.overflow === 'hidden' || c.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 2 && el.textContent.trim())
      achados.push({ tipo: 'texto-cortado', onde: nome(el), detalhe: `${el.scrollWidth}px em ${el.clientWidth}px` });
  }
  return achados;
};

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
let total = 0;
const resumo = {};
for (const [vp, viewport, toque] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'pt-BR', isMobile: toque, hasTouch: toque });
  for (const [name, rota] of PAGES) {
    const page = await ctx.newPage();
    // Máquina ocupada faz o servidor de desenvolvimento demorar: tenta de novo uma
    // vez. Página que não abre nas duas vira achado (e o script segue), em vez de
    // derrubar a medição inteira com um erro do navegador.
    let abriu = false;
    for (let tentativa = 0; tentativa < 2 && !abriu; tentativa++)
      abriu = await page.goto(BASE + rota, { waitUntil: 'domcontentloaded', timeout: 60000 }).then((r) => !r || r.ok(), () => false);
    if (!abriu) {
      console.log(`${vp.padEnd(15)} ${name.padEnd(20)} ${'pagina-nao-abriu'.padEnd(22)} ${BASE + rota} :: o servidor não respondeu em 2 tentativas`);
      resumo['pagina-nao-abriu'] = (resumo['pagina-nao-abriu'] || 0) + 1;
      total += 1;
      await page.close();
      continue;
    }
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(name === 'landing' ? 4000 : 900);
    // rola a página inteira: dispara imagem preguiçosa e as revelações
    const altura = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < altura; y += Math.round(viewport.height * 0.8)) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(name === 'landing' ? 500 : 180); }
    await page.waitForTimeout(700);
    const fechado = await page.evaluate(mede, toque);
    // o menu do celular aberto também é tela
    let aberto = [];
    const temMenu = await page.evaluate(() => { const m = document.querySelector('.topo__menu'); if (m && getComputedStyle(m).display !== 'none') { m.open = true; return true; } return false; });
    if (temMenu) { await page.waitForTimeout(200); aberto = (await page.evaluate(mede, toque)).filter((a) => /topo__painel|topo__menu/.test(a.onde)); }
    const achados = [...fechado, ...aberto];
    const chave = new Set();
    const unicos = achados.filter((a) => { const k = a.tipo + a.onde + a.detalhe; if (chave.has(k)) return false; chave.add(k); return true; });
    for (const a of unicos) { console.log(`${vp.padEnd(15)} ${name.padEnd(20)} ${a.tipo.padEnd(22)} ${a.onde} :: ${a.detalhe}`); resumo[a.tipo] = (resumo[a.tipo] || 0) + 1; }
    total += unicos.length;
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`\nolho: ${total} achado(s) em ${PAGES.length} páginas x ${VIEWPORTS.length} telas.`, JSON.stringify(resumo));
process.exit(total ? 1 : 0);

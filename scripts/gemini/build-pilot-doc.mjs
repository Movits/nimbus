import fs from "node:fs";
import sharp from "sharp";

const OUT = "C:/Users/rober/AppData/Local/Temp/claude/C--Users-rober/2bcae487-e316-4831-b74d-af7824ac2479/scratchpad/pilot-doc.html";
const LIVE = "C:/Users/rober/Nimbus/nuvemshop/auditoria/2026-07-21/implementacao/auditoria-imagens-2026-07-22/live";
const SEQ = "C:/Users/rober/AppData/Local/Temp/claude/C--Users-rober/2bcae487-e316-4831-b74d-af7824ac2479/scratchpad/pilot-seq";

async function b64(path, w = 820) {
  const buf = await sharp(path).resize(w, w, { fit: "inside" }).jpeg({ quality: 82 }).toBuffer();
  return "data:image/jpeg;base64," + buf.toString("base64");
}

const imgs = {
  atual: await b64(`${LIVE}/352722685-01.webp`),
  mockup: await b64(`${LIVE}/352722685-04.webp`),
  gen1: await b64(`${SEQ}/gen1-01.png`),
  gen2: await b64(`${SEQ}/gen2-01.png`),
};

const chip = (ok, label) =>
  `<span class="chip ${ok ? "ok" : "no"}">${ok ? "OK" : "REFAZER"} · ${label}</span>`;

const html = `<title>NIMBUS · Piloto de capa · São Miguel Celeste Canguru</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{
    --navy:#0b2360; --gold:#e9c46a; --sky:#8fc1ea; --cloud:#dcebfa; --nuvem:#f7fbff;
    --ground:#f4f8fd; --card:#ffffff; --ink:#1b2733; --muted:#5b6b7f; --line:#d6e4f2;
    --ok:#1f8a5b; --no:#c0492f; --okbg:#e5f4ec; --nobg:#fbe9e4;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --ground:#0a1122; --card:#111c34; --ink:#eaf1fb; --muted:#9fb2cc; --line:#22345a;
      --navy:#dcebfa; --okbg:#123024; --nobg:#3a1c16; --ok:#5cd39b; --no:#f0876b;
    }
  }
  :root[data-theme="dark"]{
    --ground:#0a1122; --card:#111c34; --ink:#eaf1fb; --muted:#9fb2cc; --line:#22345a;
    --navy:#dcebfa; --okbg:#123024; --nobg:#3a1c16; --ok:#5cd39b; --no:#f0876b;
  }
  :root[data-theme="light"]{
    --ground:#f4f8fd; --card:#ffffff; --ink:#1b2733; --muted:#5b6b7f; --line:#d6e4f2;
    --navy:#0b2360; --okbg:#e5f4ec; --nobg:#fbe9e4; --ok:#1f8a5b; --no:#c0492f;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);
    font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.55}
  .wrap{max-width:1080px;margin:0 auto;padding:clamp(20px,4vw,52px)}
  h1,h2,h3{font-family:Fraunces,Georgia,"Times New Roman",serif;font-weight:600;text-wrap:balance;margin:0}
  .eyebrow{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:600}
  header.top{border-bottom:2px solid var(--line);padding-bottom:22px;margin-bottom:8px}
  header.top h1{font-size:clamp(1.6rem,3.6vw,2.5rem);color:var(--navy);margin:.25em 0 .1em}
  header.top .sub{color:var(--muted);font-size:1rem}
  .verdict{display:inline-flex;align-items:center;gap:.5em;margin-top:14px;
    background:var(--gold);color:#3a2c05;padding:.5em 1em;border-radius:999px;
    font-weight:700;font-size:.9rem}
  .note{background:var(--card);border:1px solid var(--line);border-radius:14px;
    padding:18px 20px;margin:26px 0;font-size:.95rem;color:var(--muted)}
  .note b{color:var(--ink)}
  .refs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:22px 0 8px}
  .step{margin:38px 0}
  .step-head{display:flex;align-items:baseline;gap:.7em;flex-wrap:wrap;margin-bottom:14px}
  .step-head h2{font-size:1.4rem;color:var(--navy)}
  .step-head .tag{font-size:.8rem;color:var(--muted)}
  .grid{display:grid;grid-template-columns:1.25fr 1fr;gap:22px;align-items:start}
  @media (max-width:760px){.grid{grid-template-columns:1fr}.refs{grid-template-columns:1fr}}
  figure{margin:0}
  figure img{width:100%;height:auto;display:block;border-radius:14px;border:1px solid var(--line);
    background:var(--card)}
  figcaption{font-size:.8rem;color:var(--muted);margin-top:8px}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
  .panel h3{font-size:1rem;margin-bottom:12px;color:var(--navy)}
  .chips{display:flex;flex-direction:column;gap:9px;margin-bottom:14px}
  .chip{display:inline-flex;align-items:center;gap:.5em;font-size:.86rem;font-weight:600;
    padding:.42em .7em;border-radius:9px;width:fit-content}
  .chip.ok{background:var(--okbg);color:var(--ok)}
  .chip.no{background:var(--nobg);color:var(--no)}
  .panel p{margin:.5em 0;font-size:.92rem;color:var(--muted)}
  .panel p b{color:var(--ink)}
  .final figure img{border:2px solid var(--gold)}
  .finalflag{display:inline-block;background:var(--gold);color:#3a2c05;font-weight:700;
    font-size:.78rem;letter-spacing:.06em;padding:.35em .8em;border-radius:999px;text-transform:uppercase}
  footer{margin-top:44px;border-top:2px solid var(--line);padding-top:20px;color:var(--muted);font-size:.9rem}
  footer b{color:var(--ink)}
</style>

<div class="wrap">
  <header class="top">
    <div class="eyebrow">NIMBUS · Fase B · Piloto de recriação de capa</div>
    <h1>São Miguel Celeste · Moletom Canguru</h1>
    <div class="sub">Produto 352722685 · coleção NUVEM · geração sequencial no Nano Banana 2 (sem marca d'água)</div>
    <div class="verdict">Versão final aprovada internamente: Geração 2</div>
  </header>

  <div class="note">
    <b>Método.</b> Uma imagem por vez. A cada geração eu confiro quatro coisas: <b>modelo</b> certo,
    <b>arte</b> fiel ao design, <b>tamanho</b> igual ao mockup de costas, e <b>enquadramento</b> quadrado pra capa.
    Se algo falha, eu corrijo o prompt e gero de novo. A escala é julgada no olho contra o mockup, porque a
    medição por pixel não é confiável nessas fotos (o céu e o concreto Niemeyer entram como se fossem a arte azul).
  </div>

  <div class="eyebrow" style="margin-top:10px">Referências</div>
  <div class="refs">
    <figure>
      <img src="${imgs.atual}" alt="Capa atual">
      <figcaption><b>Capa atual na loja</b> · a arte saiu pequena demais. Este é o motivo do REFAZER.</figcaption>
    </figure>
    <figure>
      <img src="${imgs.mockup}" alt="Mockup de costas YouDraw">
      <figcaption><b>Mockup de costas (YouDraw)</b> · a fonte de escala. Alvo: costas 35,2 × 39,7 cm, arte enchendo as costas.</figcaption>
    </figure>
  </div>

  <section class="step">
    <div class="step-head"><h2>Geração 1</h2><span class="tag">primeira tentativa</span></div>
    <div class="grid">
      <figure><img src="${imgs.gen1}" alt="Geração 1"></figure>
      <div class="panel">
        <h3>Análise</h3>
        <div class="chips">
          ${chip(true, "Modelo")}
          ${chip(true, "Arte fiel")}
          ${chip(false, "Tamanho")}
          ${chip(false, "Enquadramento")}
        </div>
        <p><b>Certo:</b> mesmo modelo e cenário Niemeyer; a arte saiu fiel (arcanjo, dragão, auréola, raios, nuvens e o banner NIMBUS legível).</p>
        <p><b>Errado:</b> a arte ficou deslocada pra direita e menor que o mockup, e a imagem saiu deitada (paisagem). A capa da loja é quadrada.</p>
        <p><b>Correção pra próxima:</b> forçar enquadramento quadrado, modelo de costas pra câmera, e arte grande e centralizada igual ao mockup.</p>
      </div>
    </div>
  </section>

  <section class="step final">
    <div class="step-head"><h2>Geração 2</h2><span class="finalflag">Final</span></div>
    <div class="grid">
      <figure><img src="${imgs.gen2}" alt="Geração 2 final"></figure>
      <div class="panel">
        <h3>Análise</h3>
        <div class="chips">
          ${chip(true, "Modelo")}
          ${chip(true, "Arte fiel")}
          ${chip(true, "Tamanho")}
          ${chip(true, "Enquadramento")}
        </div>
        <p><b>Modelo:</b> de costas pra câmera, centralizado, costas inteiras à mostra.</p>
        <p><b>Arte:</b> fiel e legível, batendo com o mockup traço a traço.</p>
        <p><b>Tamanho:</b> arte grande e centralizada entre as omoplatas, enchendo a largura das costas como no mockup.</p>
        <p><b>Enquadramento:</b> quadrado 1:1, encaixa direto na capa da loja. Sem marca d'água.</p>
      </div>
    </div>
  </section>

  <footer>
    <p><b>Custo até aqui:</b> 2 gerações, cerca de R$0,20. <b>Saldo mal tocado.</b></p>
    <p><b>Próximo passo:</b> com o seu ok neste piloto, eu rodo o lote inteiro (os 16 REFAZER mais os 2 pares de hover), cada um com este mesmo método sequencial, e aí colocamos na loja preservando as capas antigas pra reverter.</p>
  </footer>
</div>`;

fs.writeFileSync(OUT, html, "utf8");
console.log("ok:", OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + " KB");

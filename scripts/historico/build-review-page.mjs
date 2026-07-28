import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const R = 'C:/Users/rober/Nimbus'
const L = `${R}/nuvemshop/assets/product-lifestyle/2026-07-16`
const OUT = `${L}/review/revisao-2026-07-17`
const dados = JSON.parse(fs.readFileSync(`${L}/review/fotos-a-refazer-2026-07-17.json`, 'utf8'))
const st = JSON.parse(fs.readFileSync(`${L}/generation-state.json`, 'utf8'))
const prods = Object.values(st.products || st)

fs.mkdirSync(`${OUT}/img`, { recursive: true })

const rotulos = {
  'texto-corrompido': 'Texto corrompido',
  'cor-errada': 'Cor da peça errada',
  'assinatura-deformada': 'Assinatura NIMBUS deformada',
  'arte-errada': 'Arte errada',
  'estampa-colada': 'Estampa parece colada',
  'anatomia-ia': 'Anatomia (mãos)',
  'posicao-errada': 'Posição da estampa',
  'escala-inflada': 'Escala inflada',
  'artefato-ia': 'Artefato de IA',
  outro: 'Referência inválida',
}

async function thumb(src, dest, w) {
  if (!src || !fs.existsSync(src)) return null
  await sharp(src).resize(w, null, { withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(dest)
  return path.basename(dest)
}

const cards = []
for (const e of dados.lista) {
  const p = prods.find((x) => String(x.productId) === String(e.id))
  const mock = p.view === 'back' ? p.hero : p.front
  const f = await thumb(p.output, `${OUT}/img/${e.id}-foto.jpg`, 620)
  const m = await thumb(mock, `${OUT}/img/${e.id}-mockup.jpg`, 380)
  const a = await thumb(p.artwork, `${OUT}/img/${e.id}-arte.jpg`, 380)
  cards.push({ ...e, foto: f, mockup: m, arte: a, vista: p.view === 'back' ? 'costas' : 'frente' })
  process.stdout.write('.')
}
console.log('\nthumbnails prontos:', cards.length)

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const card = (e, i) => `
<article class="card ${e.gravidade}" id="p${e.id}" data-g="${e.gravidade}">
  <header class="card__head">
    <div class="card__n">${i + 1}</div>
    <div class="card__id">
      <h2>${esc(e.produto)}</h2>
      <p class="meta">${esc(e.colecao)} · ${esc(e.cor)} · vista ${e.vista} · modelo ${esc(e.modelo || '?')} · <code>${e.id}</code></p>
    </div>
    <span class="tag tag--${e.gravidade}">${e.gravidade === 'alta' ? 'REFAZER' : 'AVALIAR'}</span>
  </header>

  <div class="imgs">
    <figure class="big">
      <figcaption>No ar na loja <b>(o defeito está aqui)</b></figcaption>
      ${e.foto ? `<a href="img/${e.foto}" target="_blank"><img src="img/${e.foto}" alt="foto no ar" loading="lazy"></a>` : '<div class="miss">sem foto</div>'}
    </figure>
    <div class="refs">
      <figure>
        <figcaption>Mockup YouDraw <span>(escala/posição)</span></figcaption>
        ${e.mockup ? `<a href="img/${e.mockup}" target="_blank"><img src="img/${e.mockup}" alt="mockup" loading="lazy"></a>` : '<div class="miss">sem mockup</div>'}
      </figure>
      <figure>
        <figcaption>Arte original <span>(conteúdo/texto)</span></figcaption>
        ${e.arte ? `<a href="img/${e.arte}" target="_blank"><img src="img/${e.arte}" alt="arte" loading="lazy"></a>` : '<div class="miss">sem arte mapeada</div>'}
      </figure>
    </div>
  </div>

  ${e.escala ? `<p class="escala">Escala medida: <b>${esc(e.escala)}</b></p>` : ''}

  <ul class="probs">
    ${e.problemas.map((p) => `<li><span class="t t--${p.tipo}">${esc(rotulos[p.tipo] || p.tipo)}</span><span class="d">${esc(p.detalhe)}</span></li>`).join('')}
  </ul>

  <footer class="card__foot">
    <a href="${esc(e.url)}" target="_blank">ver na loja ↗</a>
  </footer>
</article>`

const alta = cards.filter((c) => c.gravidade === 'alta')
const media = cards.filter((c) => c.gravidade === 'media')
const tipos = Object.entries(dados.porTipo).sort((a, b) => b[1] - a[1])

const html = `<title>NIMBUS · revisão das fotos</title>
<style>
  :root{--bg:#f7fbff;--fg:#1b2733;--muted:#667085;--navy:#0b2360;--gold:#e9c46a;--line:#dbe6f3;--card:#fff;--alta:#c0392b;--media:#b8860b}
  @media (prefers-color-scheme:dark){:root{--bg:#0d1420;--fg:#e6edf5;--muted:#93a1b5;--navy:#dcebfa;--line:#223049;--card:#141d2e}}
  :root[data-theme="dark"]{--bg:#0d1420;--fg:#e6edf5;--muted:#93a1b5;--navy:#dcebfa;--line:#223049;--card:#141d2e}
  :root[data-theme="light"]{--bg:#f7fbff;--fg:#1b2733;--muted:#667085;--navy:#0b2360;--line:#dbe6f3;--card:#fff}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 -apple-system,Segoe UI,Inter,system-ui,sans-serif}
  .wrap{max-width:1180px;margin:0 auto;padding:2rem 1.2rem 4rem}
  h1{font-size:clamp(1.6rem,4vw,2.3rem);margin:0 0 .3rem;letter-spacing:-.02em}
  .sub{color:var(--muted);margin:0 0 2rem}
  .resumo{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.8rem;margin-bottom:1.5rem}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1rem}
  .kpi b{display:block;font-size:1.9rem;line-height:1.1;color:var(--navy)}
  .kpi span{color:var(--muted);font-size:.82rem}
  .tipos{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1.6rem}
  .chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:.3rem .7rem;font-size:.8rem;color:var(--muted)}
  .chip b{color:var(--fg)}
  .nota{background:var(--card);border-left:4px solid var(--gold);border-radius:0 12px 12px 0;padding:1rem 1.2rem;margin-bottom:2rem;font-size:.92rem;color:var(--muted)}
  .nota b{color:var(--fg)}
  .filtros{position:sticky;top:0;z-index:5;background:var(--bg);padding:.8rem 0;border-bottom:1px solid var(--line);margin-bottom:1.5rem;display:flex;gap:.5rem;flex-wrap:wrap}
  .filtros button{background:var(--card);border:1px solid var(--line);color:var(--fg);border-radius:999px;padding:.45rem 1rem;font:inherit;font-size:.85rem;cursor:pointer}
  .filtros button.on{background:var(--navy);color:var(--bg);border-color:var(--navy)}
  h3.grupo{margin:2.5rem 0 1rem;font-size:1.1rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.3rem;margin-bottom:1.5rem;border-left:5px solid var(--line)}
  .card.alta{border-left-color:var(--alta)}
  .card.media{border-left-color:var(--media)}
  .card__head{display:flex;gap:.9rem;align-items:flex-start;margin-bottom:1rem}
  .card__n{flex:none;width:30px;height:30px;border-radius:50%;background:var(--navy);color:var(--bg);display:grid;place-items:center;font-size:.85rem;font-weight:700}
  .card__id{flex:1;min-width:0}
  .card__id h2{margin:0;font-size:1.12rem;letter-spacing:-.01em}
  .meta{margin:.15rem 0 0;color:var(--muted);font-size:.83rem}
  .meta code{background:var(--bg);padding:.05rem .35rem;border-radius:4px;font-size:.9em}
  .tag{flex:none;font-size:.7rem;font-weight:800;letter-spacing:.09em;padding:.28rem .6rem;border-radius:6px}
  .tag--alta{background:var(--alta);color:#fff}
  .tag--media{background:var(--media);color:#fff}
  .imgs{display:grid;grid-template-columns:1.55fr 1fr;gap:.9rem;margin-bottom:1rem}
  .refs{display:grid;grid-template-rows:1fr 1fr;gap:.9rem;min-width:0}
  figure{margin:0;min-width:0}
  figcaption{font-size:.74rem;color:var(--muted);margin-bottom:.3rem;letter-spacing:.02em}
  figcaption b{color:var(--alta)}
  figcaption span{opacity:.75}
  img{width:100%;height:auto;border-radius:10px;border:1px solid var(--line);display:block;background:var(--bg)}
  .miss{padding:1.5rem;text-align:center;color:var(--muted);font-size:.8rem;border:1px dashed var(--line);border-radius:10px}
  .escala{margin:.2rem 0 .8rem;font-size:.86rem;color:var(--muted);background:var(--bg);padding:.5rem .8rem;border-radius:8px}
  .probs{list-style:none;margin:0;padding:0;display:grid;gap:.55rem}
  .probs li{display:grid;grid-template-columns:auto 1fr;gap:.7rem;align-items:baseline;font-size:.88rem}
  .t{flex:none;font-size:.7rem;font-weight:700;letter-spacing:.03em;padding:.25rem .55rem;border-radius:6px;background:var(--bg);border:1px solid var(--line);white-space:nowrap}
  .t--texto-corrompido,.t--arte-errada,.t--cor-errada{border-color:var(--alta);color:var(--alta)}
  .t--estampa-colada,.t--escala-inflada,.t--posicao-errada{border-color:var(--media);color:var(--media)}
  .d{color:var(--muted);min-width:0}
  .card__foot{margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--line);font-size:.83rem}
  .card__foot a{color:var(--navy);text-decoration:none;font-weight:600}
  .card__foot a:hover{text-decoration:underline}
  @media (max-width:760px){.imgs{grid-template-columns:1fr}.refs{grid-template-rows:none;grid-template-columns:1fr 1fr}.probs li{grid-template-columns:1fr;gap:.2rem}}
</style>

<div class="wrap">
  <h1>NIMBUS · revisão das fotos lifestyle</h1>
  <p class="sub">Auditoria de 17/07/2026 · 26 das 49 fotos no ar têm problema confirmado</p>

  <div class="resumo">
    <div class="kpi"><b>49</b><span>fotos no ar</span></div>
    <div class="kpi"><b>26</b><span>com problema (53%)</span></div>
    <div class="kpi"><b>15</b><span>refazer (alta)</span></div>
    <div class="kpi"><b>11</b><span>avaliar (média)</span></div>
    <div class="kpi"><b>23</b><span>sem problema</span></div>
  </div>

  <div class="tipos">${tipos.map(([t, n]) => `<span class="chip"><b>${n}×</b> ${esc(rotulos[t] || t)}</span>`).join('')}</div>

  <div class="nota">
    <b>Como ler.</b> A imagem grande é a foto que está no ar. À direita, o <b>mockup da YouDraw</b> (manda na escala, posição, lado e em qual arte é a certa) e a <b>arte original</b> (manda no conteúdo e no texto). Clique em qualquer imagem para abrir em tamanho cheio.<br><br>
    <b>Confiança.</b> Cada reprovação passou por céticos que tentaram refutá-la; 6 alegações falsas foram descartadas e não estão aqui. Ainda assim, a palavra final é sua: se discordar de alguma, me diz e eu tiro da lista.
  </div>

  <div class="filtros">
    <button class="on" data-f="todos">todas (26)</button>
    <button data-f="alta">refazer (15)</button>
    <button data-f="media">avaliar (11)</button>
  </div>

  <h3 class="grupo" data-g="alta">Gravidade alta · refazer (${alta.length})</h3>
  ${alta.map((e, i) => card(e, i)).join('')}

  <h3 class="grupo" data-g="media">Gravidade média · avaliar (${media.length})</h3>
  ${media.map((e, i) => card(e, i + alta.length)).join('')}
</div>

<script>
  const bts = document.querySelectorAll('.filtros button')
  bts.forEach((b) => b.addEventListener('click', () => {
    bts.forEach((x) => x.classList.toggle('on', x === b))
    const f = b.dataset.f
    document.querySelectorAll('.card').forEach((c) => {
      c.style.display = f === 'todos' || c.dataset.g === f ? '' : 'none'
    })
    document.querySelectorAll('.grupo').forEach((h) => {
      h.style.display = f === 'todos' || h.dataset.g === f ? '' : 'none'
    })
  }))
</script>`

fs.writeFileSync(`${OUT}/index.html`, html)
console.log('gerado:', `${OUT}/index.html`)

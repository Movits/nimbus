async function inspectThemeCSS() {
  const url = 'https://dcdn-us.mitiendanube.com/stores/007/889/827/themes/baires/dart-style-critical-a77e00ffb8e86da7dd683d0c76dbfdbd.css';
  try {
    const res = await fetch(url);
    const css = await res.text();

    console.log('Finding all occurrences of product-item-secondary-images-loaded:');
    let idx = css.indexOf('product-item-secondary-images-loaded');
    while (idx !== -1) {
      console.log(`Index ${idx}:`);
      console.log(css.slice(Math.max(0, idx - 150), Math.min(css.length, idx + 250)));
      console.log('---');
      idx = css.indexOf('product-item-secondary-images-loaded', idx + 1);
    }
  } catch (err) {
    console.error(err);
  }
}

inspectThemeCSS();

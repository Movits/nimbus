async function inspectThemeCSS() {
  const url = 'https://dcdn-us.mitiendanube.com/stores/007/889/827/themes/baires/dart-style-critical-a77e00ffb8e86da7dd683d0c76dbfdbd.css';
  try {
    const res = await fetch(url);
    const css = await res.text();

    // Find all occurrences of 'item-image-secondary'
    console.log('Finding all occurrences of item-image-secondary:');
    let idx = css.indexOf('item-image-secondary');
    while (idx !== -1) {
      console.log(`Index ${idx}:`);
      console.log(css.slice(Math.max(0, idx - 150), Math.min(css.length, idx + 250)));
      console.log('---');
      idx = css.indexOf('item-image-secondary', idx + 1);
    }
  } catch (err) {
    console.error(err);
  }
}

inspectThemeCSS();

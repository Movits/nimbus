async function inspectThemeCSS() {
  const url = 'https://dcdn-us.mitiendanube.com/stores/007/889/827/themes/baires/dart-style-critical-a77e00ffb8e86da7dd683d0c76dbfdbd.css';
  try {
    console.log(`Fetching theme CSS: ${url}`);
    const res = await fetch(url);
    const css = await res.text();

    // Search for hover styles related to item-image or secondary images
    console.log('Searching for item-image or hover patterns in theme CSS...');
    const searchTerms = ['.item-image', 'item-image-secondary', 'secondary-image', 'item:hover', 'item-image-featured'];
    for (const term of searchTerms) {
      let idx = css.indexOf(term);
      console.log(`Term: "${term}" -> ${idx !== -1 ? 'Found' : 'Not Found'}`);
      if (idx !== -1) {
        // Print surrounding characters
        console.log(`Snippet around "${term}":`);
        console.log(css.slice(Math.max(0, idx - 100), Math.min(css.length, idx + 300)));
        console.log('---');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

inspectThemeCSS();

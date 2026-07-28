async function inspectCardImagesHTML() {
  const url = 'https://loja.nimbuswear.com.br/street';
  try {
    const res = await fetch(url);
    const html = await res.text();

    const id = '352728451';
    const index = html.indexOf(`data-product-id="${id}"`);
    if (index >= 0) {
      // Find the next occurrence of "<a" or "<div class=\"product-image" or "img"
      const imgContainerIndex = html.indexOf('<div class="product-image', index);
      const searchStart = imgContainerIndex >= 0 ? imgContainerIndex : index + 2500;

      const snippet = html.slice(searchStart, searchStart + 2000);
      console.log('--- IMAGES SNIPPET ---');
      console.log(snippet);
      console.log('-------------------------');
    } else {
      console.log(`Product ID ${id} not found in HTML`);
    }
  } catch (err) {
    console.error(err);
  }
}

inspectCardImagesHTML();

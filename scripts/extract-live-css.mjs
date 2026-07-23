async function checkHoverMechanism() {
  const url = 'https://loja.nimbuswear.com.br/street';
  const res = await fetch(url);
  const html = await res.text();

  // Check what the image container class looks like for a mono-cor product (352728451)
  // vs a multi-cor product
  const ids = ['352728451', '352725749']; // mono-cor vs multi-cor

  for (const id of ids) {
    const marker = `data-product-id="${id}"`;
    const idx = html.indexOf(marker);
    if (idx < 0) { console.log(`${id}: not found`); continue; }

    // Find the image container div (js-product-item-image-container-private)
    const containerMarker = 'js-product-item-image-container-private';
    const containerIdx = html.indexOf(containerMarker, idx);
    if (containerIdx < 0) { console.log(`${id}: no image container found`); continue; }

    // Extract the full tag
    const tagStart = html.lastIndexOf('<div', containerIdx);
    const tagEnd = html.indexOf('>', containerIdx);
    console.log(`\n${id}:`);
    console.log(html.slice(tagStart, tagEnd + 1));

    // Check for class names
    const classMatch = html.slice(tagStart, tagEnd + 1).match(/class="([^"]*)"/);
    if (classMatch) {
      console.log(`  Classes: ${classMatch[1]}`);
      console.log(`  Has secondary-images-disabled: ${classMatch[1].includes('secondary-images-disabled')}`);
      console.log(`  Has with-secondary-images: ${classMatch[1].includes('with-secondary-images')}`);
    }
  }
}

checkHoverMechanism();

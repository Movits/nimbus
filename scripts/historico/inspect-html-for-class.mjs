async function checkHTMLForClass() {
  const url = 'https://loja.nimbuswear.com.br/street';
  try {
    const res = await fetch(url);
    const html = await res.text();
    console.log(`Has product-item-secondary-images-loaded:`, html.includes('product-item-secondary-images-loaded'));
    console.log(`Has product-item-secondary-images-disabled:`, html.includes('product-item-secondary-images-disabled'));
    console.log(`Has secondary-images-disabled:`, html.includes('secondary-images-disabled'));
  } catch (err) {
    console.error(err);
  }
}

checkHTMLForClass();

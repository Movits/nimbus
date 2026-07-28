async function inspectImagesInsideCard() {
  const url = 'https://loja.nimbuswear.com.br/street';
  try {
    const res = await fetch(url);
    const html = await res.text();

    const id = '352728451';
    const index = html.indexOf(`data-product-id="${id}"`);
    if (index >= 0) {
      const variantsStart = html.indexOf('data-variants="', index);
      if (variantsStart >= 0) {
        const variantsEnd = html.indexOf('">', variantsStart);
        if (variantsEnd >= 0) {
          const subHtml = html.slice(variantsEnd + 2);
          // Find next product card container to isolate this card's HTML
          const nextCardIndex = subHtml.indexOf('js-item-product');
          const cardHtml = nextCardIndex >= 0 ? subHtml.slice(0, nextCardIndex) : subHtml;

          // Let's print all <img> tags inside this card
          const imgRegex = /<img[\s\S]*?>/gi;
          let match;
          console.log(`--- Images inside product card ${id} ---`);
          while ((match = imgRegex.exec(cardHtml)) !== null) {
            console.log(match[0]);
          }
          console.log('-----------------------------------------');

          // Let's also print the entire anchor tag content
          const anchorStart = cardHtml.indexOf('class="js-product-item-image-link-private ');
          if (anchorStart >= 0) {
            const anchorEnd = cardHtml.indexOf('</a>', anchorStart);
            if (anchorEnd >= 0) {
              console.log('--- Anchor tag inner HTML ---');
              console.log(cardHtml.slice(anchorStart, anchorEnd + 4));
              console.log('------------------------------');
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

inspectImagesInsideCard();

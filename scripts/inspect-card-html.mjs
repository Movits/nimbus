async function inspectCardHTML() {
  const url = 'https://loja.nimbuswear.com.br/street';
  try {
    const res = await fetch(url);
    const html = await res.text();

    // Find the product ID 352728451 and print its surrounding block
    const id = '352728451';
    const index = html.indexOf(id);
    if (index >= 0) {
      console.log(`Found ID ${id} at index ${index}.`);

      // Let's print 1500 characters before and after the ID to see the whole card HTML
      const start = Math.max(0, index - 1000);
      const end = Math.min(html.length, index + 2500);
      const snippet = html.slice(start, end);
      console.log('--- CARD HTML SNIPPET ---');
      console.log(snippet);
      console.log('-------------------------');
    } else {
      console.log(`Product ID ${id} not found in HTML of ${url}`);
    }
  } catch (err) {
    console.error(err);
  }
}

inspectCardHTML();

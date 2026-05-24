const PDFDocument = require('pdfkit');
const fs = require('fs');

async function test() {
  try {
    console.log("Fetching fonts from Cloudflare CDN...");
    const regRes = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
    const boldRes = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf');

    if (!regRes.ok || !boldRes.ok) {
      throw new Error(`Failed to download fonts: reg=${regRes.status}, bold=${boldRes.status}`);
    }

    const regBuffer = Buffer.from(await regRes.arrayBuffer());
    const boldBuffer = Buffer.from(await boldRes.arrayBuffer());
    console.log(`Fonts downloaded! Regular: ${regBuffer.length} bytes, Bold: ${boldBuffer.length} bytes`);

    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync('scratch/test_font.pdf', buffer);
      console.log("PDF written successfully with custom font buffers!");
    });

    // Register and use custom fonts
    doc.registerFont('Roboto-Regular', regBuffer);
    doc.registerFont('Roboto-Bold', boldBuffer);

    doc.font('Roboto-Bold').fontSize(20).text("Hello Beautiful World!", 100, 100);
    doc.font('Roboto-Regular').fontSize(14).text("This is Roboto Regular loaded from an in-memory buffer without any disk AFM dependencies.", 100, 140);
    
    doc.end();

  } catch (err) {
    console.error("FAIL:", err);
  }
}

test();

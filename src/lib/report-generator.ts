import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FullScanResult } from '@/lib/types';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export async function generatePdfReport(data: FullScanResult): Promise<Buffer> {
  const documentDefinition = {
    content: [
      { text: 'Scan Report', style: 'header' },
      { text: `Target: ${data.scanData.target}`, style: 'subheader' },
      { text: `IP Address: ${data.scanData.ip}` },
      // ... add more scan data to the report ...
    ],
    styles: {
      header: { fontSize: 22, bold: true },
      subheader: { fontSize: 18, bold: true },
    },
  };

  const pdfDoc = pdfMake.createPdfKitDocument(documentDefinition);
  const pdfChunks: Uint8Array[] = [];

  pdfDoc.on('data', (chunk) => {
    pdfChunks.push(chunk);
  });

  pdfDoc.on('end', () => {
    const pdfBuffer = Buffer.concat(pdfChunks);
    return pdfBuffer;
  });

  pdfDoc.end();
}
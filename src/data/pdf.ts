import * as PdfJs from "pdfjs-dist/legacy/build/pdf";
import fs from "fs/promises";

export async function loadPdfPages(path: string) {
  // read the PDF file from disk:
  const pdfData = await fs.readFile(path);

  // parse the PDF file:
  const pdf = await PdfJs.getDocument({
    data: new Uint8Array(
      pdfData.buffer,
      pdfData.byteOffset,
      pdfData.byteLength
    ),
    useSystemFonts: true, // see https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
  }).promise;

  const pageTexts: Array<{
    pageNumber: number;
    text: string;
  }> = [];

  // extract text from each page:
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const pageContent = await page.getTextContent();
    const text = pageContent.items
      // limit to TextItem, extract str:
      .filter((item) => (item as any).str != null)
      .map((item) => (item as any).str as string)
      .join(" ")
      .replace(/\s+/g, " ") // reduce multiple whitespaces to single space
      .trim();

    if (text.length > 0)
      pageTexts.push({
        pageNumber: i + 1,
        text,
      });
  }

  return pageTexts;
}

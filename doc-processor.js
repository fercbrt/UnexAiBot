const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const dotenv = require('dotenv')
const path = require('path');

dotenv.config();

const inputPath = process.env.INPUT_PATH;
const outputPath = process.env.OUTPUT_PATH;
const MAX_PAGES = 16;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

async function processDirectory(inputDirectory, outputDirectory) {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const files = fs.readdirSync(inputDirectory);

  for (const file of files) {
    const filePath = path.join(inputDirectory, file);
    if (path.extname(filePath) === '.pdf') {
      console.log(`Processing: ${file}`);
      await splitPdf(filePath, outputDirectory);
    }
  }
}

async function splitPdf(inputPath, outputDirectory) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const totalPages = pdfDoc.getPageCount();

  let partNumber = 1;
  let startPage = 0;

  while (startPage < totalPages) {
    const endPage = Math.min(startPage + MAX_PAGES, totalPages);
    const newPdfDoc = await PDFDocument.create();

    for (let i = startPage; i < endPage; i++) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await newPdfDoc.save();

    // Check file size, if exceeds limit, reduce the number of pages
    if (pdfBytes.length > MAX_FILE_SIZE) {
      console.warn(
        `Part ${partNumber} exceeds 20MB. Consider reducing MAX_PAGES or optimizing the PDF.`
      );
      return; // or handle splitting further, if needed
    }

    const outputFilePath = path.join(
      outputDirectory,
      `${path.basename(inputPath, '.pdf')}_part${partNumber}.pdf`
    );

    fs.writeFileSync(outputFilePath, pdfBytes);
    console.log(`Created: ${outputFilePath}`);

    partNumber++;
    startPage = endPage;
  }
}

processDirectory(inputPath, outputPath);


const PDFDocument = require('pdfkit');
const path = require('path');
const { excludeSpecialCharacters } = require('./stringUtils');
const fs = require('fs');

exports.generatePDF = (content, title, primary_characters, description) => {
  const doc = new PDFDocument({ autoFirstPage: false });

  const words = content.split(' ');
  const wordsPerPage = 300; // Number of words per page
  let currentPage = 0;
  let currentWordIndex = 0;

  // Add first page to the document
  doc.addPage();

  // Add title and description to the beginning of the PDF
  doc
    .font('Helvetica-Bold')
    .fontSize(25)
    .text(title, { align: 'center', fontWeight: 'bold' })
    .moveDown()
    .font('Courier')
    .fontSize(16)
    .text(`Primary Characters: ${primary_characters}`, { align: 'center', fontWeight: 'bold' })
    .moveDown()
    .font('Times-Roman')
    .fontSize(14)
    .text(description, { align: 'center' })
    .moveDown();

  while (currentWordIndex < words.length) {
    doc.addPage();
    
    // Add content to the page
    const currentPageWords = words.slice(currentWordIndex, currentWordIndex + wordsPerPage).join(' ');
    doc
      .font('Times-Roman')
      .fontSize(14)
      .text(currentPageWords, 100, 100);

    // Add page number at the center-bottom
    const pageNumberStr = `Page ${currentPage + 1}`;
    const pageNumberWidth = doc.widthOfString(pageNumberStr);
    const pageNumberX = (doc.page.width - pageNumberWidth) / 2;
    const pageNumberY = doc.page.height - 90;
    doc
      .fontSize(10)
      .text(pageNumberStr, pageNumberX, pageNumberY);

    currentWordIndex += wordsPerPage;
    currentPage++;
  }

  const date = new Date();
  const timestamp = date.getTime();
  const filename = `${title}_${timestamp}.pdf`;
  const validFileName = excludeSpecialCharacters(filename);
  // Get the base directory where the Node.js backend is running
  const baseDirectory = process.cwd();
  // Define the directory where you want to save the PDF file
  const downloadDirectory = path.join(baseDirectory, 'download');

  // You can create the download directory if it doesn't exist
  if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory);
  }
  const filepath = `${downloadDirectory}/${validFileName}`;
  
  // Set metadata for the PDF
  doc.info.Title = title;
  doc.info.Author = 'Keywords AI';
  doc.info.Subject = description;

  // Write the PDF file to disk
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);
  doc.end();
  
  stream.on('finish', () => {
    console.log(`PDF file saved as ${filepath}`);
  });
  
  stream.on('error', (err) => {
    console.error(`Error saving PDF file: ${err}`);
  });
};
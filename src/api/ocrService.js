import { createWorker } from 'tesseract.js';

export const processImageWithOCR = async (imageFile, progressCallback) => {
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        progressCallback(m.progress);
      }
    },
  });
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    return text;
  } catch (error) {
    console.error('OCR Processing Error:', error);
    throw new Error('Could not process the image.');
  } finally {
    await worker.terminate();
  }
};

export const parseOcrResult = (rawText) => {
  // ADD THIS FOR DEBUGGING: It will show us the exact text the OCR is producing.
  console.log("--- RAW OCR TEXT ---");
  console.log(rawText);
  console.log("--------------------");

  const lines = rawText.split('\n');

  const itemRegex = /(.+?)\s+(\d+)\s+([\d,]+\.\d{2})/;
  const simpleItemRegex = /^(?!.*\b(sub|total|cgst|sgst|tax)\b)(.+?)\s+([\d,]+\.\d{2})$/i;
  const subtotalRegex = /sub\s*total/i;
  const taxRegex = /(cgst|sgst)/i; // Be more specific to cgst/sgst
  const grandTotalRegex = /grand\s*total/i;

  const bill = {
    items: [],
    subtotal: 0,
    taxes: [],
    grandTotal: 0,
  };

  lines.forEach((line) => {
    const originalTrimmedLine = line.trim();
    // THE FIX: Clean the line and convert to lowercase for more reliable matching.
    const cleanedLine = originalTrimmedLine.toLowerCase();
    
    if (!cleanedLine) return;

    const priceMatch = originalTrimmedLine.match(/([\d,]+\.\d{2})$/);
    const amount = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;

    // Use the 'cleanedLine' for all tests
    if (grandTotalRegex.test(cleanedLine)) {
      bill.grandTotal = amount;
      return;
    }

    if (subtotalRegex.test(cleanedLine)) {
      bill.subtotal = amount;
      return;
    }

    if (taxRegex.test(cleanedLine)) {
      const taxMatch = cleanedLine.match(taxRegex);
      const taxName = taxMatch ? taxMatch[0].toUpperCase() : 'Tax';
      bill.taxes.push({ name: taxName, amount });
      return;
    }

    // Use the 'originalTrimmedLine' for extracting item names to preserve case
    let itemMatch = originalTrimmedLine.match(itemRegex);
    let simpleMatch = originalTrimmedLine.match(simpleItemRegex);

    if (itemMatch || simpleMatch) {
       let name, price, qty;
       if (itemMatch) {
           name = itemMatch[1].trim();
           qty = parseInt(itemMatch[2], 10);
           price = parseFloat(itemMatch[3].replace(',', ''));
       } else if (simpleMatch) {
           name = simpleMatch[2].trim();
           qty = 1;
           price = parseFloat(simpleMatch[3].replace(',', ''));
       }
      
      if (!isNaN(price) && name) {
        bill.items.push({
          id: `item-${Date.now()}-${Math.random()}`,
          name: name.replace(/[^a-zA-Z\s]/g, '').trim(),
          price: price,
          totalQty: qty,
          assignments: {},
        });
      }
    }
  });
  
  console.log('Parser Output:', bill);
  return bill;
};
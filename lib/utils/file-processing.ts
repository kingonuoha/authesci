// Polyfill DOMMatrix for pdf-parse (pdfjs-dist) in Node environment
if (typeof DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}

const pdf = require('pdf-parse');
import mammoth from 'mammoth';

export async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string | null> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.statusText}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileType === 'text/plain') {
      return buffer.toString('utf-8');
    }

    return null;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return null;
  }
}

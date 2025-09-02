import docxToPdf from "./docx-to-pdf";
import pdfToDocx from "./pdf-to-docx";

export const config = {
  api: { bodyParser: false },
};

// We need to parse the form data to get the convertTo parameter
async function parseForm(req) {
  const formidable = require('formidable');
  
  return new Promise((resolve, reject) => {
    const form = formidable();
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data to get convertTo parameter
    const { fields, files } = await parseForm(req);
    const convertTo = fields.convertTo ? fields.convertTo : null;

    // Store files in the request object so the other handlers can access them
    req.files = files;
    
    if (convertTo === "pdf") {
      return docxToPdf(req, res);
    } else if (convertTo === "docx") {
      return pdfToDocx(req, res);
    } else {
      return res.status(400).json({ error: "Invalid convertTo value" });
    }
  } catch (error) {
    console.error("Error in convert API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
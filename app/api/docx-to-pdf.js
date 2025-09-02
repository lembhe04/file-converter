import fs from "fs";
import path from "path";
import libre from "libreoffice-convert";
import { promisify } from "util";

export const config = {
  api: { bodyParser: false },
};

// Parse form data function
async function parseForm(req) {
  const formidable = require('formidable');
  
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

// Promisify the libreoffice convert function
const convertAsync = promisify(libre.convert);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let files;
    
    // Check if files were passed from the convert.js handler
    if (req.files) {
      files = req.files;
    } else {
      // Parse form data directly if called standalone
      const parsed = await parseForm(req);
      files = parsed.files;
    }
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const inputPath = file.filepath;
    const originalName = file.originalFilename || "document";
    const outputDir = path.dirname(inputPath);
    const baseName = path.basename(originalName, path.extname(originalName));
    const outputFile = path.join(outputDir, `${baseName}.pdf`);

    try {
      // Read the DOCX file
      const docxData = fs.readFileSync(inputPath);
      
      // Convert it to PDF
      const pdfData = await convertAsync(docxData, '.pdf', undefined);
      
      // Write the PDF to file
      fs.writeFileSync(outputFile, pdfData);
      
      // Send the PDF back to the client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}.pdf"`);
      res.send(pdfData);

      // Cleanup
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputFile);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    } catch (conversionError) {
      console.error("Conversion error:", conversionError);
      
      // Check if LibreOffice is installed
      const isWindows = process.platform === "win32";
      let libreOfficeHint = "";
      
      if (isWindows) {
        libreOfficeHint = " Please make sure LibreOffice is installed at 'C:\\Program Files\\LibreOffice\\program\\soffice.exe'";
      } else {
        libreOfficeHint = " Please make sure LibreOffice is installed (sudo apt-get install libreoffice on Ubuntu/Debian)";
      }
      
      res.status(500).json({ 
        error: "DOCX to PDF conversion failed." + libreOfficeHint
      });
    }
  } catch (err) {
    console.error("File parsing failed:", err);
    res.status(500).json({ error: "File parsing failed: " + err.message });
  }
}
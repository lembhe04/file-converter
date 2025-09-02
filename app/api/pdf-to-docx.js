import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import pdfParse from "pdf-parse";

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
    const originalName = file.originalFilename || "document";
    const dataBuffer = fs.readFileSync(file.filepath);

    try {
      const data = await pdfParse(dataBuffer);
      const baseName = path.basename(originalName, path.extname(originalName));

      // Create a more structured document with paragraphs
      const paragraphs = data.text
        .split(/\n\s*\n/) // Split by empty lines
        .filter(text => text.trim().length > 0)
        .map(text => new Paragraph({
          children: [new TextRun(text.trim())],
        }));

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs.length > 0 ? paragraphs : [new Paragraph("")],
        }],
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}.docx"`);
      res.send(buffer);

      // Cleanup
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    } catch (e) {
      console.error("Conversion error:", e);
      res.status(500).json({ error: "PDF to DOCX conversion failed" });
      
      // Cleanup on error
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }
  } catch (err) {
    console.error("File parsing failed:", err);
    return res.status(500).json({ error: "File parsing failed" });
  }
}
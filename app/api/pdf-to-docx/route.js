// import fs from "fs";
// import path from "path";
// import { Document, Packer, Paragraph, TextRun } from "docx";
// import pdfParse from "pdf-parse";
// import { NextResponse } from "next/server";

// export default async function pdfToDocx(file) {
//   try {
//     const filePath = file.filepath || file[0]?.filepath;
//     const originalName = file.originalFilename || "document.pdf";

//     const dataBuffer = fs.readFileSync(filePath);
//     const data = await pdfParse(dataBuffer);

//     const baseName = path.basename(originalName, path.extname(originalName));

//     const paragraphs = data.text
//       .split(/\n\s*\n/) // split into paragraphs
//       .filter((t) => t.trim().length > 0)
//       .map((t) => new Paragraph({ children: [new TextRun(t.trim())] }));

//     const doc = new Document({
//       sections: [{ properties: {}, children: paragraphs }],
//     });

//     const buffer = await Packer.toBuffer(doc);

//     // cleanup temp file
//     fs.unlink(filePath, () => {});

//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "Content-Disposition": `attachment; filename="${baseName}.docx"`,
//       },
//     });
//   } catch (err) {
//     console.error("PDF to DOCX error:", err);
//     return NextResponse.json({ error: "PDF to DOCX failed" }, { status: 500 });
//   }
// }
import formidable from "formidable";
import fs from "fs";
import { Document, Packer, Paragraph } from "docx";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { default: formidableLib } = await import("formidable");
  const form = formidableLib({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parsing failed" });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const dataBuffer = fs.readFileSync(file.filepath);

    try {
      // ⬇️ Dynamically import pdf-parse (fixes Vercel build error)
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(dataBuffer);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [new Paragraph(data.text)],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", "attachment; filename=converted.docx");
      res.send(buffer);

      fs.unlinkSync(file.filepath);
    } catch (e) {
      console.error("Conversion error:", e);
      res.status(500).json({ error: "PDF to DOCX failed" });
    }
  });
}

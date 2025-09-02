import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import pdfParse from "pdf-parse";
import { NextResponse } from "next/server";

export default async function pdfToDocx(file) {
  try {
    const filePath = file.filepath || file[0]?.filepath;
    const originalName = file.originalFilename || "document.pdf";

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const baseName = path.basename(originalName, path.extname(originalName));

    const paragraphs = data.text
      .split(/\n\s*\n/) // split into paragraphs
      .filter((t) => t.trim().length > 0)
      .map((t) => new Paragraph({ children: [new TextRun(t.trim())] }));

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const buffer = await Packer.toBuffer(doc);

    // cleanup temp file
    fs.unlink(filePath, () => {});

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${baseName}.docx"`,
      },
    });
  } catch (err) {
    console.error("PDF to DOCX error:", err);
    return NextResponse.json({ error: "PDF to DOCX failed" }, { status: 500 });
  }
}

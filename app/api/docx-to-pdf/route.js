import fs from "fs";
import path from "path";
import libre from "libreoffice-convert";
import { promisify } from "util";
import { NextResponse } from "next/server";

const libreConvert = promisify(libre.convert);

export default async function docxToPdf(file) {
  try {
    const filePath = file.filepath || file[0]?.filepath;
    const originalName = file.originalFilename || "document.docx";

    const data = fs.readFileSync(filePath);
    const pdfBuf = await libreConvert(data, ".pdf", undefined);

    const baseName = path.basename(originalName, path.extname(originalName));

    // cleanup temp file
    fs.unlink(filePath, () => {});

    return new NextResponse(pdfBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("DOCX to PDF error:", err);
    return NextResponse.json({ error: "DOCX to PDF failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const convertTo = formData.get("convertTo");

    if (!file || !convertTo) {
      return NextResponse.json({ error: "Missing file or format" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const inputPath = path.join(os.tmpdir(), `${randomUUID()}-${file.name}`);
    const tmpDir = os.tmpdir();

    await fs.writeFile(inputPath, bytes);

    const cmd = `soffice --headless --convert-to ${convertTo} --outdir "${tmpDir}" "${inputPath}"`;

    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error("LibreOffice error:", stderr || stdout);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    // ✅ Find the newest converted file in tmpDir
    const files = await fs.readdir(tmpDir);
    const convertedFiles = files
      .filter(f => f.endsWith(`.${convertTo}`))
      .map(f => ({
        name: f,
        time: fs.stat(path.join(tmpDir, f)).then(stat => stat.mtimeMs)
      }));

    const withTimes = await Promise.all(
      convertedFiles.map(async f => ({
        name: f.name,
        time: await f.time
      }))
    );

    const newest = withTimes.sort((a, b) => b.time - a.time)[0];
    const outputPath = path.join(tmpDir, newest.name);

    const outputFile = await fs.readFile(outputPath);

    return new NextResponse(outputFile, {
      headers: {
        "Content-Type":
          convertTo === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="converted.${convertTo}"`,
      },
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}

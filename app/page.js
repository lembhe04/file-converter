"use client";
import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("docx-to-pdf"); // "docx-to-pdf" | "pdf-to-docx"
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const accept = mode === "docx-to-pdf" ? ".docx" : ".pdf";
  const buttonText = mode === "docx-to-pdf" ? "Convert to PDF" : "Convert to DOCX";

  const onFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setError("");
  };

  async function handleConvert() {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("convertTo", mode === "docx-to-pdf" ? "pdf" : "docx");

      const res = await fetch("/api/convert", { method: "POST", body: form });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Conversion failed");
      }

      // Figure out a filename from headers (fallback if missing)
      const disp = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^"]+)"?/i.exec(disp);
      const filename = match?.[1] || (mode === "docx-to-pdf" ? "converted.pdf" : "converted.docx");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e.message || "Conversion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
<div className="container w-7xl h-screen mx-auto flex flex-col justify-center items-center ">
      <div style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 27 }}>PDF ⇄ DOCX Converter</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode("docx-to-pdf")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: mode === "docx-to-pdf" ? "2px solid #2563eb" : "1px solid #ccc",
            background: mode === "docx-to-pdf" ? "#eef2ff" : "white",
            cursor: "pointer",
          }}
        >
          DOCX → PDF
        </button>
        <button
          onClick={() => setMode("pdf-to-docx")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: mode === "pdf-to-docx" ? "2px solid #2563eb" : "1px solid #ccc",
            background: mode === "pdf-to-docx" ? "#eef2ff" : "white",
            cursor: "pointer",
          }}
        >
          PDF → DOCX
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input type="file" accept={accept} onChange={onFileChange} />
      </div>

      <button
        onClick={handleConvert}
        disabled={busy || !file}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: busy ? "#999" : "#2563eb",
          color: "white",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Converting…" : buttonText}
      </button>

      {error ? (
        <div style={{ marginTop: 12, color: "#b91c1c" }}>
          ⚠ {error}
        </div>
      ) : null}

      <p style={{ marginTop: 16, color: "#555", fontSize: 14 }}>
        Powered by LibreOffice (Windows command: <code>soffice</code>).
      </p>
    </div>
</div>
  );
}

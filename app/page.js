// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [mode, setMode] = useState("docx-to-pdf"); // "docx-to-pdf" | "pdf-to-docx"
//   const [file, setFile] = useState(null);
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState("");

//   const accept = mode === "docx-to-pdf" ? ".docx" : ".pdf";
//   const buttonText = mode === "docx-to-pdf" ? "Convert to PDF" : "Convert to DOCX";

//   const onFileChange = (e) => {
//     setFile(e.target.files[0] || null);
//     setError("");
//   };

//   async function handleConvert() {
//     if (!file) {
//       setError("Please choose a file first.");
//       return;
//     }

//     setBusy(true);
//     setError("");
//     try {
//       const form = new FormData();
//       form.append("file", file);
//       form.append("convertTo", mode === "docx-to-pdf" ? "pdf" : "docx");

//       const res = await fetch("/api/convert", { method: "POST", body: form });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Conversion failed");
//       }

//       // Figure out a filename from headers (fallback if missing)
//       const disp = res.headers.get("Content-Disposition") || "";
//       const match = /filename="?([^"]+)"?/i.exec(disp);
//       const filename = match?.[1] || (mode === "docx-to-pdf" ? "converted.pdf" : "converted.docx");

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error(e);
//       setError(e.message || "Conversion failed");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
// <div className="container w-7xl h-screen mx-auto flex flex-col justify-center items-center ">
//       <div style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "system-ui, Arial" }}>
//       <h1 style={{ marginBottom: 27 }}>PDF ⇄ DOCX Converter</h1>

//       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//         <button
//           onClick={() => setMode("docx-to-pdf")}
//           style={{
//             padding: "8px 12px",
//             borderRadius: 8,
//             border: mode === "docx-to-pdf" ? "2px solid #2563eb" : "1px solid #ccc",
//             background: mode === "docx-to-pdf" ? "#eef2ff" : "white",
//             cursor: "pointer",
//           }}
//         >
//           DOCX → PDF
//         </button>
//         <button
//           onClick={() => setMode("pdf-to-docx")}
//           style={{
//             padding: "8px 12px",
//             borderRadius: 8,
//             border: mode === "pdf-to-docx" ? "2px solid #2563eb" : "1px solid #ccc",
//             background: mode === "pdf-to-docx" ? "#eef2ff" : "white",
//             cursor: "pointer",
//           }}
//         >
//           PDF → DOCX
//         </button>
//       </div>

//       <div style={{ marginBottom: 12 }}>
//         <input type="file" accept={accept} onChange={onFileChange} />
//       </div>

//       <button
//         onClick={handleConvert}
//         disabled={busy || !file}
//         style={{
//           padding: "10px 16px",
//           borderRadius: 8,
//           border: "none",
//           background: busy ? "#999" : "#2563eb",
//           color: "white",
//           cursor: busy ? "not-allowed" : "pointer",
//         }}
//       >
//         {busy ? "Converting…" : buttonText}
//       </button>

//       {error ? (
//         <div style={{ marginTop: 12, color: "#b91c1c" }}>
//           ⚠ {error}
//         </div>
//       ) : null}

//       <p style={{ marginTop: 16, color: "#555", fontSize: 14 }}>
//         Powered by LibreOffice (Windows command: <code>soffice</code>).
//       </p>
//     </div>
// </div>
//   );
// }
"use client";

import Footer from "@/component/Footer";
import Navbar from "@/component/Navbar";
import { useState } from "react";

export default function ConvertPage() {
  const [file, setFile] = useState(null);
  const [convertTo, setConvertTo] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please upload a file first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("convertTo", convertTo);

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Use text() instead of json() so it won’t crash if API sends HTML
        const errText = await res.text();
        throw new Error(errText || "Conversion failed");
      }

      // ✅ If conversion succeeds, download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const ext = convertTo === "pdf" ? "pdf" : "docx";
      const base = file.name.replace(/\.[^.]+$/, "");
      const filename = `${base}.${ext}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Conversion failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl h-auto mx-auto  p-8 ">

      <div className="sm:max-w-3xl  mx-auto sm:p-4  sm:mb-10">
        <h1 className="sm:text-6xl font-extrabold text-2xl text-center py-15 sm:p-20">File Converter</h1>
        <p className="text-center px-8 text-gray-500 mb-20">Convert DOCX to PDF and PDF to DOCX easily.It's an online file converter. We support nearly all audio,
          video, document, ebook, archive, image, spreadsheet, and presentation
          formats. To get started, use the button below and select files to
          convert from your computer.</p>
      </div>

      <form onSubmit={handleSubmit} className=" ">
       <div className="flex flex-col gap-4  max-w-md mx-auto justify-center items-center ">
         <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full bg-gray-100 hover:text-gray-500 border-gray-100 sm:w-100 rounded-2xl p-4 "
        />

        <select
          value={convertTo}
          onChange={(e) => setConvertTo(e.target.value)}
          className="block border w-full bg-gray-100 hover:text-gray-500 border-gray-100 sm:w-100 rounded-2xl p-4 "
        >
          <option value="pdf">Convert DOCX → PDF</option>
          <option value="docx">Convert PDF → DOCX</option>
        </select>
        
         <button
          type="submit"
          disabled={loading}
          className="py-3 sm:mt-8 w-full bg-blue-600 sm:w-100 text-white rounded-2xl disabled:opacity-50 hover:bg-blue-700 hover:text-gray-200"
        >
          {loading ? "Converting..." : "Convert"}
        </button>
       </div>
        
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    

        <div className="mt-40">
            <Footer />
        </div>
    </div>
  );
}

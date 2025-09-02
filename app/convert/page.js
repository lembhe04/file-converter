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

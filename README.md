# 📄 File Converter (DOCX ↔ PDF)

A simple **Next.js** web app to convert files between **DOCX** and **PDF** formats using **LibreOffice** in the backend.  
Users can easily upload a file, select conversion type, and download the converted file instantly.

---

## 🚀 Features
- Convert **DOCX → PDF**
- Convert **PDF → DOCX**
- Simple UI with **React + TailwindCSS**
- File upload and instant download
- Responsive design with navbar & footer

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, React, TailwindCSS
- **Backend:** Next.js API routes
- **File Conversion:** LibreOffice (`soffice` CLI)
- **Deployment Ready:** Works locally and can be hosted on Vercel/Render with LibreOffice installed

---

## 📂 Project Structure
```
app
├── api
│ └── convert
│ └── route.js # API for file conversion
│ └── pdf-to-docx
│ └── route.js # API for pdf conversion
│ └── docx-to-pdf
│ └── route.js # API for docx conversion
├── component
│ ├── Navbar.js # Top navigation bar
│ └── Footer.js # Footer component
├── convert
│ └── page.js # File conversion page (UI)
├── public # Static assets
├── package.json
└── README.md
```


## Getting Started

First, run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



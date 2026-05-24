# Dev Utility Hub

A multi-utility developer web app built with **Next.js 14** (App Router), **TypeScript**, and **Tailwind CSS**.

## Tools

| Tool | Route |
|------|-------|
| Dashboard | `/dashboard` |
| Base64 Encoder / Decoder | `/tools/base64` |
| JSON Formatter & Validator | `/tools/json` |
| PDF → DOCX Converter | `/tools/pdf` |
| Image Converter (JPG ↔ PNG) | `/tools/image` |
| UUID Generator | `/tools/uuid` |
| URL Encoder / Decoder | `/tools/url` |
| PDF Merge | `/tools/pdf-merge` |
| PDF Split | `/tools/pdf-split` |
| CSV ↔ JSON Converter | `/tools/csv-json` |
| XML Formatter | `/tools/xml` |

## Getting Started

```bash
cd dev-utility-hub
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the root path redirects to `/dashboard`.

## Build & Deploy

```bash
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com) with zero config — this project is Vercel-ready.

## API Routes

- `POST /api/convert/pdf` — PDF upload → mock DOCX download (see route file for real conversion TODO)
- `POST /api/convert/image` — Image conversion via Sharp (server-side fallback)
- `POST /api/pdf/merge` — Merge multiple PDFs (pdf-lib)
- `POST /api/pdf/split` — Split by page range or export all pages as ZIP (pdf-lib + jszip)

## PDF Conversion (Production)

The PDF route currently returns a **mock** DOCX placeholder. To enable real conversion, edit `app/api/convert/pdf/route.ts` and integrate libraries such as `pdf-parse` + `docx`, or a headless LibreOffice pipeline for layout fidelity.

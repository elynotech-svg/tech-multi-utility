export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
};

export const tools: ToolDefinition[] = [
  {
    id: "base64",
    title: "Base64 Encoder / Decoder",
    description: "Encode or decode text to and from Base64.",
    icon: "🔐",
    href: "/tools/base64",
  },
  {
    id: "json",
    title: "JSON Formatter & Validator",
    description: "Format and validate JSON with clear error messages.",
    icon: "{ }",
    href: "/tools/json",
  },
  {
    id: "pdf",
    title: "PDF → DOCX Converter",
    description: "Upload a PDF and download a converted DOCX file.",
    icon: "📄",
    href: "/tools/pdf",
  },
  {
    id: "image",
    title: "Image Converter",
    description: "Convert images between JPG and PNG formats.",
    icon: "🖼️",
    href: "/tools/image",
  },
  {
    id: "uuid",
    title: "UUID Generator",
    description: "Generate random UUID v4 identifiers in bulk.",
    icon: "🆔",
    href: "/tools/uuid",
  },
  {
    id: "url",
    title: "URL Encoder / Decoder",
    description: "Encode or decode URL components safely.",
    icon: "🔗",
    href: "/tools/url",
  },
  {
    id: "pdf-merge",
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document.",
    icon: "📎",
    href: "/tools/pdf-merge",
  },
  {
    id: "pdf-split",
    title: "PDF Split",
    description: "Extract page ranges or split every page into separate files.",
    icon: "✂️",
    href: "/tools/pdf-split",
  },
  {
    id: "csv-json",
    title: "CSV ↔ JSON Converter",
    description: "Convert between CSV spreadsheets and JSON arrays.",
    icon: "📊",
    href: "/tools/csv-json",
  },
  {
    id: "xml",
    title: "XML Formatter",
    description: "Format and validate XML with readable indentation.",
    icon: "📋",
    href: "/tools/xml",
  },
];

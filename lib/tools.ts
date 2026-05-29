export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  keywords: string[];
};

export const tools: ToolDefinition[] = [
  {
    id: "base64",
    title: "Base64 Encoder / Decoder",
    description: "Encode or decode text to and from Base64.",
    icon: "🔐",
    href: "/tools/base64",
    keywords: ["base64 encoder", "base64 decoder", "encode base64", "decode base64"],
  },
  {
    id: "json",
    title: "JSON Formatter & Validator",
    description: "Format and validate JSON with clear error messages.",
    icon: "{ }",
    href: "/tools/json",
    keywords: ["json formatter", "json validator", "pretty print json", "validate json"],
  },
  {
    id: "dataweave",
    title: "DataWeave Learn Lab",
    description: "Learn MuleSoft DataWeave 2.x with examples, snippets, and script templates.",
    icon: "DW",
    href: "/tools/dataweave",
    keywords: [
      "dataweave",
      "mulesoft dataweave",
      "dataweave tutorial",
      "dataweave examples",
      "dataweave playground",
    ],
  },
  {
    id: "pdf",
    title: "PDF → DOCX Converter",
    description: "Upload a PDF and download a converted DOCX file.",
    icon: "📄",
    href: "/tools/pdf",
    keywords: ["pdf to docx", "pdf converter", "convert pdf to word"],
  },
  {
    id: "image",
    title: "Image Converter",
    description: "Convert images between JPG and PNG formats.",
    icon: "🖼️",
    href: "/tools/image",
    keywords: ["image converter", "jpg to png", "png to jpg", "convert image"],
  },
  {
    id: "uuid",
    title: "UUID Generator",
    description: "Generate random UUID v4 identifiers in bulk.",
    icon: "🆔",
    href: "/tools/uuid",
    keywords: ["uuid generator", "uuid v4", "random uuid", "guid generator"],
  },
  {
    id: "url",
    title: "URL Encoder / Decoder",
    description: "Encode or decode URL components safely.",
    icon: "🔗",
    href: "/tools/url",
    keywords: ["url encoder", "url decoder", "encode url", "decode url"],
  },
  {
    id: "pdf-merge",
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document.",
    icon: "📎",
    href: "/tools/pdf-merge",
    keywords: ["merge pdf", "combine pdf", "pdf merger"],
  },
  {
    id: "pdf-split",
    title: "PDF Split",
    description: "Extract page ranges or split every page into separate files.",
    icon: "✂️",
    href: "/tools/pdf-split",
    keywords: ["split pdf", "extract pdf pages", "pdf splitter"],
  },
  {
    id: "csv-json",
    title: "CSV ↔ JSON Converter",
    description: "Convert between CSV spreadsheets and JSON arrays.",
    icon: "📊",
    href: "/tools/csv-json",
    keywords: ["csv to json", "json to csv", "csv converter", "json converter"],
  },
  {
    id: "xml",
    title: "XML Formatter",
    description: "Format and validate XML with readable indentation.",
    icon: "📋",
    href: "/tools/xml",
    keywords: ["xml formatter", "xml validator", "pretty print xml", "validate xml"],
  },
];

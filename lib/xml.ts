function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function serializeNode(node: Node, indent: number): string {
  const pad = "  ".repeat(indent);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() ?? "";
    if (!text) return "";
    return `${pad}${escapeXml(text)}\n`;
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.textContent ?? ""}]]>\n`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as Element;
  const tag = el.tagName;
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${escapeXml(a.value)}"`)
    .join("");

  const children = Array.from(el.childNodes).filter(
    (c) => c.nodeType !== Node.TEXT_NODE || (c.textContent?.trim() ?? "").length > 0
  );

  if (children.length === 0) {
    return `${pad}<${tag}${attrs} />\n`;
  }

  const hasOnlyText =
    children.length === 1 && children[0].nodeType === Node.TEXT_NODE;

  if (hasOnlyText) {
    const text = children[0].textContent ?? "";
    return `${pad}<${tag}${attrs}>${escapeXml(text)}</${tag}>\n`;
  }

  let out = `${pad}<${tag}${attrs}>\n`;
  for (const child of children) {
    out += serializeNode(child, indent + 1);
  }
  out += `${pad}</${tag}>\n`;
  return out;
}

export function formatXml(xml: string): string {
  const trimmed = xml.trim();
  if (!trimmed) {
    throw new Error("Please enter XML to format.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "application/xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    const msg =
      parseError.textContent?.replace(/\s+/g, " ").trim() ?? "Invalid XML";
    throw new Error(msg);
  }

  const root = doc.documentElement;
  if (!root) {
    throw new Error("No root element found.");
  }

  const declaration = trimmed.startsWith("<?xml")
    ? '<?xml version="1.0" encoding="UTF-8"?>\n'
    : "";

  return declaration + serializeNode(root, 0).trimEnd();
}

export function validateXml(xml: string): void {
  const trimmed = xml.trim();
  if (!trimmed) {
    throw new Error("Please enter XML to validate.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "application/xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    const msg =
      parseError.textContent?.replace(/\s+/g, " ").trim() ?? "Invalid XML";
    throw new Error(msg);
  }
}

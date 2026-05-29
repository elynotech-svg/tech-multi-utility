import type { Metadata } from "next";
import { tools } from "@/lib/tools";

export const siteConfig = {
  name: "Tech Multi Utility",
  url: "https://techmultiutility.vercel.app",
  description:
    "Free online developer tools for learning DataWeave, formatting JSON and XML, encoding Base64 and URLs, converting CSV, generating UUIDs, and working with PDF and image files.",
};

export const siteKeywords = [
  "developer tools",
  "online utilities",
  "JSON formatter",
  "DataWeave tutorial",
  "Base64 encoder",
  "URL encoder",
  "UUID generator",
  "PDF tools",
  "image converter",
  "CSV to JSON",
  "XML formatter",
];

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    keywords: [...siteKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function getToolMetadata(toolId: string): Metadata {
  const tool = tools.find((item) => item.id === toolId);

  if (!tool) {
    return buildPageMetadata({
      title: "Developer Tool",
      description: siteConfig.description,
      path: "/",
    });
  }

  return buildPageMetadata({
    title: `${tool.title} - Free Online Tool`,
    description: `${tool.description} Use this free browser-based utility on ${siteConfig.name}.`,
    path: tool.href,
    keywords: tool.keywords,
  });
}

export function getToolStructuredData(toolId: string) {
  const tool = tools.find((item) => item.id === toolId);

  if (!tool) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: tool.description,
    url: new URL(tool.href, siteConfig.url).toString(),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { getToolMetadata, getToolStructuredData } from "@/lib/seo";

export const metadata = getToolMetadata("pdf");

export default function PdfLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StructuredData data={getToolStructuredData("pdf")} />
    </>
  );
}

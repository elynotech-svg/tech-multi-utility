import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { getToolMetadata, getToolStructuredData } from "@/lib/seo";

export const metadata = getToolMetadata("xml");

export default function XmlLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StructuredData data={getToolStructuredData("xml")} />
    </>
  );
}

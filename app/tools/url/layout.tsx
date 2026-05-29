import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { getToolMetadata, getToolStructuredData } from "@/lib/seo";

export const metadata = getToolMetadata("url");

export default function UrlLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StructuredData data={getToolStructuredData("url")} />
    </>
  );
}

import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { getToolMetadata, getToolStructuredData } from "@/lib/seo";

export const metadata = getToolMetadata("image");

export default function ImageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StructuredData data={getToolStructuredData("image")} />
    </>
  );
}

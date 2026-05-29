import type { ReactNode } from "react";
import { StructuredData } from "@/components/StructuredData";
import { getToolMetadata, getToolStructuredData } from "@/lib/seo";

export const metadata = getToolMetadata("uuid");

export default function UuidLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StructuredData data={getToolStructuredData("uuid")} />
    </>
  );
}

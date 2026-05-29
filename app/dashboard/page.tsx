import { Card } from "@/components/Card";
import { buildPageMetadata, siteConfig } from "@/lib/seo";
import { tools } from "@/lib/tools";

export const metadata = buildPageMetadata({
  title: "All Developer Tools",
  description:
    "Browse free online utilities for DataWeave, JSON, XML, Base64, URLs, UUIDs, PDFs, images, and CSV data.",
  path: "/dashboard",
  keywords: ["free developer tools", "web utilities", "online dev tools", "dataweave examples"],
});

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{siteConfig.name}</h1>
        <p className="mt-2 text-slate-600">
          A collection of developer tools in one place. Pick a utility to get
          started.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
}

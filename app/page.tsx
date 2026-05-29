import { Card } from "@/components/Card";
import { StructuredData } from "@/components/StructuredData";
import { siteConfig } from "@/lib/seo";
import { tools } from "@/lib/tools";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    hasPart: tools.map((tool) => ({
      "@type": "WebApplication",
      name: tool.title,
      description: tool.description,
      url: new URL(tool.href, siteConfig.url).toString(),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
    })),
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Free online developer utilities
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Format, convert, encode, and generate data faster.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {siteConfig.name} brings everyday developer tools together in one
          browser-based workspace for DataWeave, JSON, XML, Base64, URLs,
          UUIDs, PDFs, images, and CSV data.
        </p>
      </section>

      <section aria-labelledby="tools-heading">
        <div className="mb-6">
          <h2 id="tools-heading" className="text-2xl font-bold text-slate-900">
            Developer tools
          </h2>
          <p className="mt-2 text-slate-600">
            Choose a utility below to clean up data, convert files, or generate
            identifiers directly in your browser.
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
      </section>

      <section
        aria-labelledby="why-heading"
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3"
      >
        <div className="sm:col-span-3">
          <h2 id="why-heading" className="text-xl font-bold text-slate-900">
            Why use {siteConfig.name}?
          </h2>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Fast workflows</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Open a focused tool, paste input, and get formatted or converted
            output without extra setup.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Common formats</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Work with JSON, XML, CSV, Base64, URL components, UUIDs, PDF files,
            JPG or PNG images, and MuleSoft DataWeave examples.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Simple access</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Use the tools from any modern browser on desktop or mobile, with no
            account needed.
          </p>
        </div>
      </section>

      <StructuredData data={structuredData} />
    </div>
  );
}

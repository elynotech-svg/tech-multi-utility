import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { siteConfig, siteKeywords } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} | Free Online Developer Tools`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} | Free Online Developer Tools`,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} | Free Online Developer Tools`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-lg font-semibold text-slate-900 hover:text-accent"
            >
              {siteConfig.name}
            </Link>
            <nav className="text-sm text-slate-600">
              <Link href="/dashboard" className="hover:text-accent">
                Tools
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

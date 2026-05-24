import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Utility Hub",
  description:
    "Developer utilities: Base64, JSON, PDF, images, UUIDs, and URL encoding.",
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
              href="/dashboard"
              className="text-lg font-semibold text-slate-900 hover:text-accent"
            >
              Dev Utility Hub
            </Link>
            <nav className="text-sm text-slate-600">
              <Link href="/dashboard" className="hover:text-accent">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

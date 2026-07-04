import type { Metadata } from "next";
import "./globals.css";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: {
    default: `${company.name} — Auto Parts Manufacturer`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}

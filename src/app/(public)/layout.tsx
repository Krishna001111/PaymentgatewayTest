import Link from "next/link";
import { company, whatsappLink } from "@/lib/company";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-amber-500 font-black text-slate-900">
              AP
            </span>
            <span className="text-lg font-bold tracking-wide">{company.name}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-2 py-1.5 hover:bg-slate-700 sm:px-3"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLink(`Hello ${company.name}, I would like to know more about your products.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded bg-green-600 px-3 py-1.5 font-medium hover:bg-green-500 sm:block"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 font-bold text-white">{company.name}</h3>
            <p className="text-sm">{company.description}</p>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-white">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-white">Contact</h3>
            <ul className="space-y-1 text-sm">
              <li>{company.address}</li>
              <li>
                {company.city}, {company.state} — {company.pincode}
              </li>
              <li>Phone: {company.phone}</li>
              <li>Email: {company.email}</li>
              <li>GSTIN: {company.gstin}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </div>
      </footer>
    </>
  );
}

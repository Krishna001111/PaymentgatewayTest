import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/sign-out-button";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/import", label: "Import Catalogue" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-56 shrink-0 flex-col bg-slate-900 text-slate-300 print:!hidden sm:flex">
        <Link href="/admin" className="flex items-center gap-2 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-sm font-black text-slate-900">
            AP
          </span>
          <span className="font-bold text-white">Admin</span>
        </Link>
        <nav className="flex-1 space-y-0.5 px-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4 text-xs">
          <p className="mb-2 truncate text-slate-400">{session.user.email}</p>
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:text-white">
              View site →
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 print:hidden sm:hidden">
          <span className="font-bold">AP Admin</span>
          <SignOutButton />
        </div>
        <main className="mx-auto max-w-5xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

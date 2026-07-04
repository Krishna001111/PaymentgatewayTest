import Link from "next/link";
import { db } from "@/lib/db";
import { getStockLevels } from "@/lib/stock";
import { formatINR, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AdminDashboard() {
  const [newEnquiries, publishedProducts, pendingOrders, unpaidInvoices, recentEnquiries, products] =
    await Promise.all([
      db.enquiry.count({ where: { status: "NEW" } }),
      db.product.count({ where: { isPublished: true } }),
      db.order.count({ where: { status: { in: ["QUOTATION", "CONFIRMED", "IN_PRODUCTION"] } } }),
      db.invoice.findMany({
        where: { paymentStatus: { not: "PAID" } },
        include: { payments: true },
      }),
      db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { product: true } }),
      db.product.findMany({ where: { isPublished: true } }),
    ]);

  const outstanding = unpaidInvoices.reduce(
    (sum, inv) => sum + inv.total - inv.payments.reduce((s, p) => s + p.amount, 0),
    0
  );

  const stock = await getStockLevels(products.map((p) => p.id));
  const lowStock = products.filter((p) => (stock.get(p.id) ?? 0) <= p.lowStockThreshold);

  const stats = [
    { label: "New Enquiries", value: newEnquiries, href: "/admin/enquiries" },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders" },
    { label: "Published Products", value: publishedProducts, href: "/admin/products" },
    { label: "Outstanding Amount", value: formatINR(outstanding), href: "/admin/invoices" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg bg-white p-5 shadow-sm transition hover:shadow"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-sm text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentEnquiries.map((e) => (
                <li key={e.id} className="py-2.5">
                  <Link href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {e.name}
                        {e.company ? ` — ${e.company}` : ""}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {e.product ? `${e.product.name} · ` : ""}
                        {formatDate(e.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="text-sm text-amber-600 hover:underline">
              Inventory
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">All stock levels are healthy.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">Part No: {p.partNumber}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                    {stock.get(p.id) ?? 0} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

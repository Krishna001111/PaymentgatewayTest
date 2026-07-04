import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default async function AdminReportsPage() {
  const [invoices, orderItems, customers] = await Promise.all([
    db.invoice.findMany({ include: { payments: true, customer: true } }),
    db.orderItem.findMany({
      where: { order: { status: { notIn: ["QUOTATION", "CANCELLED"] } } },
      include: { product: true },
    }),
    db.customer.findMany({ include: { invoices: { include: { payments: true } } } }),
  ]);

  // Monthly invoiced sales (last 6 months with data)
  const salesByMonth = new Map<string, number>();
  for (const inv of invoices) {
    const key = monthKey(inv.issuedAt);
    salesByMonth.set(key, (salesByMonth.get(key) ?? 0) + inv.total);
  }
  const months = [...salesByMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);

  // Top products by confirmed order value
  const byProduct = new Map<string, { name: string; partNumber: string; qty: number; value: number }>();
  for (const it of orderItems) {
    const entry = byProduct.get(it.productId) ?? {
      name: it.product.name,
      partNumber: it.product.partNumber,
      qty: 0,
      value: 0,
    };
    entry.qty += it.quantity;
    entry.value += it.quantity * it.unitPrice;
    byProduct.set(it.productId, entry);
  }
  const topProducts = [...byProduct.values()].sort((a, b) => b.value - a.value).slice(0, 8);

  // Outstanding receivables per customer
  const receivables = customers
    .map((c) => ({
      company: c.company,
      phone: c.phone,
      outstanding: c.invoices.reduce(
        (sum, inv) => sum + inv.total - inv.payments.reduce((s, p) => s + p.amount, 0),
        0
      ),
    }))
    .filter((r) => r.outstanding > 0.005)
    .sort((a, b) => b.outstanding - a.outstanding);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold">Invoiced Sales by Month</h2>
          {months.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {months.map(([key, total]) => (
                  <tr key={key}>
                    <td className="py-2 font-medium">{monthLabel(key)}</td>
                    <td className="py-2 text-right font-semibold">{formatINR(total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold">Outstanding by Customer</h2>
          {receivables.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No pending payments. 🎉</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {receivables.map((r) => (
                  <tr key={r.company}>
                    <td className="py-2">
                      <p className="font-medium">{r.company}</p>
                      <p className="text-xs text-slate-500">{r.phone}</p>
                    </td>
                    <td className="py-2 text-right font-semibold text-red-600">
                      {formatINR(r.outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Top Products (by confirmed order value)</h2>
        {topProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No confirmed orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr>
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Qty Ordered</th>
                <th className="py-2 text-right">Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((p) => (
                <tr key={p.partNumber}>
                  <td className="py-2">
                    {p.name} <span className="text-xs text-slate-500">({p.partNumber})</span>
                  </td>
                  <td className="py-2 text-right">{p.qty}</td>
                  <td className="py-2 text-right font-semibold">{formatINR(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

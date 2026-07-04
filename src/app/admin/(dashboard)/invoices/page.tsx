import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AdminInvoicesPage() {
  const invoices = await db.invoice.findMany({
    include: { customer: true, payments: true, order: true },
    orderBy: { createdAt: "desc" },
  });

  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + inv.total - inv.payments.reduce((s, p) => s + p.amount, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-sm">
          Outstanding: <span className="font-bold text-red-600">{formatINR(totalOutstanding)}</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice No.</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
              return (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="font-medium text-amber-600 hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{inv.customer.company}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${inv.orderId}`} className="hover:underline">
                      {inv.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">{formatINR(inv.total)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatINR(inv.total - paid)}
                  </td>
                  <td className="px-4 py-3">{formatDate(inv.issuedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.paymentStatus} />
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No invoices yet. Generate one from a confirmed order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

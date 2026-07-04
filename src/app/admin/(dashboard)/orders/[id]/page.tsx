import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/format";
import { updateOrderStatus, deleteOrder } from "@/lib/actions/orders";
import { StatusBadge } from "@/components/admin/status-badge";

const transitions: Record<string, string[]> = {
  QUOTATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      enquiry: true,
      invoices: true,
      items: { include: { product: true } },
    },
  });
  if (!order) notFound();

  const total = order.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const nextStatuses = transitions[order.status] ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Customer</p>
            <Link
              href={`/admin/customers/${order.customerId}`}
              className="font-medium text-amber-600 hover:underline"
            >
              {order.customer.company}
            </Link>
            <p className="text-xs text-slate-500">{order.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Created</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">From Enquiry</p>
            {order.enquiry ? (
              <Link
                href={`/admin/enquiries/${order.enquiry.id}`}
                className="font-medium text-amber-600 hover:underline"
              >
                {order.enquiry.name}
              </Link>
            ) : (
              <p className="font-medium">—</p>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2">
                  {it.product.name}
                  <span className="ml-1 text-xs text-slate-500">({it.product.partNumber})</span>
                </td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatINR(it.unitPrice)}</td>
                <td className="py-2 text-right">{formatINR(it.quantity * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 font-bold">
              <td colSpan={3} className="py-2 text-right">
                Total
              </td>
              <td className="py-2 text-right">{formatINR(total)}</td>
            </tr>
          </tfoot>
        </table>

        {order.notes && (
          <p className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-600">{order.notes}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/quotation`}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-amber-500"
          >
            View / Print Quotation
          </Link>
          {["CONFIRMED", "IN_PRODUCTION", "DISPATCHED", "DELIVERED"].includes(order.status) &&
            order.invoices.length === 0 && (
              <Link
                href={`/admin/invoices/new?order=${order.id}`}
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Generate Invoice
              </Link>
            )}
          {nextStatuses.map((s) => (
            <form key={s} action={updateOrderStatus.bind(null, order.id)} className="inline">
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                className={`rounded px-4 py-2 text-sm font-semibold ${
                  s === "CANCELLED"
                    ? "border border-red-300 text-red-600 hover:bg-red-50"
                    : "bg-amber-500 text-slate-900 hover:bg-amber-400"
                }`}
              >
                Mark {s.replace(/_/g, " ")}
              </button>
            </form>
          ))}
        </div>
      </div>

      {order.invoices.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-bold">Invoices</h2>
          <ul className="space-y-1 text-sm">
            {order.invoices.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3">
                <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-amber-600 hover:underline">
                  {inv.invoiceNumber}
                </Link>
                <span>{formatINR(inv.total)}</span>
                <StatusBadge status={inv.paymentStatus} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {order.invoices.length === 0 && (
        <form action={deleteOrder.bind(null, order.id)}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
            Delete this order
          </button>
        </form>
      )}
    </div>
  );
}

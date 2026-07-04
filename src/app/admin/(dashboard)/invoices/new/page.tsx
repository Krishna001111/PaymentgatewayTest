import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { createInvoice } from "@/lib/actions/invoices";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!order) notFound();

  const subtotal = order.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Generate Invoice</h1>
      <p className="text-sm text-slate-600">
        For order{" "}
        <Link href={`/admin/orders/${order.id}`} className="font-medium text-amber-600 hover:underline">
          {order.orderNumber}
        </Link>{" "}
        — {order.customer.company}
      </p>

      <form action={createInvoice} className="space-y-5 rounded-lg bg-white p-6 shadow-sm">
        <input type="hidden" name="orderId" value={order.id} />

        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2">{it.product.name}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatINR(it.quantity * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 font-bold">
              <td colSpan={2} className="py-2 text-right">
                Subtotal (before GST)
              </td>
              <td className="py-2 text-right">{formatINR(subtotal)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="flex flex-wrap items-end gap-6">
          <label className="block">
            <span className="text-sm font-medium">GST Rate (%)</span>
            <input
              name="gstRate"
              type="number"
              step="0.1"
              min="0"
              defaultValue={18}
              className="mt-1 w-28 rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm font-medium">
            <input name="isInterState" type="checkbox" />
            Inter-state supply (IGST instead of CGST + SGST)
          </label>
        </div>

        <button
          type="submit"
          className="rounded bg-amber-500 px-6 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Generate Invoice
        </button>
      </form>
    </div>
  );
}

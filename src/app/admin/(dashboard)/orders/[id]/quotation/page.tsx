import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { company } from "@/lib/company";
import { formatDate, formatINR } from "@/lib/format";
import { PrintButton } from "@/components/admin/print-button";

export default async function QuotationPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!order) notFound();

  const total = order.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/admin/orders/${order.id}`} className="text-sm text-amber-600 hover:underline">
          ← Back to order
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-amber-500 font-black text-slate-900">
                AP
              </span>
              <h1 className="text-2xl font-black">{company.name}</h1>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {company.address}, {company.city}, {company.state} — {company.pincode}
            </p>
            <p className="text-sm text-slate-600">
              Phone: {company.phone} · Email: {company.email}
            </p>
            <p className="text-sm text-slate-600">GSTIN: {company.gstin}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-400">Quotation</h2>
            <p className="mt-1 font-semibold">{order.orderNumber}</p>
            <p className="text-sm text-slate-600">Date: {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">To</p>
            <p className="font-bold">{order.customer.company}</p>
            <p className="text-sm">{order.customer.name}</p>
            {order.customer.address && (
              <p className="text-sm text-slate-600">
                {order.customer.address}
                {order.customer.city ? `, ${order.customer.city}` : ""}
                {order.customer.state ? `, ${order.customer.state}` : ""}
              </p>
            )}
            <p className="text-sm text-slate-600">Phone: {order.customer.phone}</p>
            {order.customer.gstin && (
              <p className="text-sm text-slate-600">GSTIN: {order.customer.gstin}</p>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b-2 border-slate-300 text-left">
            <tr>
              <th className="py-2">#</th>
              <th className="py-2">Description</th>
              <th className="py-2">Part No.</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((it, i) => (
              <tr key={it.id}>
                <td className="py-2">{i + 1}</td>
                <td className="py-2">{it.product.name}</td>
                <td className="py-2">{it.product.partNumber}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatINR(it.unitPrice)}</td>
                <td className="py-2 text-right">{formatINR(it.quantity * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 text-base font-bold">
              <td colSpan={5} className="py-3 text-right">
                Total
              </td>
              <td className="py-3 text-right">{formatINR(total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-2 text-xs text-slate-500">
          * Prices exclusive of GST. Taxes as applicable at the time of invoicing.
        </p>

        {order.notes && (
          <div className="mt-6 rounded bg-slate-50 p-4 text-sm">
            <p className="font-semibold">Notes / Terms</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-600">{order.notes}</p>
          </div>
        )}

        <div className="mt-10 flex justify-between text-sm">
          <p className="text-slate-500">This is a computer-generated quotation.</p>
          <div className="text-center">
            <p className="mb-10">For {company.name}</p>
            <p className="border-t border-slate-300 pt-1">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

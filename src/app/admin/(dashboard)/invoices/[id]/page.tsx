import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { company } from "@/lib/company";
import { formatDate, formatINR } from "@/lib/format";
import { recordPayment } from "@/lib/actions/invoices";
import { StatusBadge } from "@/components/admin/status-badge";
import { PrintButton } from "@/components/admin/print-button";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      payments: { orderBy: { paidAt: "desc" } },
      order: { include: { items: { include: { product: true } } } },
    },
  });
  if (!invoice) notFound();

  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const balance = invoice.total - paid;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <StatusBadge status={invoice.paymentStatus} />
        </div>
        <PrintButton />
      </div>

      {/* Printable tax invoice */}
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-amber-500 font-black text-slate-900">
                AP
              </span>
              <h2 className="text-2xl font-black">{company.name}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {company.address}, {company.city}, {company.state} — {company.pincode}
            </p>
            <p className="text-sm text-slate-600">
              Phone: {company.phone} · Email: {company.email}
            </p>
            <p className="text-sm font-medium text-slate-700">GSTIN: {company.gstin}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold uppercase tracking-wide text-slate-400">
              Tax Invoice
            </h3>
            <p className="mt-1 font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-sm text-slate-600">Date: {formatDate(invoice.issuedAt)}</p>
            <p className="text-sm text-slate-600">
              Order:{" "}
              <Link href={`/admin/orders/${invoice.orderId}`} className="hover:underline">
                {invoice.order.orderNumber}
              </Link>
            </p>
          </div>
        </div>

        <div className="py-6">
          <p className="text-xs font-semibold uppercase text-slate-400">Bill To</p>
          <p className="font-bold">{invoice.customer.company}</p>
          <p className="text-sm">{invoice.customer.name}</p>
          {invoice.customer.address && (
            <p className="text-sm text-slate-600">
              {invoice.customer.address}
              {invoice.customer.city ? `, ${invoice.customer.city}` : ""}
              {invoice.customer.state ? `, ${invoice.customer.state}` : ""}
            </p>
          )}
          {invoice.customer.gstin && (
            <p className="text-sm text-slate-600">GSTIN: {invoice.customer.gstin}</p>
          )}
        </div>

        <table className="w-full text-sm">
          <thead className="border-b-2 border-slate-300 text-left">
            <tr>
              <th className="py-2">#</th>
              <th className="py-2">Description</th>
              <th className="py-2">HSN</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.order.items.map((it, i) => (
              <tr key={it.id}>
                <td className="py-2">{i + 1}</td>
                <td className="py-2">
                  {it.product.name}
                  <span className="ml-1 text-xs text-slate-500">({it.product.partNumber})</span>
                </td>
                <td className="py-2">{it.product.hsnCode ?? "—"}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatINR(it.unitPrice)}</td>
                <td className="py-2 text-right">{formatINR(it.quantity * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(invoice.subtotal)}</span>
          </div>
          {invoice.isInterState ? (
            <div className="flex justify-between">
              <span>IGST ({invoice.gstRate}%)</span>
              <span>{formatINR(invoice.igst)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span>CGST ({invoice.gstRate / 2}%)</span>
                <span>{formatINR(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({invoice.gstRate / 2}%)</span>
                <span>{formatINR(invoice.sgst)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-slate-300 pt-1 text-base font-bold">
            <span>Total</span>
            <span>{formatINR(invoice.total)}</span>
          </div>
        </div>

        <div className="mt-10 flex justify-between text-sm">
          <p className="text-slate-500">This is a computer-generated invoice.</p>
          <div className="text-center">
            <p className="mb-10">For {company.name}</p>
            <p className="border-t border-slate-300 pt-1">Authorised Signatory</p>
          </div>
        </div>
      </div>

      {/* Payments — admin only, not printed */}
      <div className="no-print rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Payments</h2>
          <p className="text-sm">
            Paid: <span className="font-semibold text-green-700">{formatINR(paid)}</span> · Balance:{" "}
            <span className="font-semibold text-red-600">{formatINR(balance)}</span>
          </p>
        </div>

        {invoice.payments.length > 0 && (
          <table className="mb-4 w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Method</th>
                <th className="py-2">Reference</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2">{formatDate(p.paidAt)}</td>
                  <td className="py-2">{p.method}</td>
                  <td className="py-2">{p.reference ?? "—"}</td>
                  <td className="py-2 text-right">{formatINR(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {balance > 0 && (
          <form
            action={recordPayment.bind(null, invoice.id)}
            className="grid gap-3 sm:grid-cols-[140px_140px_1fr_auto] sm:items-end"
          >
            <label className="block">
              <span className="text-sm font-medium">Amount (₹)</span>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={balance}
                required
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Method</span>
              <select
                name="method"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {["UPI", "NEFT/RTGS", "Cheque", "Cash"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Reference</span>
              <input
                name="reference"
                placeholder="UTR / cheque no."
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
            >
              Record Payment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

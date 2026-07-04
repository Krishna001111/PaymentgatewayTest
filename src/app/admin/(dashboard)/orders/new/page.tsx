import Link from "next/link";
import { db } from "@/lib/db";
import { createOrder } from "@/lib/actions/orders";
import { OrderItemsEditor } from "@/components/admin/order-items-editor";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ enquiry?: string; error?: string }>;
}) {
  const { enquiry: enquiryId, error } = await searchParams;
  const [customers, products, enquiry] = await Promise.all([
    db.customer.findMany({ orderBy: { company: "asc" } }),
    db.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, partNumber: true, price: true },
    }),
    enquiryId ? db.enquiry.findUnique({ where: { id: enquiryId } }) : null,
  ]);

  if (customers.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">New Quotation</h1>
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">You need a customer before creating a quotation.</p>
          <Link
            href="/admin/customers/new"
            className="mt-4 inline-block rounded bg-amber-500 px-5 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
          >
            Add your first customer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Quotation</h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Please choose a customer and add at least one item.
        </div>
      )}

      {enquiry && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
          Creating from enquiry by <strong>{enquiry.name}</strong>
          {enquiry.company ? ` (${enquiry.company})` : ""} — “{enquiry.message.slice(0, 120)}
          {enquiry.message.length > 120 ? "…" : ""}”
        </div>
      )}

      <form action={createOrder} className="max-w-3xl space-y-5 rounded-lg bg-white p-6 shadow-sm">
        {enquiry && <input type="hidden" name="enquiryId" value={enquiry.id} />}
        <label className="block max-w-md">
          <span className="text-sm font-medium">Customer *</span>
          <select
            name="customerId"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} — {c.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-sm font-medium">Items *</span>
          <div className="mt-2">
            <OrderItemsEditor products={products} />
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            name="notes"
            rows={2}
            placeholder="Delivery terms, validity, transport details…"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-amber-500 px-6 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Create Quotation
        </button>
      </form>
    </div>
  );
}

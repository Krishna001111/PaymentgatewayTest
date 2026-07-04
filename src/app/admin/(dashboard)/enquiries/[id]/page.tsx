import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { updateEnquiry, deleteEnquiry } from "@/lib/actions/enquiries";
import { StatusBadge } from "@/components/admin/status-badge";
import { whatsappLink } from "@/lib/company";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: { product: true, orders: true },
  });
  if (!enquiry) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Enquiry from {enquiry.name}</h1>
        <StatusBadge status={enquiry.status} />
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Name</dt>
            <dd className="font-medium">{enquiry.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Company</dt>
            <dd className="font-medium">{enquiry.company ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Phone</dt>
            <dd className="font-medium">
              <a href={`tel:${enquiry.phone}`} className="hover:underline">
                {enquiry.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Email</dt>
            <dd className="font-medium">{enquiry.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Product</dt>
            <dd className="font-medium">
              {enquiry.product ? `${enquiry.product.name} (${enquiry.product.partNumber})` : "General enquiry"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Received</dt>
            <dd className="font-medium">{formatDate(enquiry.createdAt)}</dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <dt className="text-xs font-semibold uppercase text-slate-400">Message</dt>
          <dd className="mt-1 whitespace-pre-wrap">{enquiry.message}</dd>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={whatsappLink(`Hello ${enquiry.name}, thank you for your enquiry to AP Auto Parts.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
          >
            Reply on WhatsApp
          </a>
          <Link
            href={`/admin/orders/new?enquiry=${enquiry.id}`}
            className="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
          >
            Create Quotation
          </Link>
        </div>
      </div>

      {enquiry.orders.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-bold">Linked Orders</h2>
          <ul className="space-y-1 text-sm">
            {enquiry.orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="text-amber-600 hover:underline">
                  {o.orderNumber}
                </Link>{" "}
                — <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={updateEnquiry.bind(null, enquiry.id)} className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold">Update Status & Notes</h2>
        <div className="space-y-4">
          <label className="block max-w-xs">
            <span className="text-sm font-medium">Status</span>
            <select
              name="status"
              defaultValue={enquiry.status}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              {["NEW", "CONTACTED", "QUOTED", "WON", "CLOSED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Internal Notes</span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={enquiry.notes ?? ""}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700"
          >
            Save
          </button>
        </div>
      </form>

      <form action={deleteEnquiry.bind(null, enquiry.id)}>
        <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
          Delete this enquiry
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";

const statuses: EnquiryStatus[] = ["NEW", "CONTACTED", "QUOTED", "WON", "CLOSED"];

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = statuses.includes(status as EnquiryStatus)
    ? (status as EnquiryStatus)
    : undefined;

  const enquiries = await db.enquiry.findMany({
    where: filter ? { status: filter } : undefined,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Enquiries</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/enquiries"
          className={`rounded-full border px-3 py-1 text-sm font-medium ${
            !filter ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/enquiries?status=${s}`}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${
              filter === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enquiries.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/enquiries/${e.id}`} className="block">
                    <p className="font-medium">
                      {e.name}
                      {e.company ? ` — ${e.company}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">{e.phone}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">{e.product?.name ?? "General"}</td>
                <td className="px-4 py-3">{formatDate(e.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No enquiries here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

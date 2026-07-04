import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";

const statuses: OrderStatus[] = [
  "QUOTATION",
  "CONFIRMED",
  "IN_PRODUCTION",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = statuses.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const orders = await db.order.findMany({
    where: filter ? { status: filter } : undefined,
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders & Quotations</h1>
        <Link
          href="/admin/orders/new"
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          + New Quotation
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 text-sm font-medium ${
            !filter ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${
              filter === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
            }`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Order No.</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => {
              const total = o.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
              return (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-amber-600 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer.company}</td>
                  <td className="px-4 py-3">{formatINR(total)}</td>
                  <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No orders here yet. Create a quotation to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateCustomer } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/admin/customer-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/format";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{customer.company}</h1>
      <CustomerForm action={updateCustomer.bind(null, customer.id)} customer={customer} />

      <div className="max-w-2xl rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold">Order History</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {customer.orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-amber-600 hover:underline">
                  {o.orderNumber}
                </Link>
                <span className="text-slate-500">{formatDate(o.createdAt)}</span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

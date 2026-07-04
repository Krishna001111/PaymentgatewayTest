import Link from "next/link";
import { db } from "@/lib/db";
import { deleteCustomer } from "@/lib/actions/customers";

export default async function AdminCustomersPage() {
  const customers = await db.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { company: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link
          href="/admin/customers/new"
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          + Add Customer
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{c.company}</p>
                  {c.gstin && <p className="text-xs text-slate-500">GSTIN: {c.gstin}</p>}
                </td>
                <td className="px-4 py-3">
                  <p>{c.name}</p>
                  <p className="text-xs text-slate-500">{c.phone}</p>
                </td>
                <td className="px-4 py-3">
                  {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">{c._count.orders}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="mr-2 font-medium text-amber-600 hover:underline"
                  >
                    Edit
                  </Link>
                  {c._count.orders === 0 && (
                    <form action={deleteCustomer.bind(null, c.id)} className="inline">
                      <button type="submit" className="font-medium text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

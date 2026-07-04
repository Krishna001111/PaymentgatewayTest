import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { deleteProduct } from "@/lib/actions/catalog";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.partNumber}</p>
                </td>
                <td className="px-4 py-3">{p.category.name}</td>
                <td className="px-4 py-3">{p.price != null ? formatINR(p.price) : "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.isPublished ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Hidden"}
                  </span>
                  {p.isFeatured && (
                    <span className="ml-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="mr-2 font-medium text-amber-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteProduct.bind(null, p.id)} className="inline">
                    <button type="submit" className="font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No products yet. Add your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { createCategory, deleteCategory } from "@/lib/actions/catalog";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>

      <form action={createCategory} className="flex max-w-md gap-2">
        <input
          name="name"
          required
          placeholder="New category name"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Add
        </button>
      </form>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
                  {c._count.products === 0 ? (
                    <form action={deleteCategory.bind(null, c.id)} className="inline">
                      <button type="submit" className="font-medium text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-slate-400">In use</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

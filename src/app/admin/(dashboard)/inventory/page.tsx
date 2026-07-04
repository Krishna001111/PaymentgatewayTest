import { db } from "@/lib/db";
import { getStockLevels } from "@/lib/stock";
import { formatDate } from "@/lib/format";
import { addStockMovement } from "@/lib/actions/inventory";

export default async function AdminInventoryPage() {
  const [products, recentMovements] = await Promise.all([
    db.product.findMany({ include: { category: true }, orderBy: { name: "asc" } }),
    db.stockMovement.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);
  const stock = await getStockLevels();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <form
        action={addStockMovement}
        className="grid gap-3 rounded-lg bg-white p-5 shadow-sm sm:grid-cols-[1fr_110px_110px_140px_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="text-sm font-medium">Product</span>
          <select
            name="productId"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.partNumber})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">In / Out</span>
          <select
            name="direction"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Quantity</span>
          <input
            name="quantity"
            type="number"
            min="1"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Reason</span>
          <select
            name="reason"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="PRODUCTION">Production</option>
            <option value="SALE">Sale</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Note</span>
          <input
            name="note"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Record
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Current Stock</th>
              <th className="px-4 py-3 text-right">Alert Below</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const qty = stock.get(p.id) ?? 0;
              const low = qty <= p.lowStockThreshold;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.partNumber}</p>
                  </td>
                  <td className="px-4 py-3">{p.category.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{qty}</td>
                  <td className="px-4 py-3 text-right">{p.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        low ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {low ? "Low stock" : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Recent Movements</h2>
        {recentMovements.length === 0 ? (
          <p className="text-sm text-slate-500">No stock movements yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Change</th>
                <th className="py-2">Reason</th>
                <th className="py-2">Reference / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMovements.map((m) => (
                <tr key={m.id}>
                  <td className="py-2">{formatDate(m.createdAt)}</td>
                  <td className="py-2">{m.product.name}</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      m.delta < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td className="py-2">{m.reason}</td>
                  <td className="py-2 text-slate-500">
                    {[m.reference, m.note].filter(Boolean).join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

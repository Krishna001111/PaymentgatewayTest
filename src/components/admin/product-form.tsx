import type { Category, Product } from "@prisma/client";

function specsToText(specs: string | null) {
  if (!specs) return "";
  try {
    return Object.entries(JSON.parse(specs) as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  } catch {
    return "";
  }
}

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  product?: Product;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-lg bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">Product Name *</span>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Part Number *</span>
          <input
            name="partNumber"
            required
            defaultValue={product?.partNumber}
            placeholder="e.g. AP-EN-1001"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Category *</span>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Price (₹)</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">HSN Code</span>
          <input
            name="hsnCode"
            defaultValue={product?.hsnCode ?? ""}
            placeholder="e.g. 8708"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Description *</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Specifications</span>
        <textarea
          name="specs"
          rows={4}
          defaultValue={specsToText(product?.specs ?? null)}
          placeholder={"One per line, e.g.\nMaterial: Alloy steel\nBore: 75mm"}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
        />
        <span className="text-xs text-slate-500">One spec per line as “Name: Value”.</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Product Image</span>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="mt-1 w-full text-sm"
          />
          {product?.imageUrl && (
            <span className="text-xs text-slate-500">
              Current: {product.imageUrl} (upload to replace)
            </span>
          )}
        </label>
        <label className="block">
          <span className="text-sm font-medium">Low Stock Alert Below</span>
          <input
            name="lowStockThreshold"
            type="number"
            min="0"
            defaultValue={product?.lowStockThreshold ?? 10}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            name="isPublished"
            type="checkbox"
            defaultChecked={product?.isPublished ?? true}
          />
          Show on website
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} />
          Feature on home page
        </label>
      </div>

      <button
        type="submit"
        className="rounded bg-amber-500 px-6 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
      >
        {product ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

type ProductOption = {
  id: string;
  name: string;
  partNumber: string;
  price: number | null;
};

type Row = { key: number; productId: string; quantity: number; unitPrice: number };

export function OrderItemsEditor({ products }: { products: ProductOption[] }) {
  const [rows, setRows] = useState<Row[]>([
    { key: 0, productId: products[0]?.id ?? "", quantity: 1, unitPrice: products[0]?.price ?? 0 },
  ]);

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      {
        key: Math.max(0, ...rs.map((r) => r.key)) + 1,
        productId: products[0]?.id ?? "",
        quantity: 1,
        unitPrice: products[0]?.price ?? 0,
      },
    ]);
  }

  function removeRow(key: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));
  }

  const total = rows.reduce((s, r) => s + r.quantity * r.unitPrice, 0);

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[1fr_90px_120px_100px_40px] gap-2 text-xs font-semibold text-slate-500 sm:grid">
        <span>Product</span>
        <span>Qty</span>
        <span>Unit Price (₹)</span>
        <span>Amount</span>
        <span />
      </div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-1 gap-2 rounded border border-slate-200 p-2 sm:grid-cols-[1fr_90px_120px_100px_40px] sm:items-center sm:border-0 sm:p-0"
        >
          <select
            name="itemProductId"
            value={row.productId}
            onChange={(e) => {
              const product = products.find((p) => p.id === e.target.value);
              update(row.key, {
                productId: e.target.value,
                unitPrice: product?.price ?? row.unitPrice,
              });
            }}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.partNumber})
              </option>
            ))}
          </select>
          <input
            name="itemQuantity"
            type="number"
            min="1"
            value={row.quantity}
            onChange={(e) => update(row.key, { quantity: parseInt(e.target.value, 10) || 0 })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            name="itemUnitPrice"
            type="number"
            min="0"
            step="0.01"
            value={row.unitPrice}
            onChange={(e) => update(row.key, { unitPrice: parseFloat(e.target.value) || 0 })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span className="text-sm font-medium">
            ₹{(row.quantity * row.unitPrice).toLocaleString("en-IN")}
          </span>
          <button
            type="button"
            onClick={() => removeRow(row.key)}
            className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
            aria-label="Remove item"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-amber-500"
        >
          + Add Item
        </button>
        <p className="font-bold">Total: ₹{total.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

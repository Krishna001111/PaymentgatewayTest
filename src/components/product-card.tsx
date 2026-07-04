import Link from "next/link";
import type { Category, Product } from "@prisma/client";
import { formatINR } from "@/lib/format";

export function ProductCard({ product }: { product: Product & { category: Category } }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:shadow-md"
    >
      <div className="aspect-[4/3] bg-slate-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {product.category.name}
        </p>
        <h3 className="mt-1 font-bold group-hover:text-amber-600">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">Part No: {product.partNumber}</p>
        {product.price != null && (
          <p className="mt-2 text-sm font-semibold">{formatINR(product.price)}</p>
        )}
      </div>
    </Link>
  );
}

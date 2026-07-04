import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <section className="bg-slate-800 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-black sm:text-4xl">Our Products</h1>
          <p className="mt-2 text-slate-300">
            Browse our range of manufactured auto components.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              !category
                ? "border-amber-500 bg-amber-500 text-slate-900"
                : "border-slate-300 hover:border-amber-500"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                category === c.slug
                  ? "border-amber-500 bg-amber-500 text-slate-900"
                  : "border-slate-300 hover:border-amber-500"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-slate-500">
            No products found in this category yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateProduct } from "@/lib/actions/catalog";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        product={product}
      />
    </div>
  );
}

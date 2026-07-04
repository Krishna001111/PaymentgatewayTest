import { db } from "@/lib/db";
import { createProduct } from "@/lib/actions/catalog";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}

"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { requireAdmin } from "./guard";

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, fileName), bytes);
  return `/uploads/${fileName}`;
}

function parseSpecs(raw: string): string | null {
  // One "Key: Value" pair per line → JSON object.
  const entries = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return [line, ""] as const;
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] as const;
    })
    .filter(([k]) => k);
  if (entries.length === 0) return null;
  return JSON.stringify(Object.fromEntries(entries));
}

function productDataFromForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  return {
    name,
    partNumber: String(formData.get("partNumber") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    specs: parseSpecs(String(formData.get("specs") ?? "")),
    price: priceRaw ? parseFloat(priceRaw) : null,
    hsnCode: String(formData.get("hsnCode") ?? "").trim() || null,
    categoryId: String(formData.get("categoryId") ?? ""),
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    lowStockThreshold: parseInt(String(formData.get("lowStockThreshold") ?? "10"), 10) || 10,
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = productDataFromForm(formData);
  const imageUrl = await saveImage(formData.get("image") as File | null);

  let slug = slugify(data.name);
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  await db.product.create({ data: { ...data, slug, imageUrl } });
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const data = productDataFromForm(formData);
  const imageUrl = await saveImage(formData.get("image") as File | null);

  await db.product.update({
    where: { id },
    data: { ...data, ...(imageUrl ? { imageUrl } : {}) },
  });
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const usage = await db.orderItem.count({ where: { productId: id } });
  if (usage > 0) {
    // Products on orders must stay for records — unpublish instead.
    await db.product.update({ where: { id }, data: { isPublished: false } });
  } else {
    await db.stockMovement.deleteMany({ where: { productId: id } });
    await db.enquiry.updateMany({ where: { productId: id }, data: { productId: null } });
    await db.product.delete({ where: { id } });
  }
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.category.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) throw new Error("Cannot delete a category that still has products");
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "./guard";
import catalogue from "../../../prisma/catalogue.json";

// Placeholder data created by the original seed.
const OLD_PRODUCT_SLUGS = [
  "piston-ring-set", "cylinder-head-gasket", "brake-pad-set-front", "brake-disc-rotor",
  "shock-absorber-rear", "control-arm-bush-kit", "clutch-plate-assembly", "alternator-12v-90a",
];
const OLD_CATEGORY_SLUGS = [
  "engine-parts", "brake-systems", "suspension", "transmission", "electrical",
];

export type ImportState = { ok: boolean; message: string };

async function removeProductsByIds(ids: string[]) {
  if (ids.length === 0) return;
  await db.stockMovement.deleteMany({ where: { productId: { in: ids } } });
  await db.enquiry.updateMany({ where: { productId: { in: ids } }, data: { productId: null } });
  await db.orderItem.deleteMany({ where: { productId: { in: ids } } });
  await db.product.deleteMany({ where: { id: { in: ids } } });
}

export async function importCatalogue(
  _prev: ImportState | null,
  formData: FormData
): Promise<ImportState> {
  await requireAdmin();
  const resetAll = formData.get("resetAll") === "on";

  try {
    if (resetAll) {
      // Remove everything, but preserve products already tied to an order (records).
      const all = await db.product.findMany({
        select: { id: true, _count: { select: { orderItems: true } } },
      });
      const orderless = all.filter((p) => p._count.orderItems === 0).map((p) => p.id);
      const ordered = all.filter((p) => p._count.orderItems > 0).map((p) => p.id);
      await removeProductsByIds(orderless);
      if (ordered.length > 0) {
        await db.product.updateMany({ where: { id: { in: ordered } }, data: { isPublished: false } });
      }
      const emptyCats = await db.category.findMany({
        where: { products: { none: {} } },
        select: { id: true },
      });
      await db.category.deleteMany({ where: { id: { in: emptyCats.map((c) => c.id) } } });
    } else {
      // Remove only the known placeholder samples.
      const olds = await db.product.findMany({
        where: { slug: { in: OLD_PRODUCT_SLUGS } },
        select: { id: true },
      });
      await removeProductsByIds(olds.map((p) => p.id));
      await db.category.deleteMany({ where: { slug: { in: OLD_CATEGORY_SLUGS } } });
    }

    // Insert the real catalogue (idempotent — upsert by slug).
    const catId = new Map<string, string>();
    for (const c of catalogue.categories) {
      const cat = await db.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { name: c.name, slug: c.slug },
      });
      catId.set(c.id, cat.id);
    }
    for (const p of catalogue.products) {
      const product = await db.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          name: p.name,
          slug: p.slug,
          partNumber: p.partNumber,
          description: p.description,
          specs: JSON.stringify(p.specs),
          price: p.price,
          hsnCode: p.hsnCode,
          imageUrl: p.imageUrl,
          isFeatured: p.isFeatured,
          categoryId: catId.get(p.categoryId)!,
        },
      });
      const existing = await db.stockMovement.count({ where: { productId: product.id } });
      if (existing === 0) {
        await db.stockMovement.create({
          data: { productId: product.id, delta: 50, reason: "ADJUSTMENT", note: "Opening stock" },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");

    return {
      ok: true,
      message: `Done. Imported ${catalogue.products.length} products across ${catalogue.categories.length} categories${
        resetAll ? " (existing products cleared first)." : ", and removed the sample products."
      }`,
    };
  } catch (e) {
    return { ok: false, message: `Import failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import type { StockReason } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "./guard";

export async function addStockMovement(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const direction = String(formData.get("direction") ?? "in");
  const quantity = Math.abs(parseInt(String(formData.get("quantity") ?? "0"), 10));
  const reason = String(formData.get("reason") ?? "ADJUSTMENT") as StockReason;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!productId || quantity === 0) return;

  await db.stockMovement.create({
    data: {
      productId,
      delta: direction === "out" ? -quantity : quantity,
      reason,
      note,
    },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
}

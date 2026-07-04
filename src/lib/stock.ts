import { db } from "@/lib/db";

/** Current stock per product = sum of all stock movement deltas. */
export async function getStockLevels(productIds?: string[]) {
  const grouped = await db.stockMovement.groupBy({
    by: ["productId"],
    _sum: { delta: true },
    ...(productIds ? { where: { productId: { in: productIds } } } : {}),
  });
  const map = new Map<string, number>();
  for (const g of grouped) map.set(g.productId, g._sum.delta ?? 0);
  return map;
}

export async function getStock(productId: string) {
  const agg = await db.stockMovement.aggregate({
    where: { productId },
    _sum: { delta: true },
  });
  return agg._sum.delta ?? 0;
}

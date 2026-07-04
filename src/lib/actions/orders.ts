"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { nextOrderNumber } from "@/lib/numbering";
import { requireAdmin } from "./guard";

export async function createOrder(formData: FormData) {
  await requireAdmin();
  const customerId = String(formData.get("customerId") ?? "");
  const enquiryId = String(formData.get("enquiryId") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const productIds = formData.getAll("itemProductId").map(String);
  const quantities = formData.getAll("itemQuantity").map((q) => parseInt(String(q), 10));
  const prices = formData.getAll("itemUnitPrice").map((p) => parseFloat(String(p)));

  const items = productIds
    .map((productId, i) => ({
      productId,
      quantity: quantities[i] || 0,
      unitPrice: prices[i] || 0,
    }))
    .filter((it) => it.productId && it.quantity > 0);

  if (!customerId || items.length === 0) {
    redirect("/admin/orders/new?error=missing");
  }

  const order = await db.order.create({
    data: {
      orderNumber: await nextOrderNumber(),
      customerId,
      enquiryId,
      notes,
      items: { create: items },
    },
  });

  if (enquiryId) {
    await db.enquiry.update({ where: { id: enquiryId }, data: { status: "QUOTED" } });
  }

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${order.id}`);
}

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "") as OrderStatus;

  const order = await db.order.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  await db.order.update({ where: { id }, data: { status } });

  // Dispatching physically removes parts from stock — record it once.
  if (status === "DISPATCHED") {
    const alreadyDeducted = await db.stockMovement.count({
      where: { reason: "SALE", reference: order.orderNumber },
    });
    if (alreadyDeducted === 0) {
      await db.stockMovement.createMany({
        data: order.items.map((it) => ({
          productId: it.productId,
          delta: -it.quantity,
          reason: "SALE" as const,
          reference: order.orderNumber,
        })),
      });
    }
  }

  if (status === "CONFIRMED" && order.enquiryId) {
    await db.enquiry.update({ where: { id: order.enquiryId }, data: { status: "WON" } });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/inventory");
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  const invoices = await db.invoice.count({ where: { orderId: id } });
  if (invoices > 0) throw new Error("Cannot delete an order that has invoices");
  await db.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

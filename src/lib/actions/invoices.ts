"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { nextInvoiceNumber } from "@/lib/numbering";
import { requireAdmin } from "./guard";

export async function createInvoice(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const gstRate = parseFloat(String(formData.get("gstRate") ?? "18")) || 18;
  const isInterState = formData.get("isInterState") === "on";

  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  const subtotal = order.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const tax = (subtotal * gstRate) / 100;
  // Same state → CGST + SGST split; different state → IGST.
  const cgst = isInterState ? 0 : tax / 2;
  const sgst = isInterState ? 0 : tax / 2;
  const igst = isInterState ? tax : 0;

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber: await nextInvoiceNumber(),
      orderId: order.id,
      customerId: order.customerId,
      subtotal,
      cgst,
      sgst,
      igst,
      gstRate,
      isInterState,
      total: subtotal + tax,
    },
  });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function recordPayment(invoiceId: string, formData: FormData) {
  await requireAdmin();
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  const method = String(formData.get("method") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim() || null;
  if (!amount || amount <= 0 || !method) return;

  await db.payment.create({ data: { invoiceId, amount, method, reference } });

  const invoice = await db.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: true },
  });
  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const paymentStatus = paid >= invoice.total ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
  await db.invoice.update({ where: { id: invoiceId }, data: { paymentStatus } });

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin");
}

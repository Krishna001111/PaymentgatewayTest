"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "./guard";

function customerDataFromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim() || null,
    gstin: String(formData.get("gstin") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    state: String(formData.get("state") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createCustomer(formData: FormData) {
  await requireAdmin();
  const data = customerDataFromForm(formData);
  if (!data.name || !data.company || !data.phone) return;
  await db.customer.create({ data });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  await requireAdmin();
  await db.customer.update({ where: { id }, data: customerDataFromForm(formData) });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string) {
  await requireAdmin();
  const orders = await db.order.count({ where: { customerId: id } });
  if (orders > 0) throw new Error("Cannot delete a customer with orders");
  await db.customer.delete({ where: { id } });
  revalidatePath("/admin/customers");
}

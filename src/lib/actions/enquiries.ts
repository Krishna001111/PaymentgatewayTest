"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "./guard";

export async function updateEnquiry(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "NEW") as EnquiryStatus;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  await db.enquiry.update({ where: { id }, data: { status, notes } });
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  await db.enquiry.delete({ where: { id } });
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries");
}

"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function submitEnquiry(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const companyName = String(formData.get("company") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const productSlug = String(formData.get("productSlug") ?? "").trim();

  if (!name || !phone || !message) {
    redirect("/contact?error=missing");
  }

  let productId: string | null = null;
  if (productSlug) {
    const product = await db.product.findUnique({ where: { slug: productSlug } });
    productId = product?.id ?? null;
  }

  await db.enquiry.create({
    data: { name, phone, message, company: companyName, email, productId },
  });

  redirect("/contact?sent=1");
}

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { company, whatsappLink } from "@/lib/company";
import { submitEnquiry } from "@/lib/actions/public";

export const metadata: Metadata = { title: "Contact & Enquiry" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; sent?: string; error?: string }>;
}) {
  const { product: productSlug, sent, error } = await searchParams;
  const product = productSlug
    ? await db.product.findUnique({ where: { slug: productSlug } })
    : null;

  return (
    <>
      <section className="bg-slate-800 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-black sm:text-4xl">Contact Us</h1>
          <p className="mt-2 text-slate-300">
            Send an enquiry and our team will get back to you quickly.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold">Send an Enquiry</h2>

          {sent && (
            <div className="mt-4 rounded border border-green-300 bg-green-50 p-4 text-green-800">
              Thank you! Your enquiry has been received. We will contact you soon.
            </div>
          )}
          {error && (
            <div className="mt-4 rounded border border-red-300 bg-red-50 p-4 text-red-800">
              Please fill in your name, phone number and message.
            </div>
          )}

          <form action={submitEnquiry} className="mt-4 space-y-4">
            {product && (
              <>
                <input type="hidden" name="productSlug" value={product.slug} />
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
                  Enquiring about: <strong>{product.name}</strong> (Part No:{" "}
                  {product.partNumber})
                </div>
              </>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Your Name *</span>
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Company</span>
                <input
                  name="company"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Phone *</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium">Message *</span>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Which parts do you need? Quantity? Vehicle model?"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-400"
            >
              Submit Enquiry
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold">Reach Us Directly</h2>
          <div className="mt-4 space-y-4 rounded-lg bg-slate-50 p-6 text-sm">
            <div>
              <p className="font-semibold">Address</p>
              <p className="text-slate-600">
                {company.address}, {company.city}, {company.state} — {company.pincode}
              </p>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <a href={`tel:${company.phone}`} className="text-slate-600 hover:underline">
                {company.phone}
              </a>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <a href={`mailto:${company.email}`} className="text-slate-600 hover:underline">
                {company.email}
              </a>
            </div>
            <div>
              <p className="font-semibold">Business Hours</p>
              <p className="text-slate-600">Monday – Saturday, 9:00 AM to 7:00 PM</p>
            </div>
            <a
              href={whatsappLink(`Hello ${company.name}, I have an enquiry.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-500"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

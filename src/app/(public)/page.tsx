import Link from "next/link";
import { db } from "@/lib/db";
import { company, whatsappLink } from "@/lib/company";
import { ProductCard } from "@/components/product-card";

// Featured products come from the database — render per request, not at build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { isPublished: true, isFeatured: true },
    include: { category: true },
    take: 6,
  });

  return (
    <>
      <section className="bg-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-3 font-semibold uppercase tracking-widest text-amber-400">
            Since {company.established}
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            {company.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">{company.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-400"
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="rounded border border-slate-500 px-6 py-3 font-semibold hover:bg-slate-700"
            >
              Send Enquiry
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Manufacturing Quality",
              text: "Every part is produced to OEM tolerances with strict in-house quality checks.",
            },
            {
              title: "Dealer & OEM Supply",
              text: "Reliable bulk supply for dealers, distributors and vehicle manufacturers.",
            },
            {
              title: "Fast Response",
              text: "Send an enquiry and get a quotation quickly — by phone, email or WhatsApp.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-slate-200 p-6">
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/products" className="text-sm font-semibold text-amber-600 hover:underline">
                View all products →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="text-2xl font-bold">Need a part or a bulk quotation?</h2>
        <p className="mt-2 text-slate-600">
          Call us at {company.phone} or message us on WhatsApp — we respond fast.
        </p>
        <a
          href={whatsappLink(`Hello ${company.name}, I need a quotation.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500"
        >
          Chat on WhatsApp
        </a>
      </section>
    </>
  );
}

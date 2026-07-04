import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { company, whatsappLink } from "@/lib/company";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.isPublished) notFound();

  const specs: Record<string, string> = product.specs ? JSON.parse(product.specs) : {};

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/products" className="hover:underline">
          Products
        </Link>{" "}
        /{" "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>{" "}
        / <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-slate-400">
              No image
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            {product.category.name}
          </p>
          <h1 className="mt-1 text-3xl font-black">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Part No: {product.partNumber}</p>
          {product.price != null && (
            <p className="mt-4 text-2xl font-bold">{formatINR(product.price)}</p>
          )}
          <p className="mt-4 text-slate-600">{product.description}</p>

          {Object.keys(specs).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-bold">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(specs).map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-500">{k}</td>
                      <td className="py-2">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/contact?product=${product.slug}`}
              className="rounded bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-400"
            >
              Send Enquiry
            </Link>
            <a
              href={whatsappLink(
                `Hello ${company.name}, I am interested in ${product.name} (Part No: ${product.partNumber}). Please share details.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

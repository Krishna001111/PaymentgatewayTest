import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <section className="bg-slate-800 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-black sm:text-4xl">About {company.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            A trusted manufacturer of automotive components since {company.established}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Our Story</h2>
            {/* TODO: replace with the company's real story */}
            <p className="mt-3 text-slate-600">
              {company.name} was established in {company.established} with a simple goal —
              manufacture dependable auto parts that workshops, dealers and vehicle
              manufacturers can trust. From a small workshop, we have grown into a
              full-fledged manufacturing unit serving customers across the country.
            </p>
            <p className="mt-3 text-slate-600">
              Today we produce a wide range of components covering engine, brake,
              suspension, transmission and electrical systems, with a focus on
              consistent quality and on-time delivery.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Manufacturing Capabilities</h2>
            <ul className="mt-3 space-y-2 text-slate-600">
              {[
                "In-house tooling, machining and assembly lines",
                "Batch-wise quality inspection on every production run",
                "Materials sourced from certified suppliers",
                "Capacity for OEM-scale and aftermarket orders",
                "Custom manufacturing against samples or drawings",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-bold text-amber-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-8">
          <h2 className="text-2xl font-bold">Quality Process</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-4">
            {[
              { step: "1", title: "Raw Material Check", text: "Incoming materials are inspected before entering production." },
              { step: "2", title: "In-Process Control", text: "Dimensional checks at every machining stage." },
              { step: "3", title: "Final Inspection", text: "Each batch is verified against specifications." },
              { step: "4", title: "Packing & Dispatch", text: "Protective packing with clear part identification." },
            ].map((s) => (
              <div key={s.step}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 font-black text-slate-900">
                  {s.step}
                </div>
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold">Want to work with us?</h2>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-400"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}

"use client";

import { useActionState } from "react";
import { importCatalogue, type ImportState } from "@/lib/actions/import";

export function ImportForm() {
  const [state, formAction, pending] = useActionState<ImportState | null, FormData>(
    importCatalogue,
    null
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5 rounded-lg bg-white p-6 shadow-sm">
      <label className="flex items-start gap-3 rounded border border-slate-200 p-3">
        <input name="resetAll" type="checkbox" className="mt-1" />
        <span className="text-sm">
          <span className="font-medium">Remove ALL existing products first (full reset)</span>
          <br />
          <span className="text-slate-500">
            Deletes every product and empty category before importing. Products already used on an
            order are kept but hidden from the website. Leave unchecked to remove only the sample
            products.
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-500 px-6 py-2.5 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
      >
        {pending ? "Importing…" : "Import catalogue now"}
      </button>

      {state && (
        <div
          className={`rounded border p-3 text-sm ${
            state.ok
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
          {state.ok && (
            <>
              {" "}
              <a href="/products" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                View the catalogue →
              </a>
            </>
          )}
        </div>
      )}
    </form>
  );
}

"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700"
    >
      Print / Save as PDF
    </button>
  );
}

const colors: Record<string, string> = {
  // Enquiry
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  QUOTED: "bg-purple-100 text-purple-800",
  WON: "bg-green-100 text-green-800",
  CLOSED: "bg-slate-200 text-slate-600",
  // Order
  QUOTATION: "bg-purple-100 text-purple-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PRODUCTION: "bg-amber-100 text-amber-800",
  DISPATCHED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  // Payment
  UNPAID: "bg-red-100 text-red-800",
  PARTIAL: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        colors[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

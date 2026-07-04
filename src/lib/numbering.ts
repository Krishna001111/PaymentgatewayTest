import { db } from "@/lib/db";

// Sequential document numbers like ORD-2026-0007 / INV-2026-0007.
// Counts existing rows for the current year and takes the next slot;
// fine for a single-office business, revisit if entry becomes concurrent.

function yearRange() {
  const year = new Date().getFullYear();
  return {
    year,
    start: new Date(year, 0, 1),
    end: new Date(year + 1, 0, 1),
  };
}

export async function nextOrderNumber() {
  const { year, start, end } = yearRange();
  const count = await db.order.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  return `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function nextInvoiceNumber() {
  const { year, start, end } = yearRange();
  const count = await db.invoice.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

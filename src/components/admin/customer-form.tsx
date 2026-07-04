import type { Customer } from "@prisma/client";

export function CustomerForm({
  action,
  customer,
}: {
  action: (formData: FormData) => Promise<void>;
  customer?: Customer;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Contact Person *</span>
          <input
            name="name"
            required
            defaultValue={customer?.name}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Company *</span>
          <input
            name="company"
            required
            defaultValue={customer?.company}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Phone *</span>
          <input
            name="phone"
            required
            defaultValue={customer?.phone}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">GSTIN</span>
          <input
            name="gstin"
            defaultValue={customer?.gstin ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">City</span>
          <input
            name="city"
            defaultValue={customer?.city ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">State</span>
          <input
            name="state"
            defaultValue={customer?.state ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">Address</span>
          <input
            name="address"
            defaultValue={customer?.address ?? ""}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={customer?.notes ?? ""}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="rounded bg-amber-500 px-6 py-2.5 font-semibold text-slate-900 hover:bg-amber-400"
      >
        {customer ? "Save Changes" : "Add Customer"}
      </button>
    </form>
  );
}

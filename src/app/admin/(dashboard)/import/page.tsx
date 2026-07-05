import { ImportForm } from "@/components/admin/import-form";

export default function ImportCataloguePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Import Catalogue</h1>

      <div className="space-y-3 text-sm text-slate-600">
        <p>
          This loads the ready-made catalogue of <strong>44 TATA truck parts</strong> (engine &amp;
          motor mounts, cabin mounts, load cushion mounts, torque rod bushes, bushes and lift-axle
          parts) — with part numbers, applications, OEM references, pack sizes, prices and photos.
        </p>
        <p>
          By default it also removes the original <strong>8 sample products</strong> (Piston Ring
          Set, etc.). Your enquiries and any real data are kept. You can run it again safely — it
          will not create duplicates.
        </p>
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800">
          Note: the product photos still carry a faint watermark and dimension lines from the source
          catalogue. Send the original catalogue PDF later and these can be replaced with clean
          images. You can also edit any price or detail from the Products page after importing.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}

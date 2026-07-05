// Generates scripts/import-catalogue.sql from prisma/catalogue.json.
// The SQL replaces the placeholder sample catalogue with the real TATA
// truck-parts catalogue on the live (Neon) database. Idempotent.
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const root = new URL("..", import.meta.url);
const catalogue = JSON.parse(
  readFileSync(fileURLToPath(new URL("prisma/catalogue.json", root)), "utf8")
);

// Placeholder data created by the original seed — removed by this import.
const OLD_PRODUCT_SLUGS = [
  "piston-ring-set", "cylinder-head-gasket", "brake-pad-set-front", "brake-disc-rotor",
  "shock-absorber-rear", "control-arm-bush-kit", "clutch-plate-assembly", "alternator-12v-90a",
];
const OLD_CATEGORY_SLUGS = [
  "engine-parts", "brake-systems", "suspension", "transmission", "electrical",
];

const q = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const inList = (arr) => arr.map(q).join(",");

const L = [];
L.push("-- AP Auto Parts — import TATA truck-parts catalogue (44 products, 6 categories).");
L.push("-- Replaces the placeholder samples. Safe to run more than once.");
L.push("BEGIN;");
L.push("");
L.push("-- 1) Remove the old placeholder sample catalogue");
L.push(`DELETE FROM "StockMovement" WHERE "productId" IN (SELECT id FROM "Product" WHERE slug IN (${inList(OLD_PRODUCT_SLUGS)}));`);
L.push(`UPDATE "Enquiry" SET "productId"=NULL WHERE "productId" IN (SELECT id FROM "Product" WHERE slug IN (${inList(OLD_PRODUCT_SLUGS)}));`);
L.push(`DELETE FROM "OrderItem" WHERE "productId" IN (SELECT id FROM "Product" WHERE slug IN (${inList(OLD_PRODUCT_SLUGS)}));`);
L.push(`DELETE FROM "Product" WHERE slug IN (${inList(OLD_PRODUCT_SLUGS)});`);
L.push(`DELETE FROM "Category" WHERE slug IN (${inList(OLD_CATEGORY_SLUGS)});`);
L.push("");
L.push("-- 2) Categories");
for (const c of catalogue.categories) {
  L.push(`INSERT INTO "Category" ("id","name","slug") VALUES (${q(c.id)},${q(c.name)},${q(c.slug)}) ON CONFLICT ("slug") DO NOTHING;`);
}
L.push("");
L.push("-- 3) Products");
for (const p of catalogue.products) {
  const specs = JSON.stringify(p.specs);
  L.push(
    `INSERT INTO "Product" ("id","name","slug","partNumber","description","specs","price","hsnCode","imageUrl","isPublished","isFeatured","categoryId","updatedAt") VALUES (` +
      `${q("prod_" + p.num)},${q(p.name)},${q(p.slug)},${q(p.partNumber)},${q(p.description)},${q(specs)},${p.price},${q(p.hsnCode)},${q(p.imageUrl)},true,${p.isFeatured},${q(p.categoryId)},CURRENT_TIMESTAMP` +
      `) ON CONFLICT ("slug") DO NOTHING;`
  );
}
L.push("");
L.push("-- 4) Opening stock (50 each), only if the product has no movements yet");
for (const p of catalogue.products) {
  L.push(
    `INSERT INTO "StockMovement" ("id","productId","delta","reason","note") SELECT ${q("sm_" + p.num)},${q("prod_" + p.num)},50,'ADJUSTMENT','Opening stock' WHERE NOT EXISTS (SELECT 1 FROM "StockMovement" WHERE "productId"=${q("prod_" + p.num)});`
  );
}
L.push("");
L.push("COMMIT;");

const out = fileURLToPath(new URL("scripts/import-catalogue.sql", root));
writeFileSync(out, L.join("\n") + "\n");
console.log(`Wrote ${out} (${catalogue.products.length} products, ${catalogue.categories.length} categories)`);

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const db = new PrismaClient();

type Cat = { id: string; name: string; slug: string };
type Prod = {
  num: string;
  name: string;
  slug: string;
  partNumber: string;
  categoryId: string;
  price: number;
  hsnCode: string;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
  isFeatured: boolean;
};

const catalogue = JSON.parse(
  readFileSync(fileURLToPath(new URL("./catalogue.json", import.meta.url)), "utf8")
) as { categories: Cat[]; products: Prod[] };

async function main() {
  // Admin login — override via ADMIN_EMAIL / ADMIN_PASSWORD.
  // Re-running the seed updates the password (doubles as a password reset).
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@apautoparts.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { name: "Admin", email: adminEmail, passwordHash, role: "OWNER" },
  });

  const catId = new Map<string, string>();
  for (const c of catalogue.categories) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
    catId.set(c.id, cat.id);
  }

  for (const p of catalogue.products) {
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        partNumber: p.partNumber,
        description: p.description,
        specs: JSON.stringify(p.specs),
        price: p.price,
        hsnCode: p.hsnCode,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
        categoryId: catId.get(p.categoryId)!,
      },
    });
    // Opening stock so the inventory screens have data.
    const existing = await db.stockMovement.count({ where: { productId: product.id } });
    if (existing === 0) {
      await db.stockMovement.create({
        data: { productId: product.id, delta: 50, reason: "ADJUSTMENT", note: "Opening stock" },
      });
    }
  }

  console.log(
    `Seed complete: ${catalogue.categories.length} categories, ${catalogue.products.length} products. ` +
      `Admin: ${adminEmail} / ${process.env.ADMIN_PASSWORD ? "(your ADMIN_PASSWORD)" : "admin123"}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

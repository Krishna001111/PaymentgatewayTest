import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const categories = [
  { name: "Engine Parts", slug: "engine-parts" },
  { name: "Brake Systems", slug: "brake-systems" },
  { name: "Suspension", slug: "suspension" },
  { name: "Transmission", slug: "transmission" },
  { name: "Electrical", slug: "electrical" },
];

// Sample catalog — replace with AP Auto Parts' real products from the admin panel.
const products = [
  {
    name: "Piston Ring Set",
    slug: "piston-ring-set",
    partNumber: "AP-EN-1001",
    description:
      "High-durability piston ring set manufactured to OEM tolerances. Suitable for commercial and passenger vehicles.",
    specs: JSON.stringify({ Material: "Alloy steel", Bore: "75mm", "Rings per set": "3" }),
    price: 850,
    hsnCode: "8409",
    category: "engine-parts",
    isFeatured: true,
    imageUrl: "/products/engine.svg",
  },
  {
    name: "Cylinder Head Gasket",
    slug: "cylinder-head-gasket",
    partNumber: "AP-EN-1002",
    description: "Multi-layer steel head gasket with superior sealing under high compression.",
    specs: JSON.stringify({ Material: "MLS steel", Thickness: "1.2mm" }),
    price: 620,
    hsnCode: "8409",
    category: "engine-parts",
    imageUrl: "/products/engine.svg",
  },
  {
    name: "Brake Pad Set (Front)",
    slug: "brake-pad-set-front",
    partNumber: "AP-BR-2001",
    description:
      "Semi-metallic front brake pads with low dust and consistent stopping power in all weather.",
    specs: JSON.stringify({ Type: "Semi-metallic", Position: "Front axle", "Wear indicator": "Yes" }),
    price: 1150,
    hsnCode: "8708",
    category: "brake-systems",
    isFeatured: true,
    imageUrl: "/products/brake.svg",
  },
  {
    name: "Brake Disc Rotor",
    slug: "brake-disc-rotor",
    partNumber: "AP-BR-2002",
    description: "Precision-machined ventilated disc rotor for improved heat dissipation.",
    specs: JSON.stringify({ Diameter: "262mm", Type: "Ventilated", Finish: "Anti-rust coated" }),
    price: 1890,
    hsnCode: "8708",
    category: "brake-systems",
    imageUrl: "/products/brake.svg",
  },
  {
    name: "Shock Absorber (Rear)",
    slug: "shock-absorber-rear",
    partNumber: "AP-SU-3001",
    description: "Gas-charged rear shock absorber tuned for Indian road conditions.",
    specs: JSON.stringify({ Type: "Twin-tube gas", Position: "Rear", Warranty: "12 months" }),
    price: 2450,
    hsnCode: "8708",
    category: "suspension",
    isFeatured: true,
    imageUrl: "/products/suspension.svg",
  },
  {
    name: "Control Arm Bush Kit",
    slug: "control-arm-bush-kit",
    partNumber: "AP-SU-3002",
    description: "Natural-rubber control arm bushes for quiet, long-lasting suspension performance.",
    specs: JSON.stringify({ Material: "NR rubber", "Kit contents": "4 bushes" }),
    price: 480,
    hsnCode: "8708",
    category: "suspension",
    imageUrl: "/products/suspension.svg",
  },
  {
    name: "Clutch Plate Assembly",
    slug: "clutch-plate-assembly",
    partNumber: "AP-TR-4001",
    description: "Organic-facing clutch plate assembly with smooth engagement and long service life.",
    specs: JSON.stringify({ Diameter: "200mm", Splines: "18", Facing: "Organic" }),
    price: 1650,
    hsnCode: "8708",
    category: "transmission",
    imageUrl: "/products/transmission.svg",
  },
  {
    name: "Alternator 12V 90A",
    slug: "alternator-12v-90a",
    partNumber: "AP-EL-5001",
    description: "12V 90A alternator with built-in regulator, direct-fit replacement.",
    specs: JSON.stringify({ Voltage: "12V", Output: "90A", Pulley: "6PK" }),
    price: 5250,
    hsnCode: "8511",
    category: "electrical",
    imageUrl: "/products/electrical.svg",
  },
];

async function main() {
  // Override via env: ADMIN_EMAIL / ADMIN_PASSWORD.
  // Re-running the seed updates the password — use it as a password reset.
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@apautoparts.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "OWNER",
    },
  });

  // Sample catalog only on a fresh database — re-seeding (e.g. for a
  // password reset) must not resurrect products the owner has removed.
  const productCount = await db.product.count();
  if (productCount > 0) {
    console.log(`Admin user "${adminEmail}" is ready (password updated). Catalog left untouched.`);
    return;
  }

  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryIds.set(c.slug, cat.id);
  }

  for (const p of products) {
    const { category, ...data } = p;
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, categoryId: categoryIds.get(category)! },
    });
    // Opening stock so the inventory screens have data.
    const existing = await db.stockMovement.count({ where: { productId: product.id } });
    if (existing === 0) {
      await db.stockMovement.create({
        data: {
          productId: product.id,
          delta: 50,
          reason: "ADJUSTMENT",
          note: "Opening stock",
        },
      });
    }
  }

  console.log(`Seed complete. Admin login: ${adminEmail} / ${process.env.ADMIN_PASSWORD ? "(your ADMIN_PASSWORD)" : "admin123"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

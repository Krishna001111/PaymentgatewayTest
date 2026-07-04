import { chromium } from "playwright";

const BASE = "http://localhost:3000";
import { mkdirSync } from "fs";
const shots = "e2e-screenshots";
mkdirSync(shots, { recursive: true });
let step = 0;
const ok = (msg) => console.log(`✓ ${++step}. ${msg}`);

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(20000);

try {
  // 1. Public: submit enquiry from contact page (linked to a product)
  await page.goto(`${BASE}/products/piston-ring-set`);
  await page.click("text=Send Enquiry");
  await page.waitForURL("**/contact?product=piston-ring-set");
  await page.fill('input[name="name"]', "Ravi Kumar");
  await page.fill('input[name="company"]', "Kumar Motors");
  await page.fill('input[name="phone"]', "9812345678");
  await page.fill('input[name="email"]', "ravi@kumarmotors.in");
  await page.fill('textarea[name="message"]', "Need 200 piston ring sets for Tata Ace. Please quote.");
  await page.click('button:has-text("Submit Enquiry")');
  await page.waitForSelector("text=Your enquiry has been received");
  ok("Public enquiry submitted");
  await page.screenshot({ path: `${shots}/01-public-home.png` });

  // 2. Admin login
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[name="email"]', "admin@apautoparts.com");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign In")');
  await page.waitForURL("**/admin");
  await page.waitForSelector("text=Dashboard");
  ok("Admin login works");
  await page.screenshot({ path: `${shots}/02-dashboard.png` });

  // 3. Enquiry visible in inbox
  await page.goto(`${BASE}/admin/enquiries`);
  await page.waitForSelector("text=Ravi Kumar");
  await page.click("text=Ravi Kumar");
  await page.waitForSelector("text=Need 200 piston ring sets");
  ok("Enquiry appears in admin inbox with message");

  // 4. Create customer
  await page.goto(`${BASE}/admin/customers/new`);
  await page.fill('input[name="name"]', "Ravi Kumar");
  await page.fill('input[name="company"]', "Kumar Motors");
  await page.fill('input[name="phone"]', "9812345678");
  await page.fill('input[name="gstin"]', "07ABCDE1234F1Z5");
  await page.fill('input[name="city"]', "Delhi");
  await page.fill('input[name="state"]', "Delhi");
  await page.click('button:has-text("Add Customer")');
  await page.waitForURL("**/admin/customers");
  await page.waitForSelector("text=Kumar Motors");
  ok("Customer created");

  // 5. Create quotation from enquiry
  await page.goto(`${BASE}/admin/enquiries`);
  await page.click("text=Ravi Kumar");
  await page.click("text=Create Quotation");
  await page.waitForSelector("text=New Quotation");
  await page.selectOption('select[name="itemProductId"]', { label: "Piston Ring Set (AP-EN-1001)" });
  await page.fill('input[name="itemQuantity"]', "200");
  await page.fill('textarea[name="notes"]', "Delivery within 3 weeks. Quotation valid 30 days.");
  await page.click('button:has-text("Create Quotation")');
  await page.waitForSelector('button:has-text("Mark CONFIRMED")');
  ok("Quotation created from enquiry");
  const orderUrl = page.url();

  // 6. Print view renders
  await page.click("text=View / Print Quotation");
  await page.waitForSelector("text=Authorised Signatory");
  await page.screenshot({ path: `${shots}/03-quotation.png` });
  ok("Printable quotation renders");

  // 7. Confirm → In production → Dispatch (stock should drop by 200)
  await page.goto(orderUrl);
  await page.click('button:has-text("Mark CONFIRMED")');
  await page.waitForSelector('button:has-text("Mark IN PRODUCTION")');
  await page.click('button:has-text("Mark IN PRODUCTION")');
  await page.waitForSelector('button:has-text("Mark DISPATCHED")');
  await page.click('button:has-text("Mark DISPATCHED")');
  await page.waitForSelector('button:has-text("Mark DELIVERED")');
  ok("Order moved QUOTATION → CONFIRMED → IN_PRODUCTION → DISPATCHED");

  // 8. Inventory shows negative movement and low stock (50 - 200 = -150)
  await page.goto(`${BASE}/admin/inventory`);
  await page.waitForSelector('td:text-is("-200")');
  await page.waitForSelector("text=Low stock");
  ok("Stock auto-deducted on dispatch, low-stock alert shows");
  await page.screenshot({ path: `${shots}/04-inventory.png` });

  // 9. Generate invoice
  await page.goto(orderUrl);
  await page.click("text=Generate Invoice");
  await page.waitForSelector("text=GST Rate");
  await page.click('button:has-text("Generate Invoice")');
  await page.waitForURL("**/admin/invoices/**");
  await page.waitForSelector("text=Tax Invoice");
  await page.waitForSelector("text=CGST (9%)");
  ok("GST invoice generated with CGST/SGST breakup");
  await page.screenshot({ path: `${shots}/05-invoice.png` });

  // 10. Record part payment → PARTIAL, then rest → PAID
  const total = 200 * 850 * 1.18; // 200 × ₹850 + 18% GST = 200600
  await page.fill('input[name="amount"]', "100000");
  await page.selectOption('select[name="method"]', "UPI");
  await page.fill('input[name="reference"]', "UTR123456");
  await page.click('button:has-text("Record Payment")');
  await page.waitForSelector('span:text-is("PARTIAL")');
  await page.fill('input[name="amount"]', String(total - 100000));
  await page.click('button:has-text("Record Payment")');
  await page.waitForSelector('span:text-is("PAID")');
  ok("Payments recorded: PARTIAL → PAID");

  // 11. Reports reflect the data
  await page.goto(`${BASE}/admin/reports`);
  await page.waitForSelector("text=Piston Ring Set");
  await page.waitForSelector("text=No pending payments");
  ok("Reports show top product and cleared receivables");
  await page.screenshot({ path: `${shots}/06-reports.png` });

  console.log("\nALL E2E CHECKS PASSED");
} catch (err) {
  await page.screenshot({ path: `${shots}/failure.png` });
  console.error(`\nFAILED at step ${step + 1}:`, err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

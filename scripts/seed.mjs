import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash("password123", 10);

  const email = "demo@example.com";
  let user = await sql`
    select id, email from invoiceager_user where email = ${email} limit 1
  `;
  let userId;
  if (user.length === 0) {
    const inserted = await sql`
      insert into invoiceager_user (id, name, email, "passwordHash", "businessName", gstin, "bankInfo")
      values (${crypto.randomUUID()}, ${"Demo User"}, ${email}, ${passwordHash}, ${"Demo Studio"}, ${"GSTIN1234"}, ${"UPI: demo@upi"})
      returning id
    `;
    userId = inserted[0].id;
  } else {
    userId = user[0].id;
  }

  // Clients
  const acme = await sql`
    insert into invoiceager_client (id, "userId", name, email, gstin, notes)
    values (${crypto.randomUUID()}, ${userId}, ${"Acme Corp"}, ${"billing@acme.com"}, ${"ACMEGSTIN"}, ${"VIP"})
    on conflict do nothing
    returning id
  `;
  const globex = await sql`
    insert into invoiceager_client (id, "userId", name, email)
    values (${crypto.randomUUID()}, ${userId}, ${"Globex"}, ${"ap@globex.com"})
    on conflict do nothing
    returning id
  `;
  // ensure ids exist
  const acmeId = acme[0]?.id ?? (await sql`select id from invoiceager_client where "userId"=${userId} and name=${"Acme Corp"} limit 1`)[0].id;
  const globexId = globex[0]?.id ?? (await sql`select id from invoiceager_client where "userId"=${userId} and name=${"Globex"} limit 1`)[0].id;

  const now = new Date();
  await sql`
    insert into invoiceager_invoice (id, "userId", "clientId", services, amount, "taxPercent", "issuedAt", "dueDate", status)
    values (${crypto.randomUUID()}, ${userId}, ${acmeId}, ${"Design work"}, ${"5000.00"}, ${"18.00"}, ${now}, ${new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)}, ${"sent"})
    on conflict do nothing
  `;
  await sql`
    insert into invoiceager_invoice (id, "userId", "clientId", services, amount, "taxPercent", "issuedAt", "dueDate", status)
    values (${crypto.randomUUID()}, ${userId}, ${globexId}, ${"Development sprint"}, ${"15000.00"}, ${"18.00"}, ${new Date(now.getFullYear(), now.getMonth(), 1)}, ${new Date(now.getFullYear(), now.getMonth(), 15)}, ${"paid"})
    on conflict do nothing
  `;

  console.log("Seed complete for:", email);
}

main().finally(() => sql.end({ timeout: 1 }));

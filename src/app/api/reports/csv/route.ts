import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.query.invoices.findMany({
    where: (t, { eq }) => eq(t.userId, session.user.id),
    with: { client: true },
  });
  const csv = [
    ["Client", "Amount", "Status", "Issued", "Due"].join(","),
    ...rows.map((r) => [
      r.client?.name ?? "",
      Number(r.amount).toFixed(2),
      r.status,
      r.issuedAt?.toISOString?.() ?? "",
      r.dueDate ? new Date(r.dueDate).toISOString() : "",
    ].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")),
  ].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=report.csv",
    },
  });
}



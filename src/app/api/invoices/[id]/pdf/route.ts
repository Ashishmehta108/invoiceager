import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { invoices, clients } from "@/server/db/schema";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const invoice = await db.query.invoices.findFirst({
    where: (t, { eq }) => eq(t.id, id),
    with: { client: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk as Buffer));
  const done: Promise<Buffer> = new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(20).text("Invoice", { align: "right" });
  doc.moveDown();
  doc.fontSize(12).text(`Client: ${invoice.client?.name ?? "Client"}`);
  doc.text(`Email: ${invoice.client?.email ?? ""}`);
  doc.text(`GSTIN: ${invoice.client?.gstin ?? ""}`);
  doc.moveDown();
  doc.text(`Issued: ${invoice.issuedAt?.toLocaleDateString?.() ?? ""}`);
  doc.text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ""}`);
  doc.text(`Status: ${invoice.status}`);
  doc.moveDown();
  doc.text(`Services:`);
  doc.text(invoice.services ?? "");
  doc.moveDown();
  const tax = (Number(invoice.amount) * Number(invoice.taxPercent ?? 0)) / 100;
  const total = Number(invoice.amount) + tax;
  doc.text(`Amount: ₹${Number(invoice.amount).toFixed(2)}`);
  doc.text(`Tax %: ${Number(invoice.taxPercent ?? 0).toFixed(2)}%`);
  doc.text(`Total: ₹${total.toFixed(2)}`);

  doc.end();
  const pdf = await done;
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${id}.pdf`,
    },
  });
}



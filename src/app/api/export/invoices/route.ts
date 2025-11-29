import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCSV, invoiceColumns } from "@/lib/export/csv";

/**
 * GET /api/export/invoices
 * 
 * Exports all invoices for the authenticated user as CSV
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = invoices.map((invoice: { invoiceNumber: string; client: { name: string; email: string | null }; status: string; issueDate: Date; dueDate: Date; totalAmount: unknown; currency: string; sentAt: Date | null; paidAt: Date | null; paymentMethod: string | null }) => ({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email || "",
      status: invoice.status,
      issueDate: invoice.issueDate.toISOString().split("T")[0],
      dueDate: invoice.dueDate.toISOString().split("T")[0],
      totalAmount: String(invoice.totalAmount),
      currency: invoice.currency,
      sentAt: invoice.sentAt?.toISOString() || "",
      paidAt: invoice.paidAt?.toISOString() || "",
      paymentMethod: invoice.paymentMethod || "",
    }));

    const csv = generateCSV({ data, columns: invoiceColumns });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="invoices-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Invoice export error:", error);
    return NextResponse.json(
      { error: "Failed to export invoices" },
      { status: 500 }
    );
  }
}

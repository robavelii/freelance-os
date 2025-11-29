"use server";

import { prisma } from "@/lib/prisma";

/**
 * Get an invoice by its public token (no authentication required)
 * This is used for the public invoice view page
 */
export async function getInvoiceByToken(token: string) {
  if (!token) {
    return null;
  }

  const invoice = await prisma.invoice.findUnique({
    where: { publicToken: token },
    include: {
      client: true,
      items: true,
      user: {
        select: {
          businessName: true,
          businessAddress: true,
          logoUrl: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return invoice;
}

/**
 * Update invoice status to VIEWED on first access (if currently SENT)
 * Sets the viewedAt timestamp
 */
export async function markInvoiceAsViewed(token: string) {
  if (!token) {
    return { success: false, message: "Invalid token" };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { publicToken: token },
    select: { id: true, status: true, viewedAt: true },
  });

  if (!invoice) {
    return { success: false, message: "Invoice not found" };
  }

  // Only update if status is SENT and hasn't been viewed before
  if (invoice.status === "SENT" && !invoice.viewedAt) {
    await prisma.invoice.update({
      where: { publicToken: token },
      data: {
        status: "VIEWED",
        viewedAt: new Date(),
      },
    });
    return { success: true, message: "Invoice marked as viewed" };
  }

  return { success: true, message: "No update needed" };
}

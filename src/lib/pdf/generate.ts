import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InvoicePDF, formatCurrency } from "./invoice-pdf";
import type { Invoice, UserInfo } from "./invoice-pdf";

/**
 * Generates a PDF buffer for an invoice
 * 
 * Fetches invoice with relations, renders PDF to buffer for download/email,
 * and implements currency formatting based on invoice currency.
 * 
 * @param invoiceId - The ID of the invoice to generate PDF for
 * @param userId - The ID of the user (for authorization)
 * @returns PDF buffer and filename
 */
export async function generateInvoicePDF(
  invoiceId: string,
  userId: string
): Promise<{ buffer: Buffer; filename: string }> {
  // Fetch invoice with all relations
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, userId },
    include: {
      client: true,
      items: true,
      user: {
        select: {
          businessName: true,
          businessAddress: true,
          logoUrl: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Validate required fields exist before rendering 
  validateInvoiceData(invoice);

  // Transform to PDF component props
  const invoiceData: Invoice = {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    totalAmount: invoice.totalAmount,
    currency: invoice.currency,
    items: invoice.items.map((item: typeof invoice.items[number]) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
    })),
    client: {
      id: invoice.client.id,
      name: invoice.client.name,
      email: invoice.client.email,
      company: invoice.client.company,
      address: invoice.client.address,
    },
  };

  const userData: UserInfo = {
    businessName: invoice.user.businessName,
    businessAddress: invoice.user.businessAddress,
    logoUrl: invoice.user.logoUrl,
    email: invoice.user.email,
  };

  // Render PDF to buffer
  const buffer = await renderToBuffer(
    InvoicePDF({ invoice: invoiceData, user: userData })
  );

  // Generate filename with invoice number 
  const filename = `${invoice.invoiceNumber}.pdf`;

  return { buffer: Buffer.from(buffer), filename };
}

/**
 * Validates that all required invoice data exists before PDF generation
 * Throws an error if required fields are missing
 */
function validateInvoiceData(invoice: {
  invoiceNumber: string;
  client: { name: string };
  items: Array<{ description: string; quantity: unknown; price: unknown }>;
  totalAmount: unknown;
}): void {
  const errors: string[] = [];

  if (!invoice.invoiceNumber) {
    errors.push("Invoice number is required");
  }

  if (!invoice.client?.name) {
    errors.push("Client name is required");
  }

  if (!invoice.items || invoice.items.length === 0) {
    errors.push("At least one line item is required");
  }

  invoice.items?.forEach((item, index) => {
    if (!item.description) {
      errors.push(`Line item ${index + 1}: description is required`);
    }
    if (item.quantity === null || item.quantity === undefined) {
      errors.push(`Line item ${index + 1}: quantity is required`);
    }
    if (item.price === null || item.price === undefined) {
      errors.push(`Line item ${index + 1}: price is required`);
    }
  });

  if (invoice.totalAmount === null || invoice.totalAmount === undefined) {
    errors.push("Total amount is required");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid invoice data: ${errors.join(", ")}`);
  }
}

// Re-export formatCurrency for use in other modules
export { formatCurrency };

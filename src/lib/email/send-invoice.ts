import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf/generate";
import { InvoiceEmail } from "./templates/invoice-email";
import { format } from "date-fns";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export interface SendInvoiceEmailParams {
  invoiceId: string;
  userId: string;
  to: string;
  subject?: string;
  message?: string;
}

export interface SendInvoiceEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Sends an invoice via email with PDF attachment
 */
export async function sendInvoiceEmail(
  params: SendInvoiceEmailParams
): Promise<SendInvoiceEmailResult> {
  const { invoiceId, userId, to, subject, message } = params;

  try {
    // Fetch invoice with all relations
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId },
      include: {
        client: true,
        items: true,
        user: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (!invoice.client.email) {
      return { success: false, error: "Client does not have an email address" };
    }

    // Generate PDF attachment
    const { buffer, filename } = await generateInvoicePDF(invoiceId, userId);

    // Build URLs for the email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const viewUrl = `${baseUrl}/invoice/${invoice.publicToken}`;
    
    // Payment URL will be added when Stripe is configured
    const paymentUrl = invoice.status !== "PAID" 
      ? `${viewUrl}?pay=true` 
      : undefined;

    // Prepare email subject
    const emailSubject = subject || 
      `Invoice ${invoice.invoiceNumber} from ${invoice.user.businessName || "Your Service Provider"}`;

    // Prepare items for email template
    const emailItems = invoice.items.map((item: { description: string; quantity: unknown; price: unknown; amount: unknown }) => ({
      description: item.description,
      quantity: Number(item.quantity),
      price: Number(item.price),
      amount: Number(item.amount),
    }));

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "invoices@resend.dev",
      to: [to],
      subject: emailSubject,
      react: InvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        businessName: invoice.user.businessName || "Your Service Provider",
        totalAmount: Number(invoice.totalAmount).toFixed(2),
        currency: invoice.currency,
        dueDate: format(invoice.dueDate, "MMMM d, yyyy"),
        viewUrl,
        paymentUrl,
        customMessage: message,
        items: emailItems,
      }),
      attachments: [
        {
          filename,
          content: buffer.toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("Failed to send invoice email:", error);
      return { success: false, error: error.message };
    }

    // Update status to SENT and record timestamp
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}

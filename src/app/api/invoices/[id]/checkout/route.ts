import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getAbsoluteUrl } from "@/lib/utils";

/**
 * Stripe Checkout Session Endpoint
 * 
 * Creates a Stripe Checkout session for invoice payment.
 * This endpoint is accessed from the public invoice view page.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payment processing is not configured" },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Fetch the invoice with client details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Don't allow payment for already paid invoices
    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice has already been paid" },
        { status: 400 }
      );
    }

    // Don't allow payment for voided invoices
    if (invoice.status === "VOID") {
      return NextResponse.json(
        { error: "Invoice has been voided" },
        { status: 400 }
      );
    }



    // Convert totalAmount to cents (Stripe expects amounts in smallest currency unit)
    // totalAmount is stored as Decimal in Prisma
    const amountInCents = Math.round(Number(invoice.totalAmount) * 100);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: invoice.items
                .map((item: { description: string }) => item.description)
                .join(", ")
                .substring(0, 500), // Stripe has a limit on description length
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: invoice.client.email || undefined,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      // Success URL - redirect back to public invoice view with success indicator
      success_url: getAbsoluteUrl(`/invoice/${invoice.publicToken}?payment=success`),
      // Cancel URL - redirect back to public invoice view
      cancel_url: getAbsoluteUrl(`/invoice/${invoice.publicToken}?payment=cancelled`),
    });

    // Store the Stripe session ID on the invoice for reference
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeSessionId: session.id },
    });

    // Return the checkout URL for client-side redirect
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    // Handle Stripe-specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

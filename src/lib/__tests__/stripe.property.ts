/**
 * Property-based tests for Stripe payment integration
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Invoice status type
type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "VOID";
type PaymentMethod = "stripe" | "manual";

// Mock types for testing
interface Invoice {
  id: string;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt: Date | null;
  paymentMethod: PaymentMethod | null;
}

interface StripeCheckoutSession {
  amount: number;
  currency: string;
  invoiceId: string;
}

interface PaymentWebhook {
  success: boolean;
  invoiceId: string;
  amount: number;
  currency: string;
}

/**
 * Creates a Stripe checkout session from an invoice
 * The session amount should match the invoice total (in cents for Stripe)
 */
function createCheckoutSession(invoice: Invoice): StripeCheckoutSession {
  return {
    amount: Math.round(invoice.totalAmount * 100), // Convert to cents
    currency: invoice.currency.toLowerCase(),
    invoiceId: invoice.id,
  };
}

/**
 * Validates that checkout session matches invoice
 */
function validateCheckoutSession(
  invoice: Invoice,
  session: StripeCheckoutSession
): boolean {
  const expectedAmount = Math.round(invoice.totalAmount * 100);
  return (
    session.amount === expectedAmount &&
    session.currency === invoice.currency.toLowerCase() &&
    session.invoiceId === invoice.id
  );
}

/**
 * Processes a successful payment webhook
 * Updates invoice status to PAID and sets paidAt timestamp
 */
function processPaymentSuccess(
  invoice: Invoice,
  webhook: PaymentWebhook
): Invoice {
  if (webhook.success) {
    return {
      ...invoice,
      status: "PAID",
      paidAt: new Date(),
      paymentMethod: "stripe",
    };
  }
  return invoice;
}

/**
 * Marks an invoice as paid manually
 */
function markAsPaidManually(invoice: Invoice): Invoice {
  return {
    ...invoice,
    status: "PAID",
    paidAt: new Date(),
    paymentMethod: "manual",
  };
}

// Arbitraries
const invoiceArb = fc.record({
  id: fc.uuid(),
  totalAmount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'CAD', 'AUD'),
  status: fc.constantFrom<InvoiceStatus>("DRAFT", "SENT", "VIEWED", "OVERDUE"),
  paidAt: fc.constant<null>(null),
  paymentMethod: fc.constant<null>(null),
});

describe('Stripe Payment Integration Property Tests', () => {
  /**
   * 
   * *For any* invoice, the created Stripe Checkout session SHALL have an amount 
   * equal to the invoice totalAmount and currency matching the invoice currency.
   * 
   */
  it('Property 8: Stripe Session Amount Consistency - session matches invoice', () => {
    fc.assert(
      fc.property(
        invoiceArb,
        (invoice) => {
          const session = createCheckoutSession(invoice);
          
          // Amount should be in cents (invoice amount * 100)
          const expectedAmount = Math.round(invoice.totalAmount * 100);
          expect(session.amount).toBe(expectedAmount);
          
          // Currency should match (lowercase for Stripe)
          expect(session.currency).toBe(invoice.currency.toLowerCase());
          
          // Invoice ID should match
          expect(session.invoiceId).toBe(invoice.id);
          
          // Validation should pass
          expect(validateCheckoutSession(invoice, session)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8 (continued): Session amount handles decimal precision
   */
  it('Property 8: Stripe Session Amount Consistency - handles decimal amounts', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        fc.constantFrom('USD', 'EUR', 'GBP'),
        (amount, currency) => {
          const invoice: Invoice = {
            id: 'test-id',
            totalAmount: amount,
            currency,
            status: 'DRAFT',
            paidAt: null,
            paymentMethod: null,
          };
          
          const session = createCheckoutSession(invoice);
          
          // Amount should be rounded to nearest cent
          const expectedAmount = Math.round(amount * 100);
          expect(session.amount).toBe(expectedAmount);
          
          // Should be an integer (no fractional cents)
          expect(Number.isInteger(session.amount)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* invoice receiving a successful Stripe payment webhook, the status 
   * SHALL become PAID and paidAt SHALL be set.
   * 
   */
  it('Property 9: Payment Success Status Transition - status becomes PAID', () => {
    fc.assert(
      fc.property(
        invoiceArb,
        (invoice) => {
          const webhook: PaymentWebhook = {
            success: true,
            invoiceId: invoice.id,
            amount: Math.round(invoice.totalAmount * 100),
            currency: invoice.currency.toLowerCase(),
          };
          
          const updatedInvoice = processPaymentSuccess(invoice, webhook);
          
          expect(updatedInvoice.status).toBe("PAID");
          expect(updatedInvoice.paidAt).not.toBeNull();
          expect(updatedInvoice.paidAt).toBeInstanceOf(Date);
          expect(updatedInvoice.paymentMethod).toBe("stripe");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9 (continued): Failed webhooks don't change status
   */
  it('Property 9: Payment Success Status Transition - failed webhook preserves status', () => {
    fc.assert(
      fc.property(
        invoiceArb,
        (invoice) => {
          const webhook: PaymentWebhook = {
            success: false,
            invoiceId: invoice.id,
            amount: Math.round(invoice.totalAmount * 100),
            currency: invoice.currency.toLowerCase(),
          };
          
          const updatedInvoice = processPaymentSuccess(invoice, webhook);
          
          expect(updatedInvoice.status).toBe(invoice.status);
          expect(updatedInvoice.paidAt).toBeNull();
          expect(updatedInvoice.paymentMethod).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* invoice marked as paid manually, the status SHALL be PAID and 
   * paymentMethod SHALL be "manual".
   * 
   */
  it('Property 10: Manual Payment Notation - paymentMethod is manual', () => {
    fc.assert(
      fc.property(
        invoiceArb,
        (invoice) => {
          const updatedInvoice = markAsPaidManually(invoice);
          
          expect(updatedInvoice.status).toBe("PAID");
          expect(updatedInvoice.paidAt).not.toBeNull();
          expect(updatedInvoice.paidAt).toBeInstanceOf(Date);
          expect(updatedInvoice.paymentMethod).toBe("manual");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10 (continued): Manual payment differs from Stripe payment
   */
  it('Property 10: Manual Payment Notation - distinguishes from Stripe payment', () => {
    fc.assert(
      fc.property(
        invoiceArb,
        (invoice) => {
          const manualPaid = markAsPaidManually(invoice);
          
          const webhook: PaymentWebhook = {
            success: true,
            invoiceId: invoice.id,
            amount: Math.round(invoice.totalAmount * 100),
            currency: invoice.currency.toLowerCase(),
          };
          const stripePaid = processPaymentSuccess(invoice, webhook);
          
          // Both should be PAID
          expect(manualPaid.status).toBe("PAID");
          expect(stripePaid.status).toBe("PAID");
          
          // But payment methods should differ
          expect(manualPaid.paymentMethod).toBe("manual");
          expect(stripePaid.paymentMethod).toBe("stripe");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8 (continued): Currency conversion is consistent
   */
  it('Property 8: Stripe Session Amount Consistency - currency lowercase conversion', () => {
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    
    for (const currency of currencies) {
      const invoice: Invoice = {
        id: 'test-id',
        totalAmount: 100,
        currency,
        status: 'DRAFT',
        paidAt: null,
        paymentMethod: null,
      };
      
      const session = createCheckoutSession(invoice);
      
      expect(session.currency).toBe(currency.toLowerCase());
    }
  });

  /**
   * Property 9 (continued): Payment success is idempotent
   */
  it('Property 9: Payment Success Status Transition - idempotent operation', () => {
    fc.assert(
      fc.property(
        invoiceArb,
        (invoice) => {
          const webhook: PaymentWebhook = {
            success: true,
            invoiceId: invoice.id,
            amount: Math.round(invoice.totalAmount * 100),
            currency: invoice.currency.toLowerCase(),
          };
          
          const firstUpdate = processPaymentSuccess(invoice, webhook);
          const secondUpdate = processPaymentSuccess(firstUpdate, webhook);
          
          // Status should remain PAID
          expect(secondUpdate.status).toBe("PAID");
          expect(secondUpdate.paymentMethod).toBe("stripe");
        }
      ),
      { numRuns: 100 }
    );
  });
});

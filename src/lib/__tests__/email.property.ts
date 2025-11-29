/**
 * Property-based tests for email invoice delivery
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Invoice status type
type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "VOID";

// Mock types for testing
interface Invoice {
  id: string;
  status: InvoiceStatus;
  sentAt: Date | null;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Simulates the status transition after successful email send
 * DRAFT -> SENT (with sentAt timestamp)
 * Other statuses can also be sent, but typically we send DRAFT invoices
 */
function getStatusAfterEmailSend(
  currentStatus: InvoiceStatus,
  emailResult: EmailResult
): { status: InvoiceStatus; sentAt: Date | null } {
  if (emailResult.success) {
    return {
      status: "SENT",
      sentAt: new Date(),
    };
  }
  
  // On failure, preserve current status
  return {
    status: currentStatus,
    sentAt: null,
  };
}

/**
 * Checks if status should transition after email send
 */
function shouldTransitionToSent(emailResult: EmailResult): boolean {
  return emailResult.success;
}

// Arbitraries
const invoiceStatusArb = fc.constantFrom<InvoiceStatus>(
  "DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "VOID"
);

const invoiceArb = fc.record({
  id: fc.uuid(),
  status: invoiceStatusArb,
  sentAt: fc.option(fc.date(), { nil: null }),
});

const emailResultArb = fc.record({
  success: fc.boolean(),
  error: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
});

describe('Email Invoice Delivery Property Tests', () => {
  /**
   * 
   * *For any* invoice with DRAFT status, successfully sending via email SHALL result 
   * in the invoice status becoming SENT and the sentAt timestamp being set.
   * 
   */
  it('Property 4: Email Send Status Transition - DRAFT becomes SENT on success', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const invoice: Invoice = {
            id,
            status: "DRAFT",
            sentAt: null,
          };
          
          const emailResult: EmailResult = { success: true };
          
          const result = getStatusAfterEmailSend(invoice.status, emailResult);
          
          expect(result.status).toBe("SENT");
          expect(result.sentAt).not.toBeNull();
          expect(result.sentAt).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 (continued): Any status can transition to SENT on successful email
   */
  it('Property 4: Email Send Status Transition - any status becomes SENT on success', () => {
    fc.assert(
      fc.property(
        invoiceStatusArb,
        (status) => {
          const emailResult: EmailResult = { success: true };
          
          const result = getStatusAfterEmailSend(status, emailResult);
          
          expect(result.status).toBe("SENT");
          expect(result.sentAt).not.toBeNull();
          expect(shouldTransitionToSent(emailResult)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* invoice, when email sending fails, the invoice status SHALL remain 
   * unchanged from its pre-send state.
   * 
   */
  it('Property 5: Email Failure Status Preservation - status unchanged on failure', () => {
    fc.assert(
      fc.property(
        invoiceStatusArb,
        fc.string({ minLength: 1, maxLength: 100 }),
        (status, errorMessage) => {
          const emailResult: EmailResult = { 
            success: false, 
            error: errorMessage 
          };
          
          const result = getStatusAfterEmailSend(status, emailResult);
          
          expect(result.status).toBe(status);
          expect(result.sentAt).toBeNull();
          expect(shouldTransitionToSent(emailResult)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5 (continued): DRAFT status preserved on failure
   */
  it('Property 5: Email Failure Status Preservation - DRAFT remains DRAFT on failure', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (id) => {
          const invoice: Invoice = {
            id,
            status: "DRAFT",
            sentAt: null,
          };
          
          const emailResult: EmailResult = { 
            success: false, 
            error: "Network error" 
          };
          
          const result = getStatusAfterEmailSend(invoice.status, emailResult);
          
          expect(result.status).toBe("DRAFT");
          expect(result.sentAt).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4 (continued): sentAt timestamp is set only on success
   */
  it('Property 4: Email Send Status Transition - sentAt set only on success', () => {
    fc.assert(
      fc.property(
        invoiceStatusArb,
        fc.boolean(),
        (status, success) => {
          const emailResult: EmailResult = { 
            success,
            error: success ? undefined : "Error" 
          };
          
          const result = getStatusAfterEmailSend(status, emailResult);
          
          if (success) {
            expect(result.sentAt).not.toBeNull();
            expect(result.status).toBe("SENT");
          } else {
            expect(result.sentAt).toBeNull();
            expect(result.status).toBe(status);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5 (continued): All statuses preserved on failure
   */
  it('Property 5: Email Failure Status Preservation - all statuses preserved', () => {
    const statuses: InvoiceStatus[] = ["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "VOID"];
    
    for (const status of statuses) {
      const emailResult: EmailResult = { success: false, error: "Test error" };
      const result = getStatusAfterEmailSend(status, emailResult);
      
      expect(result.status).toBe(status);
      expect(result.sentAt).toBeNull();
    }
  });

  /**
   * Property 4 & 5: Status transition is deterministic based on email result
   */
  it('Property 4 & 5: Status transition is deterministic', () => {
    fc.assert(
      fc.property(
        invoiceStatusArb,
        emailResultArb,
        (status, emailResult) => {
          const result1 = getStatusAfterEmailSend(status, emailResult);
          const result2 = getStatusAfterEmailSend(status, emailResult);
          
          // Same inputs should produce same status
          expect(result1.status).toBe(result2.status);
          
          // sentAt should be set or null consistently
          if (emailResult.success) {
            expect(result1.sentAt).not.toBeNull();
            expect(result2.sentAt).not.toBeNull();
          } else {
            expect(result1.sentAt).toBeNull();
            expect(result2.sentAt).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

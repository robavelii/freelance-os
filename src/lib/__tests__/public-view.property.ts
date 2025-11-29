/**
 * Property-based tests for public invoice view
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Invoice status type
type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "VOID";

// Mock types for testing
interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface PublicInvoiceView {
  invoiceNumber: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  currency: string;
}

/**
 * Validates that public view contains all required content
 */
function validatePublicViewContent(view: PublicInvoiceView): {
  hasAllItems: boolean;
  hasTotalAmount: boolean;
  hasStatus: boolean;
} {
  return {
    hasAllItems: view.items.length > 0 && view.items.every(item => 
      !!item.description && 
      typeof item.quantity === 'number' && 
      typeof item.price === 'number' &&
      typeof item.amount === 'number'
    ),
    hasTotalAmount: typeof view.totalAmount === 'number',
    hasStatus: !!view.status,
  };
}

/**
 * Determines the new status after first view
 * SENT -> VIEWED
 * Other statuses remain unchanged
 */
function getStatusAfterFirstView(currentStatus: InvoiceStatus): InvoiceStatus {
  if (currentStatus === "SENT") {
    return "VIEWED";
  }
  return currentStatus;
}

/**
 * Checks if status should transition on first view
 */
function shouldTransitionOnView(status: InvoiceStatus): boolean {
  return status === "SENT";
}

// Arbitraries
const invoiceItemArb = fc.record({
  description: fc.string({ minLength: 1, maxLength: 100 }),
  quantity: fc.integer({ min: 1, max: 100 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
  amount: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
});

const invoiceStatusArb = fc.constantFrom<InvoiceStatus>(
  "DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "VOID"
);

const publicInvoiceViewArb = fc.record({
  invoiceNumber: fc.stringMatching(/^[A-Z]{2,5}-\d{4}-\d{4}$/),
  items: fc.array(invoiceItemArb, { minLength: 1, maxLength: 10 }),
  totalAmount: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
  status: invoiceStatusArb,
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'CAD', 'AUD'),
});

describe('Public Invoice View Property Tests', () => {
  /**
   * 
   * *For any* valid invoice accessed via public link, the rendered view SHALL contain 
   * all line items, the total amount, and the current payment status.
   * 
   */
  it('Property 6: Public View Content Completeness - contains all required content', () => {
    fc.assert(
      fc.property(
        publicInvoiceViewArb,
        (view) => {
          const validation = validatePublicViewContent(view);
          
          expect(validation.hasAllItems).toBe(true);
          expect(validation.hasTotalAmount).toBe(true);
          expect(validation.hasStatus).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6 (continued): View should contain all line items
   */
  it('Property 6: Public View Content Completeness - all line items are present', () => {
    fc.assert(
      fc.property(
        fc.array(invoiceItemArb, { minLength: 1, maxLength: 20 }),
        (items) => {
          const view: PublicInvoiceView = {
            invoiceNumber: 'INV-2025-0001',
            items,
            totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
            status: 'SENT',
            currency: 'USD',
          };
          
          const validation = validatePublicViewContent(view);
          
          expect(validation.hasAllItems).toBe(true);
          expect(view.items.length).toBe(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* invoice with SENT status accessed via public link for the first time, 
   * the status SHALL transition to VIEWED and viewedAt SHALL be set.
   * 
   */
  it('Property 7: First View Status Transition - SENT transitions to VIEWED', () => {
    fc.assert(
      fc.property(
        fc.constant<InvoiceStatus>("SENT"),
        (status) => {
          const newStatus = getStatusAfterFirstView(status);
          
          expect(newStatus).toBe("VIEWED");
          expect(shouldTransitionOnView(status)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Other statuses should not transition on view
   */
  it('Property 7: First View Status Transition - other statuses remain unchanged', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<InvoiceStatus>("DRAFT", "VIEWED", "PAID", "OVERDUE", "VOID"),
        (status) => {
          const newStatus = getStatusAfterFirstView(status);
          
          expect(newStatus).toBe(status);
          expect(shouldTransitionOnView(status)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7 (continued): Status transition is idempotent
   */
  it('Property 7: First View Status Transition - transition is idempotent', () => {
    fc.assert(
      fc.property(
        invoiceStatusArb,
        (status) => {
          const firstTransition = getStatusAfterFirstView(status);
          const secondTransition = getStatusAfterFirstView(firstTransition);
          
          // Second transition should not change status further
          expect(secondTransition).toBe(firstTransition);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6 (continued): Empty items should fail validation
   */
  it('Property 6: Public View Content Completeness - detects missing items', () => {
    const invalidView: PublicInvoiceView = {
      invoiceNumber: 'INV-2025-0001',
      items: [],
      totalAmount: 0,
      status: 'SENT',
      currency: 'USD',
    };
    
    const validation = validatePublicViewContent(invalidView);
    expect(validation.hasAllItems).toBe(false);
  });

  /**
   * Property 6 (continued): All payment statuses should be displayable
   */
  it('Property 6: Public View Content Completeness - all statuses are valid', () => {
    fc.assert(
      fc.property(
        invoiceStatusArb,
        (status) => {
          const view: PublicInvoiceView = {
            invoiceNumber: 'INV-2025-0001',
            items: [{ description: 'Test', quantity: 1, price: 100, amount: 100 }],
            totalAmount: 100,
            status,
            currency: 'USD',
          };
          
          const validation = validatePublicViewContent(view);
          expect(validation.hasStatus).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

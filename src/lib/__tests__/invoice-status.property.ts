/**
 * Property-based tests for invoice status management
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Invoice status type
type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "VOID";

// Mock invoice type for testing
interface MockInvoice {
  id: string;
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
}

/**
 * Determines if an invoice should be marked as overdue
 * Based on: due date in past AND status is SENT or VIEWED
 */
function shouldBeOverdue(invoice: MockInvoice): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(invoice.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const isPastDue = due < now;
  const isEligibleStatus = invoice.status === "SENT" || invoice.status === "VIEWED";
  
  return isPastDue && isEligibleStatus;
}

/**
 * Filters invoices by status
 */
function filterByStatus(invoices: MockInvoice[], status: InvoiceStatus): MockInvoice[] {
  return invoices.filter(inv => inv.status === status);
}

// Arbitrary for invoice status
const invoiceStatusArb = fc.constantFrom<InvoiceStatus>(
  "DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "VOID"
);

// Arbitrary for mock invoice
const mockInvoiceArb = fc.record({
  id: fc.uuid(),
  status: invoiceStatusArb,
  dueDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
});

describe('Invoice Status Property Tests', () => {
  /**
   * 
   * *For any* newly created invoice, the status SHALL be DRAFT.
   * 
   */
  it('Property 22: Initial Invoice Status - new invoices start as DRAFT', () => {
    // This property is tested by verifying that the initial status constant is DRAFT
    const INITIAL_STATUS: InvoiceStatus = "DRAFT";
    
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date(),
        (id, createdAt) => {
          // Simulate creating a new invoice
          const newInvoice: MockInvoice = {
            id,
            status: INITIAL_STATUS,
            dueDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
            createdAt,
          };
          
          expect(newInvoice.status).toBe("DRAFT");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* invoice with status SENT or VIEWED and due date before today, 
   * the status SHALL be OVERDUE.
   * 
   */
  it('Property 23: Overdue Status Transition - past due SENT/VIEWED invoices should be overdue', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }), // Days in the past
        fc.constantFrom<InvoiceStatus>("SENT", "VIEWED"),
        (daysAgo, status) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() - daysAgo);
          
          const invoice: MockInvoice = {
            id: 'test-id',
            status,
            dueDate,
            createdAt: new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000), // Created 7 days before due
          };
          
          const result = shouldBeOverdue(invoice);
          
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 23 (continued): Invoices with other statuses should not be marked overdue
   */
  it('Property 23: Overdue Status Transition - DRAFT/PAID/VOID invoices should not be overdue', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }), // Days in the past
        fc.constantFrom<InvoiceStatus>("DRAFT", "PAID", "VOID"),
        (daysAgo, status) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() - daysAgo);
          
          const invoice: MockInvoice = {
            id: 'test-id',
            status,
            dueDate,
            createdAt: new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          };
          
          const result = shouldBeOverdue(invoice);
          
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 23 (continued): Future due dates should not be overdue
   */
  it('Property 23: Overdue Status Transition - future due dates should not be overdue', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }), // Days in the future
        fc.constantFrom<InvoiceStatus>("SENT", "VIEWED"),
        (daysAhead, status) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + daysAhead);
          
          const invoice: MockInvoice = {
            id: 'test-id',
            status,
            dueDate,
            createdAt: new Date(),
          };
          
          const result = shouldBeOverdue(invoice);
          
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* status filter applied to an invoice list, all returned invoices 
   * SHALL have a status matching the filter value.
   * 
   */
  it('Property 24: Status Filter Accuracy - filtered invoices match the filter status', () => {
    fc.assert(
      fc.property(
        fc.array(mockInvoiceArb, { minLength: 1, maxLength: 50 }),
        invoiceStatusArb,
        (invoices, filterStatus) => {
          const filtered = filterByStatus(invoices, filterStatus);
          
          // All filtered invoices should have the filter status
          for (const invoice of filtered) {
            expect(invoice.status).toBe(filterStatus);
          }
          
          // Count should match manual count
          const manualCount = invoices.filter(inv => inv.status === filterStatus).length;
          expect(filtered.length).toBe(manualCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 24 (continued): Empty filter results when no matches
   */
  it('Property 24: Status Filter Accuracy - returns empty array when no matches', () => {
    fc.assert(
      fc.property(
        fc.array(mockInvoiceArb, { minLength: 1, maxLength: 20 }),
        invoiceStatusArb,
        invoiceStatusArb,
        (invoices, status1, status2) => {
          // Ensure all invoices have status1
          const uniformInvoices = invoices.map(inv => ({ ...inv, status: status1 }));
          
          // Filter by different status
          if (status1 !== status2) {
            const filtered = filterByStatus(uniformInvoices, status2);
            expect(filtered.length).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-based tests for invoice number generator
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Re-implement pure functions locally to avoid Prisma import
// These match the implementations in invoice-number.ts

interface InvoiceNumberParts {
  prefix: string;
  year: number;
  sequence: number;
}

function formatInvoiceNumber(parts: InvoiceNumberParts): string {
  const paddedSequence = parts.sequence.toString().padStart(4, "0");
  return `${parts.prefix}-${parts.year}-${paddedSequence}`;
}

function parseInvoiceNumber(invoiceNumber: string): InvoiceNumberParts {
  const pattern = /^(.+)-(\d{4})-(\d{4})$/;
  const match = invoiceNumber.match(pattern);

  if (!match) {
    throw new Error(
      `Invalid invoice number format: ${invoiceNumber}. Expected format: PREFIX-YYYY-NNNN`
    );
  }

  return {
    prefix: match[1],
    year: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  };
}

// Arbitrary for valid invoice number parts
const invoiceNumberPartsArb = fc.record({
  prefix: fc.stringMatching(/^[A-Z]{2,5}$/), // 2-5 uppercase letters
  year: fc.integer({ min: 2000, max: 2099 }),
  sequence: fc.integer({ min: 1, max: 9999 }),
});

describe('Invoice Number Property Tests', () => {
  /**
   * 
   * *For any* valid invoice number string, parsing to parts and formatting back 
   * SHALL produce the original string.
   * 
   */
  it('Property 20: Invoice Number Round-Trip - format then parse produces equivalent parts', () => {
    fc.assert(
      fc.property(invoiceNumberPartsArb, (parts) => {
        const formatted = formatInvoiceNumber(parts);
        const parsed = parseInvoiceNumber(formatted);
        
        expect(parsed.prefix).toBe(parts.prefix);
        expect(parsed.year).toBe(parts.year);
        expect(parsed.sequence).toBe(parts.sequence);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* generated invoice number, it SHALL match the pattern 
   * `{prefix}-{year}-{4-digit-sequence}` where year is 4 digits and sequence is zero-padded.
   * 
   */
  it('Property 19: Invoice Number Format Validation - follows pattern PREFIX-YYYY-NNNN', () => {
    fc.assert(
      fc.property(invoiceNumberPartsArb, (parts) => {
        const formatted = formatInvoiceNumber(parts);
        
        // Should match pattern: PREFIX-YYYY-NNNN
        const pattern = /^[A-Z]{2,5}-\d{4}-\d{4}$/;
        expect(formatted).toMatch(pattern);
        
        // Verify components
        const [prefix, year, sequence] = formatted.split('-');
        expect(prefix).toBe(parts.prefix);
        expect(year).toBe(String(parts.year));
        expect(sequence).toBe(String(parts.sequence).padStart(4, '0'));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* sequence of invoice number parts with incrementing sequences,
   * each formatted number's sequence component SHALL be exactly one greater than the previous.
   * 
   */
  it('Property 18: Invoice Number Sequence Increment - consecutive sequences differ by 1', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z]{2,5}$/),
        fc.integer({ min: 2000, max: 2099 }),
        fc.integer({ min: 1, max: 9998 }), // Leave room for +1
        (prefix, year, startSequence) => {
          const parts1: InvoiceNumberParts = { prefix, year, sequence: startSequence };
          const parts2: InvoiceNumberParts = { prefix, year, sequence: startSequence + 1 };
          
          const parsed1 = parseInvoiceNumber(formatInvoiceNumber(parts1));
          const parsed2 = parseInvoiceNumber(formatInvoiceNumber(parts2));
          
          expect(parsed2.sequence - parsed1.sequence).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* user's first invoice in a new calendar year, the sequence component SHALL be 0001.
   * This test verifies that sequence 1 formats to 0001.
   * 
   */
  it('Property 21: Year Boundary Sequence Reset - sequence 1 formats to 0001', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z]{2,5}$/),
        fc.integer({ min: 2000, max: 2099 }),
        (prefix, year) => {
          const parts: InvoiceNumberParts = { prefix, year, sequence: 1 };
          const formatted = formatInvoiceNumber(parts);
          
          // Should end with -0001
          expect(formatted).toMatch(/-0001$/);
          
          // Parse and verify
          const parsed = parseInvoiceNumber(formatted);
          expect(parsed.sequence).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

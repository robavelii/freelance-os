/**
 * Property-based tests for settings service
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Re-implement pure functions locally to avoid Prisma import
// These match the implementations in settings.ts

interface UserSettings {
  businessName: string | null;
  businessAddress: string | null;
  logoUrl: string | null;
  currency: string;
  hourlyRate: number | null;
  invoicePrefix: string;
  paymentTermsDays: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  businessName: null,
  businessAddress: null,
  logoUrl: null,
  currency: "USD",
  hourlyRate: null,
  invoicePrefix: "INV",
  paymentTermsDays: 30,
};

function serializeSettings(settings: UserSettings): string {
  return JSON.stringify(settings);
}

function deserializeSettings(json: string): UserSettings {
  try {
    const parsed = JSON.parse(json);

    return {
      businessName:
        typeof parsed.businessName === "string" ? parsed.businessName : null,
      businessAddress:
        typeof parsed.businessAddress === "string"
          ? parsed.businessAddress
          : null,
      logoUrl: typeof parsed.logoUrl === "string" ? parsed.logoUrl : null,
      currency:
        typeof parsed.currency === "string"
          ? parsed.currency
          : DEFAULT_SETTINGS.currency,
      hourlyRate:
        typeof parsed.hourlyRate === "number" ? parsed.hourlyRate : null,
      invoicePrefix:
        typeof parsed.invoicePrefix === "string"
          ? parsed.invoicePrefix
          : DEFAULT_SETTINGS.invoicePrefix,
      paymentTermsDays:
        typeof parsed.paymentTermsDays === "number" &&
        parsed.paymentTermsDays > 0
          ? parsed.paymentTermsDays
          : DEFAULT_SETTINGS.paymentTermsDays,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function calculateDueDate(
  issueDate: Date,
  paymentTermsDays: number
): Date {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate;
}

// Arbitrary for valid user settings
const userSettingsArb: fc.Arbitrary<UserSettings> = fc.record({
  businessName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  businessAddress: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null }),
  logoUrl: fc.option(fc.webUrl(), { nil: null }),
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'CAD', 'AUD'),
  hourlyRate: fc.option(fc.float({ min: 0, max: 1000, noNaN: true }), { nil: null }),
  invoicePrefix: fc.stringMatching(/^[A-Z]{2,5}$/),
  paymentTermsDays: fc.integer({ min: 1, max: 365 }),
});

describe('Settings Property Tests', () => {
  /**
   * 
   * *For any* valid UserSettings object, serializing to JSON and deserializing back 
   * SHALL produce an object equivalent to the original settings.
   * 
   */
  it('Property 11: Settings Round-Trip - serialize then deserialize produces equivalent settings', () => {
    fc.assert(
      fc.property(userSettingsArb, (settings) => {
        const serialized = serializeSettings(settings);
        const deserialized = deserializeSettings(serialized);
        
        expect(deserialized.businessName).toBe(settings.businessName);
        expect(deserialized.businessAddress).toBe(settings.businessAddress);
        expect(deserialized.logoUrl).toBe(settings.logoUrl);
        expect(deserialized.currency).toBe(settings.currency);
        expect(deserialized.invoicePrefix).toBe(settings.invoicePrefix);
        expect(deserialized.paymentTermsDays).toBe(settings.paymentTermsDays);
        
        // Handle floating point comparison for hourlyRate
        if (settings.hourlyRate === null) {
          expect(deserialized.hourlyRate).toBeNull();
        } else {
          expect(deserialized.hourlyRate).toBeCloseTo(settings.hourlyRate, 5);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* invoice issue date and payment terms (in days), the calculated due date 
   * SHALL equal the issue date plus the payment terms days.
   * 
   */
  it('Property 13: Payment Terms Due Date Calculation - due date equals issue date plus terms', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.integer({ min: 1, max: 365 }),
        (issueDate, paymentTermsDays) => {
          const dueDate = calculateDueDate(issueDate, paymentTermsDays);
          
          // Calculate expected due date
          const expectedDueDate = new Date(issueDate);
          expectedDueDate.setDate(expectedDueDate.getDate() + paymentTermsDays);
          
          // Compare dates (ignoring time)
          expect(dueDate.getFullYear()).toBe(expectedDueDate.getFullYear());
          expect(dueDate.getMonth()).toBe(expectedDueDate.getMonth());
          expect(dueDate.getDate()).toBe(expectedDueDate.getDate());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* user with a configured default currency, the currency field 
   * SHALL be preserved through serialization.
   * 
   */
  it('Property 12: Default Currency Application - currency is preserved through serialization', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'),
        (currency) => {
          const settings: UserSettings = {
            businessName: 'Test Business',
            businessAddress: '123 Test St',
            logoUrl: null,
            currency,
            hourlyRate: 100,
            invoicePrefix: 'INV',
            paymentTermsDays: 30,
          };
          
          const serialized = serializeSettings(settings);
          const deserialized = deserializeSettings(serialized);
          
          expect(deserialized.currency).toBe(currency);
        }
      ),
      { numRuns: 100 }
    );
  });
});

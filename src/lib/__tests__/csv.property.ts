/**
 * Property-based tests for CSV export utility
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateCSV, parseCSV, CSVColumn } from '../export/csv';

// Simple record type for testing with index signature for Record<string, unknown> compatibility
interface TestRecord {
  id: string;
  name: string;
  value: string;
  [key: string]: unknown;
}

const testColumns: CSVColumn<TestRecord>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'value', header: 'Value' },
];

// Arbitrary for simple string values (avoiding problematic characters for basic round-trip)
const simpleStringArb = fc.string({ minLength: 0, maxLength: 50 })
  .filter(s => !s.includes('\n') && !s.includes('\r'));

// Arbitrary for test records with simple values
const testRecordArb: fc.Arbitrary<TestRecord> = fc.record({
  id: fc.stringMatching(/^[a-z0-9]{1,10}$/),
  name: simpleStringArb,
  value: simpleStringArb,
});

describe('CSV Property Tests', () => {
  /**
   * 
   * *For any* entity type and set of records, the generated CSV SHALL contain 
   * one row per record plus a header row, with all specified fields present.
   * 
   */
  it('Property 28: CSV Export Completeness - contains header plus one row per record', () => {
    fc.assert(
      fc.property(
        fc.array(testRecordArb, { minLength: 0, maxLength: 20 }),
        (records) => {
          const csv = generateCSV({ data: records, columns: testColumns });
          const lines = csv.split('\n').filter(line => line.length > 0);
          
          // Should have header + data rows
          expect(lines.length).toBe(records.length + 1);
          
          // Header should contain all column headers
          const header = lines[0];
          expect(header).toContain('ID');
          expect(header).toContain('Name');
          expect(header).toContain('Value');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* set of records, generating CSV and parsing back SHALL produce 
   * records equivalent to the original data.
   * 
   */
  it('Property 29: CSV Round-Trip - generate then parse produces equivalent records', () => {
    fc.assert(
      fc.property(
        fc.array(testRecordArb, { minLength: 1, maxLength: 20 }),
        (records) => {
          const csv = generateCSV({ data: records, columns: testColumns });
          const parsed = parseCSV<TestRecord>(csv, testColumns);
          
          expect(parsed.length).toBe(records.length);
          
          for (let i = 0; i < records.length; i++) {
            expect(parsed[i].id).toBe(records[i].id);
            expect(parsed[i].name).toBe(records[i].name);
            expect(parsed[i].value).toBe(records[i].value);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 28 (continued): Empty data should produce header-only CSV
   */
  it('Property 28: CSV Export Completeness - empty data produces header only', () => {
    const csv = generateCSV({ data: [], columns: testColumns });
    const lines = csv.split('\n').filter(line => line.length > 0);
    
    expect(lines.length).toBe(1); // Header only
    expect(lines[0]).toBe('ID,Name,Value');
  });

  /**
   * Property 29 (continued): CSV with special characters should round-trip correctly
   */
  it('Property 29: CSV Round-Trip - handles special characters (commas, quotes)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.stringMatching(/^[a-z0-9]{1,10}$/),
            name: fc.constantFrom('John, Doe', 'Jane "The Great" Smith', 'Simple Name'),
            value: fc.constantFrom('100', '200,50', '"quoted"'),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (records) => {
          const csv = generateCSV({ data: records, columns: testColumns });
          const parsed = parseCSV<TestRecord>(csv, testColumns);
          
          expect(parsed.length).toBe(records.length);
          
          for (let i = 0; i < records.length; i++) {
            expect(parsed[i].id).toBe(records[i].id);
            expect(parsed[i].name).toBe(records[i].name);
            expect(parsed[i].value).toBe(records[i].value);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * CSV Export Utility
 * 
 * Provides functions for generating and parsing CSV data with proper escaping.
 */

export interface CSVColumn<T> {
  key: keyof T;
  header: string;
}

export interface CSVExportOptions<T> {
  data: T[];
  columns: CSVColumn<T>[];
}

/**
 * Escapes a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any existing quotes
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Check if escaping is needed
  const needsEscaping = stringValue.includes(',') || 
                        stringValue.includes('"') || 
                        stringValue.includes('\n') ||
                        stringValue.includes('\r');
  
  if (needsEscaping) {
    // Double any quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Generates a CSV string from an array of records
 * 
 * @param options - The data and column configuration
 * @returns CSV string with headers and data rows
 */
export function generateCSV<T extends Record<string, unknown>>(
  options: CSVExportOptions<T>
): string {
  const { data, columns } = options;
  
  // Generate header row
  const headerRow = columns.map(col => escapeCSVValue(col.header)).join(',');
  
  // Generate data rows
  const dataRows = data.map(record => {
    return columns.map(col => {
      const value = record[col.key];
      return escapeCSVValue(value);
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Splits a CSV line into fields, respecting quoted values
 */
function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote - add single quote to output
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state (don't add the quote delimiter to output)
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  fields.push(current);
  
  return fields;
}

/**
 * Parses a CSV string back into an array of records
 * 
 * @param csv - The CSV string to parse
 * @param columns - Column configuration mapping headers to keys
 * @returns Array of parsed records
 */
export function parseCSV<T extends Record<string, unknown>>(
  csv: string,
  columns: CSVColumn<T>[]
): T[] {
  const lines = csv.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return [];
  }
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const values = splitCSVLine(line);
    const record: Record<string, unknown> = {};
    
    columns.forEach((col, index) => {
      record[col.key as string] = values[index] ?? '';
    });
    
    return record as T;
  });
}

// Pre-defined column configurations for common exports

export const invoiceColumns: CSVColumn<{
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  currency: string;
  sentAt: string;
  paidAt: string;
  paymentMethod: string;
}>[] = [
  { key: 'invoiceNumber', header: 'Invoice Number' },
  { key: 'clientName', header: 'Client Name' },
  { key: 'clientEmail', header: 'Client Email' },
  { key: 'status', header: 'Status' },
  { key: 'issueDate', header: 'Issue Date' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'totalAmount', header: 'Total Amount' },
  { key: 'currency', header: 'Currency' },
  { key: 'sentAt', header: 'Sent At' },
  { key: 'paidAt', header: 'Paid At' },
  { key: 'paymentMethod', header: 'Payment Method' },
];

export const expenseColumns: CSVColumn<{
  description: string;
  amount: string;
  date: string;
  receiptUrl: string;
  createdAt: string;
}>[] = [
  { key: 'description', header: 'Description' },
  { key: 'amount', header: 'Amount' },
  { key: 'date', header: 'Date' },
  { key: 'receiptUrl', header: 'Receipt URL' },
  { key: 'createdAt', header: 'Created At' },
];

export const clientColumns: CSVColumn<{
  name: string;
  email: string;
  company: string;
  address: string;
  createdAt: string;
}>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'company', header: 'Company' },
  { key: 'address', header: 'Address' },
  { key: 'createdAt', header: 'Created At' },
];

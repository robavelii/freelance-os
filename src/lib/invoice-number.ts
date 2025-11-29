import { prisma } from "./prisma";

export interface InvoiceNumberParts {
  prefix: string;
  year: number;
  sequence: number;
}

/**
 * Formats invoice number parts into a string with pattern {prefix}-{year}-{sequence}
 * Sequence is zero-padded to 4 digits
 */
export function formatInvoiceNumber(parts: InvoiceNumberParts): string {
  const paddedSequence = parts.sequence.toString().padStart(4, "0");
  return `${parts.prefix}-${parts.year}-${paddedSequence}`;
}

/**
 * Parses an invoice number string into its component parts
 * Expected format: {prefix}-{year}-{sequence}
 */
export function parseInvoiceNumber(invoiceNumber: string): InvoiceNumberParts {
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

/**
 * Generates the next sequential invoice number for a user
 * Handles year boundary reset (sequence resets to 0001 on new year)
 */
export async function generateInvoiceNumber(
  userId: string,
  prefix: string = "INV"
): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Use upsert to atomically get or create the sequence record
  // Then increment the sequence
  const sequence = await prisma.$transaction(async (tx) => {
    // Try to find existing sequence for this user and year
    const existing = await tx.invoiceSequence.findUnique({
      where: {
        userId_year: {
          userId,
          year: currentYear,
        },
      },
    });

    if (existing) {
      // Increment existing sequence
      const updated = await tx.invoiceSequence.update({
        where: {
          userId_year: {
            userId,
            year: currentYear,
          },
        },
        data: {
          sequence: existing.sequence + 1,
        },
      });
      return updated.sequence;
    } else {
      // Create new sequence starting at 1 for new year
      const created = await tx.invoiceSequence.create({
        data: {
          userId,
          year: currentYear,
          sequence: 1,
        },
      });
      return created.sequence;
    }
  });

  return formatInvoiceNumber({
    prefix,
    year: currentYear,
    sequence,
  });
}

/**
 * Gets the current sequence number for a user and year without incrementing
 */
export async function getCurrentSequence(
  userId: string,
  year: number
): Promise<number> {
  const sequence = await prisma.invoiceSequence.findUnique({
    where: {
      userId_year: {
        userId,
        year,
      },
    },
  });

  return sequence?.sequence ?? 0;
}

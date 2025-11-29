import { prisma } from "@/lib/prisma";

export type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE" | "VOID";

export interface MonthlyIncome {
  month: string;
  amount: number;
}

export interface InvoiceWithClient {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number | { toNumber(): number };
  currency: string;
  client: { name: string };
}

export interface OverdueInvoice {
  invoice: InvoiceWithClient;
  daysOverdue: number;
}

export interface DashboardAnalytics {
  monthlyIncome: MonthlyIncome[];
  totalOutstanding: number;
  overdueInvoices: OverdueInvoice[];
  upcomingInvoices: InvoiceWithClient[];
}

/**
 * Calculate the number of days an invoice is overdue
 * @param dueDate The due date of the invoice
 * @returns Number of days overdue (0 if not overdue)
 */
export function calculateDaysOverdue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Check if an invoice is upcoming (due within specified days)
 * @param dueDate The due date of the invoice
 * @param days Number of days to look ahead
 * @returns True if the invoice is due within the specified days
 */
export function isUpcoming(dueDate: Date, days: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return due >= today && due <= futureDate;
}


/**
 * Get dashboard analytics for a user
 * @param userId The user ID to get analytics for
 * @returns Dashboard analytics including monthly income, outstanding amount, overdue and upcoming invoices
 */
export async function getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate date 12 months ago for monthly income
  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  // Get all PAID invoices for the last 12 months
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: "PAID",
      paidAt: {
        gte: twelveMonthsAgo,
      },
    },
    select: {
      totalAmount: true,
      paidAt: true,
    },
  });

  // Aggregate monthly income
  const monthlyIncomeMap = new Map<string, number>();
  
  // Initialize all 12 months with 0
  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - (11 - i));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyIncomeMap.set(monthKey, 0);
  }

  // Sum up paid invoices by month
  for (const invoice of paidInvoices) {
    if (invoice.paidAt) {
      const monthKey = `${invoice.paidAt.getFullYear()}-${String(invoice.paidAt.getMonth() + 1).padStart(2, "0")}`;
      const current = monthlyIncomeMap.get(monthKey) || 0;
      monthlyIncomeMap.set(monthKey, current + Number(invoice.totalAmount));
    }
  }

  // Convert to array sorted by month
  const monthlyIncome: MonthlyIncome[] = Array.from(monthlyIncomeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  // Calculate outstanding amount from unpaid invoices
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: {
        notIn: ["PAID", "VOID"],
      },
    },
    select: {
      totalAmount: true,
    },
  });

  const totalOutstanding = unpaidInvoices.reduce(
    (sum: number, invoice: { totalAmount: unknown }) => sum + Number(invoice.totalAmount),
    0
  );

  // Get overdue invoices with days calculation
  const overdueInvoicesRaw = await prisma.invoice.findMany({
    where: {
      userId,
      status: "OVERDUE",
    },
    include: {
      client: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const overdueInvoices: OverdueInvoice[] = overdueInvoicesRaw.map((invoice: InvoiceWithClient) => ({
    invoice,
    daysOverdue: calculateDaysOverdue(invoice.dueDate),
  }));

  // Get upcoming invoices due within next 7 days
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingInvoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: {
        notIn: ["PAID", "VOID"],
      },
      dueDate: {
        gte: today,
        lte: sevenDaysFromNow,
      },
    },
    include: {
      client: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return {
    monthlyIncome,
    totalOutstanding,
    overdueInvoices,
    upcomingInvoices,
  };
}

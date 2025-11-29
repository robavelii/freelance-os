"use client";

import Link from "next/link";
import { InvoiceWithClient } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface UpcomingInvoicesProps {
  invoices: InvoiceWithClient[];
  currency?: string;
}

export function UpcomingInvoices({ invoices, currency = "USD" }: UpcomingInvoicesProps) {
  const formatCurrency = (value: number | { toNumber(): number }) => {
    const numValue = typeof value === "number" ? value : Number(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return differenceInDays(due, today);
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No upcoming invoices</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const daysUntilDue = getDaysUntilDue(invoice.dueDate);
        return (
          <Link
            key={invoice.id}
            href={`/invoices`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{invoice.invoiceNumber}</span>
              <span className="text-xs text-muted-foreground">{invoice.client.name}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold">
                {formatCurrency(invoice.totalAmount)}
              </span>
              <Badge variant={daysUntilDue <= 2 ? "secondary" : "outline"} className="text-xs">
                {daysUntilDue === 0
                  ? "Due today"
                  : daysUntilDue === 1
                  ? "Due tomorrow"
                  : `Due in ${daysUntilDue} days`}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

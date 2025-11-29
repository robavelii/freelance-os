"use client";

import Link from "next/link";
import { OverdueInvoice } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface OverdueInvoicesProps {
  invoices: OverdueInvoice[];
  currency?: string;
}

export function OverdueInvoices({ invoices, currency = "USD" }: OverdueInvoicesProps) {
  const formatCurrency = (value: number | { toNumber(): number }) => {
    const numValue = typeof value === "number" ? value : Number(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No overdue invoices</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map(({ invoice, daysOverdue }) => (
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
            <Badge variant="destructive" className="text-xs">
              {daysOverdue} {daysOverdue === 1 ? "day" : "days"} overdue
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

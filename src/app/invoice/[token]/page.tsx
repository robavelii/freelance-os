import { notFound } from "next/navigation";
import { getInvoiceByToken, markInvoiceAsViewed } from "@/actions/public-invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { PayInvoiceButton } from "@/components/pay-invoice-button";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  SENT: "bg-blue-500",
  VIEWED: "bg-yellow-500",
  PAID: "bg-green-500",
  OVERDUE: "bg-red-500",
  VOID: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PAID: "Paid",
  OVERDUE: "Overdue",
  VOID: "Void",
};

interface PublicInvoicePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Public Invoice View Page
 * 
 * Displays invoice details including line items, totals, and payment status.
 * Updates invoice status to VIEWED on first access (if SENT).
 * Shows 404 for invalid tokens.
 */
export default async function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const { token } = await params;
  
  // Handle invalid token gracefully
  if (!token) {
    notFound();
  }

  const invoice = await getInvoiceByToken(token);

  // Show 404 page for invalid/missing tokens
  if (!invoice) {
    notFound();
  }

  // Update status to VIEWED on first access (if SENT)
  await markInvoiceAsViewed(token);

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invoice</p>
                <CardTitle className="text-2xl">{invoice.invoiceNumber}</CardTitle>
              </div>
              <Badge className={statusColors[invoice.status]}>
                {statusLabels[invoice.status]}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Business and Client Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* From (Business) */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">From</h3>
                <div className="space-y-1">
                  {invoice.user.logoUrl && (
                    <img 
                      src={invoice.user.logoUrl} 
                      alt="Business logo" 
                      className="h-12 mb-2 object-contain"
                    />
                  )}
                  <p className="font-semibold">
                    {invoice.user.businessName || invoice.user.name || "Business Name"}
                  </p>
                  {invoice.user.businessAddress && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {invoice.user.businessAddress}
                    </p>
                  )}
                  {invoice.user.email && (
                    <p className="text-sm text-muted-foreground">{invoice.user.email}</p>
                  )}
                </div>
              </div>

              {/* To (Client) */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-semibold">{invoice.client.name}</p>
                  {invoice.client.company && (
                    <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
                  )}
                  {invoice.client.address && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {invoice.client.address}
                    </p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="font-medium">{format(invoice.issueDate, "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{format(invoice.dueDate, "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">{statusLabels[invoice.status]}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Line Items Table */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Qty</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Price</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-right">{Number(item.quantity)}</td>
                        <td className="py-3 text-right">{formatCurrency(Number(item.price))}</td>
                        <td className="py-3 text-right">{formatCurrency(Number(item.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 border-t-2 border-primary">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">{formatCurrency(Number(invoice.totalAmount))}</span>
                </div>
              </div>
            </div>

            {/* Payment Status Message */}
            {invoice.status === "PAID" && (
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  ✓ This invoice has been paid
                  {invoice.paidAt && ` on ${format(invoice.paidAt, "MMM d, yyyy")}`}
                </p>
              </div>
            )}

            {invoice.status === "OVERDUE" && (
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center space-y-4">
                <p className="text-red-700 dark:text-red-400 font-medium">
                  ⚠ This invoice is overdue. Payment was due on {format(invoice.dueDate, "MMM d, yyyy")}.
                </p>
                <PayInvoiceButton invoiceId={invoice.id} />
              </div>
            )}

            {(invoice.status === "SENT" || invoice.status === "VIEWED") && (
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center space-y-4">
                <p className="text-blue-700 dark:text-blue-400 font-medium">
                  Payment due by {format(invoice.dueDate, "MMM d, yyyy")}
                </p>
                <PayInvoiceButton invoiceId={invoice.id} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Powered by FreelanceOS</p>
        </div>
      </div>
    </div>
  );
}

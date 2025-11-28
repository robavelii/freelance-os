import { getInvoices } from "@/actions/invoices";
import { getClients } from "@/actions/clients";
import { InvoiceDialog } from "@/components/invoice-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  SENT: "bg-blue-500",
  VIEWED: "bg-yellow-500",
  PAID: "bg-green-500",
  OVERDUE: "bg-red-500",
  VOID: "bg-gray-400",
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const clients = await getClients();

  const totalAmount = invoices
    .filter((inv: any) => inv.status === "PAID")
    .reduce((sum: number, invoice: any) => sum + Number(invoice.totalAmount), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <InvoiceDialog clients={clients} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              ${invoices
                .filter((inv: any) => inv.status !== "PAID" && inv.status !== "VOID")
                .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0)
                .toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice: any) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{invoice.invoiceNumber}</CardTitle>
                  <CardDescription>{invoice.client.name}</CardDescription>
                </div>
                <Badge className={statusColors[invoice.status]}>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Issue Date: {format(invoice.issueDate, "MMM d, yyyy")}</p>
                  <p>Due Date: {format(invoice.dueDate, "MMM d, yyyy")}</p>
                  <p className="mt-2">{invoice.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${Number(invoice.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No invoices yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

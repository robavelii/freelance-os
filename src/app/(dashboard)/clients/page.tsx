import { getClients } from "@/actions/clients";
import { ClientDialog } from "@/components/client-dialog";
import { ExportCSVButton } from "@/components/export-csv-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <div className="flex items-center gap-2">
          <ExportCSVButton endpoint="clients" />
          <ClientDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client: any) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{client.name}</CardTitle>
                <CardDescription>{client.company || "No company"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>{client.email}</p>
                  <p className="mt-2 text-xs">
                    Added {formatDistanceToNow(client.createdAt)} ago
                  </p>
                </div>
                <div className="mt-4 flex gap-2 text-sm">
                   <div className="flex flex-col">
                      <span className="font-bold">{client._count.projects}</span>
                      <span className="text-xs text-muted-foreground">Projects</span>
                   </div>
                   <div className="flex flex-col ml-4">
                      <span className="font-bold">{client._count.invoices}</span>
                      <span className="text-xs text-muted-foreground">Invoices</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {clients.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
                No clients found. Add one to get started.
            </div>
        )}
      </div>
    </div>
  );
}

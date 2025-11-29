import { getClientById } from "@/actions/clients";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
        <div className="text-muted-foreground">
          {client.company && <span>{client.company} • </span>}
          <span>{client.email}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{client.projects.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{client.invoices.length}</div>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
            {client.projects.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No projects found.</div>
            ) : (
                <div className="grid gap-4">
                    {client.projects.map((project: { id: string; name: string; updatedAt: Date }) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Updated {formatDistanceToNow(project.updatedAt)} ago</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
            {client.invoices.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No invoices found.</div>
            ) : (
                 <div className="grid gap-4">
                    {client.invoices.map((invoice: { id: string; invoiceNumber: string; dueDate: Date }) => (
                        <Card key={invoice.id}>
                            <CardHeader>
                                <CardTitle>{invoice.invoiceNumber}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Due {formatDistanceToNow(invoice.dueDate)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

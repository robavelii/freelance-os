import { getDashboardStats } from "@/actions/dashboard";
import { getDashboardAnalytics } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Clock, DollarSign, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { IncomeChart } from "@/components/income-chart";
import { OverdueInvoices } from "@/components/overdue-invoices";
import { UpcomingInvoices } from "@/components/upcoming-invoices";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [stats, analytics] = await Promise.all([
    getDashboardStats(),
    getDashboardAnalytics(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalOutstanding.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeChart data={analytics.monthlyIncome} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OverdueInvoices invoices={analytics.overdueInvoices} />
          </CardContent>
        </Card>

        {/* Upcoming Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingInvoices invoices={analytics.upcomingInvoices} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTimeEntries.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {entry.description || "No description"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.project.name} • {entry.project.client.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono">
                    {entry.duration
                      ? new Date(entry.duration * 1000).toISOString().slice(11, 19)
                      : "00:00:00"}
                  </span>
                </div>
              ))}
              {stats.recentTimeEntries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No time entries yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{invoice.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {invoice.client.name} • {format(invoice.issueDate, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      ${Number(invoice.totalAmount).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">{invoice.status}</div>
                  </div>
                </div>
              ))}
              {stats.recentInvoices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No invoices yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

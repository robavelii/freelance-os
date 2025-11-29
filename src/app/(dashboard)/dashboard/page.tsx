import { getDashboardStats } from "@/actions/dashboard";
import { getDashboardAnalytics } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Clock, DollarSign, AlertTriangle, Calendar, ArrowUpRight } from "lucide-react";
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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your freelance business.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {format(new Date(), "MMM d, h:mm a")}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active relationships
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Briefcase className="h-24 w-24 text-purple-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Clock className="h-24 w-24 text-blue-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total billable time
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <DollarSign className="h-24 w-24 text-green-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ${analytics.totalOutstanding.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Monthly Income (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeChart data={analytics.monthlyIncome} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Overdue Invoices */}
        <Card className="glass-card border-destructive/20">
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
        <Card className="glass-card">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTimeEntries.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {entry.description || "No description"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.project.name} • {entry.project.client.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
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

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
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

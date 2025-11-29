import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowUpRight, DollarSign } from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { getDashboardAnalytics } from "@/lib/analytics";
import { generateInsights } from "@/lib/ai";
import { auth } from "@clerk/nextjs/server";

export default async function InsightsPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch real data
  const [stats, analytics] = await Promise.all([
    getDashboardStats(),
    getDashboardAnalytics(userId),
  ]);

  // Prepare data for AI
  const aiData = {
    totalRevenue: analytics.monthlyIncome.reduce((acc: number, curr: any) => acc + curr.total, 0),
    outstanding: analytics.totalOutstanding,
    activeProjects: stats.totalProjects,
    recentInvoices: stats.recentInvoices.map((inv: any) => ({
      amount: inv.totalAmount,
      status: inv.status,
      client: inv.client.name
    })),
    recentTime: stats.recentTimeEntries.length
  };

  // Generate AI insights
  const insights = await generateInsights(aiData);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">AI Insights</h2>
          <p className="text-muted-foreground">Powered by Gemini Pro</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full text-primary">
            Live Analysis
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Forecast */}
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Analysis</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.monthlyIncome.reduce((acc: number, curr: any) => acc + curr.total, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total Revenue (L12M)
            </p>
            <div className="mt-4 rounded-md bg-primary/10 p-3">
              <p className="text-sm text-primary">
                <Brain className="mr-2 inline-block h-4 w-4" />
                {insights.revenue}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Client Analysis */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Intelligence</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients} Active</div>
            <p className="text-xs text-muted-foreground">
              Client Relationships
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-start text-sm">
                <ArrowUpRight className="mr-2 h-4 w-4 text-green-500 mt-1 shrink-0" />
                <span>{insights.client}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Optimization */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Efficiency</div>
            <p className="text-xs text-muted-foreground">
              Business Health
            </p>
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-sm">
                {insights.expense}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Productivity Analysis</CardTitle>
            <CardDescription>
              AI-driven analysis of your work patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg m-4">
              <p>Chart generation coming soon...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Smart Recommendations</CardTitle>
            <CardDescription>
              Actionable steps to grow your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 rounded-md border border-white/10 bg-white/5 p-4">
                <Brain className="mt-1 h-5 w-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Growth Opportunity
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on your revenue growth, you are positioned to increase rates by 10-15% for new clients.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

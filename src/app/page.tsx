import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  Receipt 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FreelanceOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Manage Your Freelance Business
            <span className="block text-primary">All in One Place</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Track time, create invoices, manage clients, and get paid faster. 
            FreelanceOS is the all-in-one dashboard for independent professionals.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg">Start Free</Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Everything You Need</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Powerful features to help you run your freelance business efficiently.
            </p>
            
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Clock className="h-8 w-8" />}
                title="Time Tracking"
                description="Track time with a simple timer. Group entries by date and see daily totals."
              />
              <FeatureCard
                icon={<FileText className="h-8 w-8" />}
                title="Professional Invoices"
                description="Create and send beautiful PDF invoices. Auto-generate invoice numbers."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Client Management"
                description="Keep all your client information organized in one place."
              />
              <FeatureCard
                icon={<CreditCard className="h-8 w-8" />}
                title="Online Payments"
                description="Accept payments via Stripe. Clients can pay directly from invoices."
              />
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8" />}
                title="Analytics Dashboard"
                description="Visualize your income, track outstanding payments, and spot trends."
              />
              <FeatureCard
                icon={<Receipt className="h-8 w-8" />}
                title="Expense Tracking"
                description="Log expenses and export data for tax time. CSV export included."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join freelancers who use FreelanceOS to manage their business.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FreelanceOS. Built for freelancers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  Receipt,
  ArrowRight,
  CheckCircle2,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">FreelanceOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 blur-3xl"></div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6">
              Manage Your Freelance Business
              <span className="block text-gradient mt-2">Like a Pro</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Track time, create invoices, manage clients, and get paid faster. 
              FreelanceOS is the all-in-one dashboard for independent professionals.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Start for Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg glass hover:bg-primary/5">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview Placeholder */}
          <div className="mt-20 mx-auto max-w-5xl rounded-xl border bg-card/50 shadow-2xl overflow-hidden glass-card animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="aspect-[16/9] bg-muted/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
              <p className="text-muted-foreground z-0">Dashboard Preview Image</p>
              {/* TODO: Replace with <Image src="/dashboard-preview.png" ... /> */}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to thrive</h2>
              <p className="mt-4 text-lg text-muted-foreground">Powerful tools designed specifically for the modern independent professional.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Clock className="h-6 w-6 text-blue-400" />}
                title="Smart Time Tracking"
                description="Effortlessly track billable hours. Switch tasks in seconds and generate reports automatically."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6 text-purple-400" />}
                title="Beautiful Invoicing"
                description="Create stunning, branded invoices that get you paid faster. Automated follow-ups included."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6 text-green-400" />}
                title="Client CRM"
                description="Manage relationships, not just contacts. Keep track of project history and communication."
              />
              <FeatureCard
                icon={<CreditCard className="h-6 w-6 text-pink-400" />}
                title="Seamless Payments"
                description="Accept credit cards and bank transfers directly on your invoices via Stripe integration."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6 text-orange-400" />}
                title="Financial Insights"
                description="Real-time analytics on your revenue, expenses, and profit margins. Know your numbers."
              />
              <FeatureCard
                icon={<Receipt className="h-6 w-6 text-teal-400" />}
                title="Expense Management"
                description="Snap receipts and categorize expenses instantly. Tax season has never been this easy."
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="py-24 bg-muted/30 border-y border-white/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground mb-8">Trusted by 10,000+ Freelancers</h3>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              <div className="flex items-center justify-center text-xl font-bold">Acme Corp</div>
              <div className="flex items-center justify-center text-xl font-bold">Global Tech</div>
              <div className="flex items-center justify-center text-xl font-bold">Design Studio</div>
              <div className="flex items-center justify-center text-xl font-bold">Indie Makers</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-primary/5" />
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to upgrade your workflow?</h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground mb-10">
              Join the community of high-performing freelancers who trust FreelanceOS.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-2xl shadow-primary/30 transition-transform hover:scale-105">
                Get Started Now
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required • 14-day free trial</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">FreelanceOS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The operating system for the modern independent workforce.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary">API</Link></li>
                <li><Link href="#" className="hover:text-primary">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FreelanceOS. All rights reserved.</p>
          </div>
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/50 p-8 transition-all hover:bg-card/80 hover:shadow-2xl hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
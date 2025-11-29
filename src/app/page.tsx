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
  Zap,
  Briefcase,
  DollarSign
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">FreelanceOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
          
          {/* Dashboard Preview */}
          <div className="mt-20 mx-auto max-w-6xl rounded-2xl border border-primary/20 bg-card/50 shadow-2xl overflow-hidden glass-card animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center relative p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
              
              {/* Mockup Dashboard UI */}
              <div className="relative z-0 w-full h-full rounded-lg border border-white/10 bg-background/80 backdrop-blur-sm p-4 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div>
                    <div className="h-4 w-24 rounded bg-gradient-to-r from-primary to-primary/60 mb-1"></div>
                    <div className="h-2 w-40 rounded bg-muted/50"></div>
                  </div>
                  <div className="h-2 w-32 rounded bg-muted/50"></div>
                </div>
                
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {/* Total Clients */}
                  <div className="h-20 rounded-lg bg-primary/10 border border-primary/30 p-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <div className="h-2 w-16 rounded bg-muted/50 mb-2"></div>
                      <div className="text-xl font-bold text-primary">12</div>
                    </div>
                  </div>
                  
                  {/* Active Projects */}
                  <div className="h-20 rounded-lg bg-purple-500/10 border border-purple-500/30 p-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5">
                      <Briefcase className="h-12 w-12 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="h-2 w-16 rounded bg-muted/50 mb-2"></div>
                      <div className="text-xl font-bold text-purple-500">8</div>
                    </div>
                  </div>
                  
                  {/* Hours Tracked */}
                  <div className="h-20 rounded-lg bg-blue-500/10 border border-blue-500/30 p-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5">
                      <Clock className="h-12 w-12 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="h-2 w-16 rounded bg-muted/50 mb-2"></div>
                      <div className="text-xl font-bold text-blue-500">156h</div>
                    </div>
                  </div>
                  
                  {/* Outstanding */}
                  <div className="h-20 rounded-lg bg-primary/10 border border-primary/30 p-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5">
                      <DollarSign className="h-12 w-12 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <div className="h-2 w-16 rounded bg-muted/50 mb-2"></div>
                      <div className="text-xl font-bold text-primary">$4.2k</div>
                    </div>
                  </div>
                </div>
                
                {/* Chart and Lists */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-28 rounded-lg bg-muted/20 border border-white/10 p-2">
                    <div className="h-2 w-20 rounded bg-muted/50 mb-2"></div>
                    <div className="flex items-end justify-between h-16 gap-1">
                      <div className="w-full h-8 bg-primary/30 rounded-t"></div>
                      <div className="w-full h-12 bg-primary/40 rounded-t"></div>
                      <div className="w-full h-10 bg-primary/35 rounded-t"></div>
                      <div className="w-full h-14 bg-primary/45 rounded-t"></div>
                      <div className="w-full h-11 bg-primary/38 rounded-t"></div>
                    </div>
                  </div>
                  <div className="col-span-1 h-28 rounded-lg bg-muted/20 border border-white/10 p-2">
                    <div className="h-2 w-20 rounded bg-muted/50 mb-2"></div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full rounded bg-muted/40"></div>
                      <div className="h-2 w-3/4 rounded bg-muted/40"></div>
                      <div className="h-2 w-full rounded bg-muted/40"></div>
                    </div>
                  </div>
                </div>
              </div>
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
                icon={<Clock className="h-6 w-6 text-primary" />}
                title="Time Tracking"
                description="Track billable hours with a persistent timer that works offline. Automatically saves to localStorage and syncs when you're back online."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6 text-primary" />}
                title="Invoice Management"
                description="Create, send, and track invoices. Generate PDF invoices and monitor payment status with overdue alerts."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Client & Project Management"
                description="Organize clients and projects in one place. Track project details, time entries, and invoices per client."
              />
              <FeatureCard
                icon={<Briefcase className="h-6 w-6 text-primary" />}
                title="AI-Powered Insights"
                description="Get intelligent business insights powered by Google Gemini AI. Analyze revenue trends, client behavior, and optimization opportunities."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6 text-primary" />}
                title="Dashboard Analytics"
                description="Real-time overview of your business metrics. Track total clients, active projects, hours worked, and outstanding payments."
              />
              <FeatureCard
                icon={<Receipt className="h-6 w-6 text-primary" />}
                title="Expense Tracking"
                description="Record and categorize business expenses. Keep track of costs to understand your true profit margins."
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        {/* <section className="py-24 bg-muted/30 border-y border-white/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground mb-8">Trusted by 10,000+ Freelancers</h3>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               Placeholders for logos 
              <div className="flex items-center justify-center text-xl font-bold">Acme Corp</div>
              <div className="flex items-center justify-center text-xl font-bold">Global Tech</div>
              <div className="flex items-center justify-center text-xl font-bold">Design Studio</div>
              <div className="flex items-center justify-center text-xl font-bold">Indie Makers</div>
            </div>
          </div>
        </section> */}

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
      <footer className="border-t py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">FreelanceOS</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The all-in-one operating system for modern freelancers and independent professionals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FreelanceOS. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="https://x.com/robavelii" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">X</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h.004v.002L13.49 8.35l6.75 11.648h-1.923L11.5 12.876l-6.23 10.823H3.37l8.24-14.258L1.45 2.25h2.076L9.25 9.179 14.02 2.25h4.224Z" /></svg>
              </Link>
              <Link href="https://github.com/robavelii/freelance-os" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </Link>
            </div>
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { createCheckoutSession } from "@/actions/stripe";

export default function PricingPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-gradient">Upgrade Your Workspace</h2>
        <p className="text-muted-foreground max-w-2xl">
          Unlock advanced features and take your freelance business to the next level.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Free Plan */}
        <Card className="glass-card relative">
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <CardDescription>For new freelancers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Up to 3 Clients</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Basic Invoicing</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Time Tracking</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>Current Plan</Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="glass-card border-primary shadow-2xl shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            POPULAR
          </div>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited Clients</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Advanced Invoicing & PDF</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> AI Insights</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Custom Branding</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <form action={createCheckoutSession.bind(null, process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder')} className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90" type="submit">Upgrade to Pro</Button>
            </form>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Agency</CardTitle>
            <CardDescription>For teams & agencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Everything in Pro</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Team Members</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Advanced Analytics</li>
              <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> API Access</li>
            </ul>
          </CardContent>
          <CardFooter>
            <form action={createCheckoutSession.bind(null, process.env.STRIPE_PRICE_AGENCY || 'price_agency_placeholder')} className="w-full">
              <Button className="w-full" variant="outline" type="submit">Upgrade to Agency</Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Need a custom solution?</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          We offer tailored packages for large organizations with specific compliance needs.
        </p>
        <Button variant="secondary">Contact Enterprise Team</Button>
      </div>
    </div>
  );
}

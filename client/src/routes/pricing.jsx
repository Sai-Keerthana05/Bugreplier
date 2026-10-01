import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-cyan">Pricing</div>
          <h1 className="mt-2 text-4xl sm:text-6xl font-bold tracking-tight">
            Simple, <span className="gradient-text">honest pricing</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you need unlimited analyses and pro features.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Plan
            name="Free"
            price="$0"
            period="forever"
            desc="Try the full workflow without a card."
            features={[
              "5 code analyses per day",
              "Basic bug detection",
              "Corrected code generation",
              "7-day history",
              "Standard processing",
            ]}
            cta="Start free"
            href="/auth?mode=signup"
          />
          <Plan
            highlight
            name="Prime"
            price="$12"
            period="/month"
            desc="For developers shipping every day."
            features={[
              "Unlimited code analyses",
              "Advanced AI explanations",
              "Unlimited history",
              "Video explanation generation",
              "Email reports",
              "Priority processing lanes",
              "Early access to new features",
            ]}
            cta="Go Prime"
            href="/auth?mode=signup"
          />
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need team plans or invoicing?{" "}
          <a href="mailto:hello@bugreplier.app" className="text-cyan hover:underline">Contact us</a>
        </p>
      </section>
    </div>
  );
}

function Plan({
  name, price, period, desc, features, cta, href, highlight,
}) {
  return (
    <div className={`relative rounded-2xl p-8 ${highlight ? "glass-strong shadow-glow border-primary/30" : "glass"}`}>
      {highlight && (
        <div className="absolute -top-3 left-8 rounded-full gradient-brand text-white text-xs px-3 py-1">
          Most popular
        </div>
      )}
      <h3 className="text-2xl font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-6xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="mt-7 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className="h-4 w-4 mt-0.5 text-cyan flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className={`mt-8 w-full h-11 ${highlight ? "gradient-brand text-white border-0" : ""}`} variant={highlight ? "default" : "outline"}>
        <Link to={href}>
          {cta} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  Bug, Sparkles, Zap, Shield, Code2, History, Mail, Video,
  ArrowRight, Check, Github, Twitter, Brain, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { ParticleNetwork } from "@/components/particle-network";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <ParticleNetwork />
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center relative">
        <h1 className="mt-6 text-5xl sm:text-7xl font-bold tracking-tight">
          Fix Bugs Faster <br />
          <span className="gradient-text">with AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Analyze code, understand errors, generate fixes, and improve your coding
          productivity with an AI built for developers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gradient-brand text-white border-0 shadow-glow h-12 px-6">
            <Link to="/auth?mode=signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 glass">
            <a href="#features">View Features</a>
          </Button>
        </div>

        <div className="mt-16 mx-auto max-w-4xl glass-strong rounded-2xl p-2 shadow-glow animate-float">
          <div className="rounded-xl bg-[oklch(0.14_0.03_265)] text-[oklch(0.92_0.01_250)] p-5 text-left font-mono text-[13px] leading-relaxed overflow-x-auto">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-3 text-xs text-muted-foreground">analyze.ts</span>
            </div>
            <pre className="whitespace-pre">
<span className="text-[oklch(0.7_0.15_280)]">function</span>{" "}
<span className="text-[oklch(0.8_0.15_200)]">findUser</span>(id) {`{`}
{`\n  `}<span className="text-[oklch(0.7_0.15_280)]">const</span> user = users.<span className="text-[oklch(0.8_0.15_200)]">find</span>(u =&gt; u.id == id);
{`\n  `}<span className="text-[oklch(0.7_0.15_280)]">return</span> user.name.<span className="text-[oklch(0.8_0.15_200)]">toUpperCase</span>();
{`\n`}{`}`}
            </pre>
            <div className="mt-4 rounded-lg border border-[oklch(0.7_0.18_285)]/30 bg-[oklch(0.7_0.18_285)]/10 p-3 text-xs">
              <div className="flex items-center gap-2 text-[oklch(0.82_0.16_200)] font-medium">
                <Sparkles className="h-3.5 w-3.5" /> AI detected 2 issues
              </div>
              <div className="mt-1 text-muted-foreground">
                Use <code className="text-[oklch(0.82_0.16_200)]">===</code> for strict equality. Handle <code className="text-[oklch(0.82_0.16_200)]">undefined</code> user before calling <code className="text-[oklch(0.82_0.16_200)]">.name</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const langs = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "Swift", "Kotlin", "Ruby"];
  return (
    <section className="border-y bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">Supports</span>
        {langs.map((l) => (
          <span key={l} className="font-mono">{l}</span>
        ))}
        <span className="font-mono">+ 20 more</span>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Brain, title: "AI Bug Detection", desc: "Catches logic errors, edge cases, and runtime bugs in seconds." },
  { icon: Code2, title: "Auto-Fixed Code", desc: "Get a complete, working corrected version of your snippet." },
  { icon: Sparkles, title: "Plain-English Explanations", desc: "Understand what went wrong without wading through docs." },
  { icon: History, title: "Analysis History", desc: "Search and revisit every analysis. Prime keeps it forever." },
  { icon: Video, title: "Video Explanations", desc: "Generate narrated walkthroughs of your fix (Prime)." },
  { icon: Mail, title: "Email Reports", desc: "Send the full report to your inbox for later." },
  { icon: Gauge, title: "Priority Processing", desc: "Prime gets the fastest model lanes and bigger context." },
  { icon: Shield, title: "Private by Default", desc: "Your code is yours. Never used to train models." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader
        eyebrow="Features"
        title={<>Everything you need to <span className="gradient-text">squash bugs</span></>}
        sub="A focused workspace for debugging, explaining, and fixing code — fast."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="glass rounded-2xl p-5 hover:shadow-glow transition">
            <div className="h-10 w-10 rounded-lg gradient-brand grid place-items-center text-white">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Paste your code", desc: "Drop any snippet into the editor — 25+ languages supported." },
    { n: "02", title: "AI analyzes it", desc: "Bug Replier finds issues, explains the root cause and writes a fix." },
    { n: "03", title: "Ship the fix", desc: "Copy the corrected code, save it to history, or email yourself the report." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="How it works" title="Three steps to a working fix" />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="glass rounded-2xl p-7 relative overflow-hidden">
            <div className="text-7xl font-bold gradient-text opacity-30 leading-none">{s.n}</div>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="Pricing" title="Start free. Go Prime when you ship more." />
      <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <PlanCard
          name="Free"
          price="$0"
          desc="Everything to try Bug Replier."
          features={[
            "5 code analyses per day",
            "Basic bug detection",
            "Corrected code generation",
            "7-day history",
          ]}
          cta={<Link to="/auth?mode=signup">Get started</Link>}
        />
        <PlanCard
          highlight
          name="Prime"
          price="$12"
          suffix="/mo"
          desc="For developers who ship every day."
          features={[
            "Unlimited analyses",
            "Advanced AI explanations",
            "Unlimited history",
            "Video explanation generation",
            "Email reports",
            "Priority processing",
          ]}
          cta={<Link to="/pricing">Go Prime</Link>}
        />
      </div>
    </section>
  );
}

function PlanCard({
  name, price, suffix, desc, features, cta, highlight,
}) {
  return (
    <div className={`relative rounded-2xl p-7 ${highlight ? "glass-strong shadow-glow border-primary/30" : "glass"}`}>
      {highlight && (
        <div className="absolute -top-3 left-7 rounded-full gradient-brand text-white text-xs px-3 py-1">
          Most popular
        </div>
      )}
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-bold">{price}</span>
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      <ul className="mt-6 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-cyan flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className={`mt-7 w-full ${highlight ? "gradient-brand text-white border-0" : ""}`} variant={highlight ? "default" : "outline"}>
        {cta}
      </Button>
    </div>
  );
}

function Testimonials() {
  const items = [
    { q: "Saved me 3 hours debugging a tricky async issue. Felt like pair-programming with a senior.", a: "Mira K.", r: "Full-stack dev" },
    { q: "The explanations are genuinely beginner-friendly. My junior teammates love it.", a: "Daniel R.", r: "Tech lead" },
    { q: "I use it daily for code reviews. The corrected code is almost always production-ready.", a: "Sara L.", r: "Indie hacker" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="Loved by developers" title="What people are saying" />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {items.map((t) => (
          <figure key={t.a} className="glass rounded-2xl p-6">
            <blockquote className="text-sm leading-relaxed">"{t.q}"</blockquote>
            <figcaption className="mt-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{t.a}</span> · {t.r}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// eslint-disable-next-line react/no-unstable-nested-components
function FAQ() {
  const faqs = [
    { q: "Which languages are supported?", a: "JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, Scala, R, MATLAB, Perl, Lua, SQL, Bash, PowerShell, HTML, CSS, and more." },
    { q: "Is my code used to train AI models?", a: "No. Your code is sent to the AI provider only for the analysis request and is not retained for training." },
    { q: "What's included in the Free plan?", a: "5 analyses per day, basic bug detection, corrected code, and 7-day history." },
    { q: "Can I cancel Prime anytime?", a: "Yes. You can cancel anytime and keep access until the end of your billing period." },
    { q: "How accurate is the AI?", a: "Bug Replier uses state-of-the-art models. For critical code, always review the suggested fix before shipping." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeader eyebrow="FAQ" title="Questions, answered" />
      <Accordion type="single" collapsible className="mt-10 glass rounded-2xl px-6">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`i${i}`} className="border-border/60">
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="glass-strong rounded-3xl p-12 text-center shadow-glow relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
          Ready to <span className="gradient-text">fix faster?</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Free forever for 5 analyses a day. No card required.
        </p>
        <Button asChild size="lg" className="mt-7 gradient-brand text-white border-0 h-12 px-8">
          <Link to="/auth?mode=signup">
            Start free <Zap className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-7 w-7 rounded-md gradient-brand text-white">
            <Bug className="h-3.5 w-3.5" />
          </span>
          <span>© {new Date().getFullYear()} Bug Replier</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
          <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-widest text-cyan">{eyebrow}</div>
      <h2 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default Landing;

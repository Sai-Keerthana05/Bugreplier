import { Link } from "react-router-dom";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid place-items-center h-8 w-8 rounded-lg gradient-brand text-white">
            <Bug className="h-4 w-4" />
          </span>
          <span className="text-lg text-foreground">Bug Replier</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition">Features</a>
          <a href="/#how" className="hover:text-foreground transition">How it works</a>
          <Link to="/pricing" className="hover:text-foreground transition">Pricing</Link>
          <a href="/#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild className="gradient-brand text-white border-0">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="gradient-brand text-white border-0 shadow-glow">
                <Link to="/auth?mode=signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Code2, Activity, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, token } = useAuth();
  
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch("/api/analyses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch analysis history");
      }
      return res.json();
    },
    enabled: !!token,
  });

  const today = new Date().toISOString().slice(0, 10);
  const usedToday = user?.last_analysis_date === today ? user.analyses_used_today : 0;
  const limit = 5;
  const remaining = user?.subscription === "prime" ? "∞" : Math.max(0, limit - usedToday);

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your code.</p>
        </div>
        <Button asChild className="gradient-brand text-white border-0">
          <Link to="/analyze"><Zap className="mr-2 h-4 w-4" /> New analysis</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Code2} label="Total analyses" value={user?.analyses_total ?? 0} />
        <StatCard icon={Activity} label="Recent (this period)" value={analyses.length} />
        <StatCard icon={Crown} label="Plan" value={(user?.subscription ?? "free").toUpperCase()} accent />
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Zap className="h-4 w-4" /> Daily credits
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{remaining}</div>
          {user?.subscription === "free" && (
            <Progress value={(usedToday / limit) * 100} className="mt-3" />
          )}
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent analyses</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/history">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center py-12 text-muted-foreground animate-pulse">
            Loading recent analyses…
          </div>
        ) : analyses.length === 0 ? (
          <div className="mt-6 text-center py-12 text-muted-foreground">
            <Code2 className="h-10 w-10 mx-auto opacity-40" />
            <p className="mt-3 text-sm">No analyses yet.</p>
            <Button asChild className="mt-4 gradient-brand text-white border-0">
              <Link to="/analyze">Analyze your first snippet</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border/60">
            {analyses.slice(0, 5).map((a) => (
              <Link key={a.id} to="/history" className="flex items-center justify-between py-3 hover:bg-accent/40 px-2 rounded-md transition">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate text-foreground">{a.error_summary || "Analysis"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">{a.language}</div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`glass rounded-2xl p-5 ${accent ? "shadow-glow" : ""}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className={`mt-2 text-3xl font-bold ${accent ? "gradient-text" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

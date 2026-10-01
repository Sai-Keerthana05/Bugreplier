import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Trash2, ChevronDown, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function HistoryPage() {
  const { token, updateUser } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("all");

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

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  const delM = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/analyses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete analysis");
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analyses"] });
      refreshProfile();
      toast.success("Deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const langs = Array.from(new Set(analyses.map((a) => a.language)));
  const filtered = analyses.filter((a) => {
    if (lang !== "all" && a.language !== lang) return false;
    if (!q) return true;
    const hay = `${a.error_summary} ${a.explanation} ${a.original_code}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">History</h1>
      <p className="text-muted-foreground mt-1">Browse and search every analysis.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search analyses…" className="pl-9 glass" />
        </div>
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-40 glass"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {langs.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <HistoryIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
            <p className="mt-3 text-sm text-muted-foreground">No analyses match your filters.</p>
          </div>
        )}
        {filtered.map((a) => (
          <Collapsible key={a.id} className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              <CollapsibleTrigger className="flex-1 flex items-center gap-3 text-left group">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition group-data-[state=open]:rotate-180" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate text-foreground">{a.error_summary || "Analysis"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex gap-2 font-mono">
                    <span>{a.language}</span>·<span>{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </CollapsibleTrigger>
              <Button size="icon" variant="ghost" onClick={() => delM.mutate(a.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <CollapsibleContent>
              <div className="px-5 pb-5 space-y-4 border-t border-border/60 pt-4">
                <Field label="Root cause">{a.root_cause}</Field>
                <Field label="Explanation">{a.explanation}</Field>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Original</div>
                  <pre className="rounded-lg bg-[oklch(0.14_0.03_265)] text-[oklch(0.85_0.01_250)] p-3 text-xs font-mono overflow-x-auto max-h-48">{a.original_code}</pre>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Corrected</div>
                  <pre className="rounded-lg bg-[oklch(0.14_0.03_265)] text-[oklch(0.92_0.01_250)] p-3 text-xs font-mono overflow-x-auto max-h-72">{a.corrected_code}</pre>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

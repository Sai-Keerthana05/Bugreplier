import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Copy, Download, Video, Mail, AlertTriangle, Wand2, Check } from "lucide-react";
import { toast } from "sonner";

const LANGS = [
  "JavaScript","TypeScript","Python","Java","C","C++","C#","Go","Rust","PHP","Ruby",
  "Swift","Kotlin","Dart","Scala","R","MATLAB","Perl","Lua","SQL","Bash","PowerShell","HTML","CSS",
];

export default function AnalyzePage() {
  const { token, updateUser } = useAuth();
  const qc = useQueryClient();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [result, setResult] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");

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

  const m = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze code");
      }
      return data;
    },
    onSuccess: (r) => {
      setResult(r);
      qc.invalidateQueries({ queryKey: ["analyses"] });
      refreshProfile();
      toast.success("Analysis complete");
    },
    onError: (e) => toast.error(e.message),
  });

  const videoM = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/analyses/${result.id}/video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate video explanation");
      }
      return data;
    },
    onSuccess: (r) => {
      setResult((p) => p ? { ...p, video_script: r.script } : p);
      toast.success("Video script generated");
    },
    onError: (e) => toast.error(e.message),
  });

  const emailM = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/analyses/${result.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email report");
      }
      return data;
    },
    onSuccess: () => { toast.success("Report sent"); setEmailOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
  };

  const download = () => {
    if (!result) return;
    const md = `# Bug Replier Report\n\n**Language:** ${result.language}\n\n## Summary\n${result.error_summary}\n\n## Root Cause\n${result.root_cause}\n\n## Explanation\n${result.explanation}\n\n## Corrected Code\n\`\`\`${result.language.toLowerCase()}\n${result.corrected_code}\n\`\`\`\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `bug-replier-${result.id.slice(0, 8)}.md`; a.click();
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analyze Code</h1>
          <p className="text-muted-foreground mt-1">Paste a snippet — AI finds the bug and rewrites it.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="glass rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{code.length.toLocaleString()} chars</span>
          </div>
          <div className="mt-4 flex-1 relative rounded-lg overflow-hidden border border-border bg-[oklch(0.14_0.03_265)]">
            <div className="flex">
              <div className="select-none text-right pr-3 pl-3 py-3 text-[12px] leading-6 text-muted-foreground/60 font-mono border-r border-border/30">
                {Array.from({ length: Math.max(20, code.split("\n").length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your ${language} code here…`}
                spellCheck={false}
                className="font-mono text-[13px] leading-6 min-h-[420px] resize-none border-0 bg-transparent focus-visible:ring-0 text-[oklch(0.92_0.01_250)]"
              />
            </div>
          </div>
          <Button
            onClick={() => m.mutate()}
            disabled={!code.trim() || m.isPending}
            className="mt-4 w-full h-11 gradient-brand text-white border-0 shadow-glow"
          >
            {m.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {m.isPending ? "Analyzing…" : "Analyze with AI"}
          </Button>
        </div>

        {/* Results */}
        <div className="glass rounded-2xl p-5 min-h-[520px]">
          {!result && !m.isPending && (
            <div className="h-full grid place-items-center text-center">
              <div>
                <div className="mx-auto h-12 w-12 rounded-xl gradient-brand grid place-items-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                  Results will appear here. Paste your code and hit <b>Analyze</b>.
                </p>
              </div>
            </div>
          )}
          {m.isPending && (
            <div className="h-full grid place-items-center text-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                <p className="text-sm text-muted-foreground">AI is reviewing your code…</p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <Section icon={AlertTriangle} title="Error Summary" tone="warning">
                {result.error_summary}
              </Section>
              <Section title="Root Cause">{result.root_cause}</Section>
              <Section icon={Check} title="Explanation" tone="success">{result.explanation}</Section>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-foreground">Corrected Code</h3>
                  <Button size="sm" variant="ghost" onClick={() => copy(result.corrected_code)}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                  </Button>
                </div>
                <pre className="rounded-lg bg-[oklch(0.14_0.03_265)] text-[oklch(0.92_0.01_250)] p-4 text-[12.5px] leading-6 font-mono overflow-x-auto max-h-72">
{result.corrected_code}
                </pre>
              </div>

              {result.video_script && (
                <Section icon={Video} title="Video Script" tone="info">
                  <pre className="whitespace-pre-wrap text-sm text-foreground bg-[oklch(0.14_0.03_265)] p-4 rounded-lg">{result.video_script}</pre>
                </Section>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                <Button size="sm" variant="outline" onClick={download}><Download className="h-3.5 w-3.5 mr-1.5" /> Download report</Button>
                <Button size="sm" variant="outline" onClick={() => videoM.mutate()} disabled={videoM.isPending || !!result.video_script}>
                  {videoM.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Video className="h-3.5 w-3.5 mr-1.5" />}
                  {result.video_script ? "Video script ready" : "Generate Video Explanation"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEmailOpen(true)}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" /> Send Report to Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Email the report</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="em">Recipient email</Label>
            <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={() => emailM.mutate()} disabled={!email || emailM.isPending}>
              {emailM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  icon: Icon, title, children, tone,
}) {
  const colors = ({
    warning: "border-amber-500/20 bg-amber-500/5 text-amber-200",
    success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-200",
    info: "border-sky-500/20 bg-sky-500/5 text-sky-200",
  })[tone ?? ""] ?? "border-border/60 bg-muted/20 text-foreground";

  return (
    <div className={`rounded-xl border p-4 ${colors}`}>
      <div className="flex items-center gap-2 font-semibold text-sm">
        {Icon && <Icon className="h-4 w-4" />}
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

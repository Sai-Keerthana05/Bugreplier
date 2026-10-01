import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Bug, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

const SigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        SignupSchema.parse({ email, password, name });
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to sign up");
        
        toast.success("Account created successfully");
        signIn(data.token, data.user);
        navigate("/dashboard");
      } else if (mode === "forgot") {
        if (!email) throw new Error("Email is required");
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        // Since forgot-password might be optional/mocked, handle gracefully
        if (!res.ok) throw new Error(data.message || "Forgot password failed");
        
        toast.success("Check your email for the reset link");
      } else {
        SigninSchema.parse({ email, password });
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to sign in");
        
        toast.success("Welcome back!");
        signIn(data.token, data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    toast.info("Google OAuth is configured via Supabase. For local MERN running, please register/login with email & password.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <Link to="/" className="flex items-center gap-2 font-semibold relative">
          <span className="grid place-items-center h-9 w-9 rounded-lg gradient-brand text-white">
            <Bug className="h-4 w-4" />
          </span>
          <span className="text-foreground">Bug Replier</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            Ship code <span className="gradient-text">without the bugs.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Join thousands of developers using AI to analyze, explain and fix code in seconds.
          </p>
        </div>
        <div className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} Bug Replier</div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md glass-strong rounded-2xl p-8 shadow-glow">
          <div className="lg:hidden flex items-center gap-2 font-semibold mb-6">
            <span className="grid place-items-center h-8 w-8 rounded-lg gradient-brand text-white">
              <Bug className="h-4 w-4" />
            </span>
            <span className="text-foreground">Bug Replier</span>
          </div>
          <h1 className="text-2xl font-bold">
            {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start analyzing code with AI in seconds." : mode === "forgot" ? "We'll email you a reset link." : "Sign in to continue to your dashboard."}
          </p>

          {mode !== "forgot" && (
            <>
              <Button onClick={onGoogle} disabled={loading} variant="outline" className="mt-6 w-full glass">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
                Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <Link to="/auth?mode=forgot" className="text-xs text-cyan hover:underline">
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1.5" />
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full gradient-brand text-white border-0">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account? <Link to="/auth?mode=signin" className="text-cyan hover:underline">Sign in</Link></>
            ) : mode === "forgot" ? (
              <Link to="/auth?mode=signin" className="text-cyan hover:underline">Back to sign in</Link>
            ) : (
              <>New here? <Link to="/auth?mode=signup" className="text-cyan hover:underline">Create an account</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

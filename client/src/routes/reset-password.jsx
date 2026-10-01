import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing password reset token");
    }
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      
      toast.success("Password updated successfully");
      navigate("/auth?mode=signin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 shadow-glow">
        <div className="flex items-center gap-2 font-semibold mb-6">
          <span className="grid place-items-center h-8 w-8 rounded-lg gradient-brand text-white">
            <Bug className="h-4 w-4" />
          </span>
          <span className="text-foreground">Bug Replier</span>
        </div>
        <h1 className="text-2xl font-bold">Set a new password</h1>
        {!token ? (
          <p className="mt-4 text-sm text-destructive">Invalid reset link. Please request a new one.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-brand text-white border-0">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

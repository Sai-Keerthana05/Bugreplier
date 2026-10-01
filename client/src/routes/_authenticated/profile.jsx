import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Crown, Mail, User } from "lucide-react";

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
    }
  }, [user]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      
      updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-8 text-muted-foreground animate-pulse">Loading profile…</div>;

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
      <p className="text-muted-foreground mt-1">Manage your account.</p>

      <div className="mt-8 glass-strong rounded-2xl p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full gradient-brand grid place-items-center text-white text-2xl font-bold">
          {(user.name ?? user.email)[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold text-foreground">{user.name ?? "—"}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user.email}</div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${user.subscription === "prime" ? "gradient-brand text-white" : "bg-muted text-muted-foreground"}`}>
          <Crown className="h-3 w-3 inline mr-1" /> {(user.subscription ?? "free").toUpperCase()}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Stat label="Total analyses" value={user.analyses_total} />
        <Stat label="Subscription" value={user.subscription === "prime" ? "Prime" : "Free"} />
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold flex items-center gap-2 text-foreground"><User className="h-4 w-4" /> Account details</h2>
        <div className="mt-4 space-y-4 max-w-md">
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled className="mt-1.5" />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="gradient-brand text-white border-0">Save changes</Button>
            {user.subscription === "free" && (
              <Button asChild variant="outline"><Link to="/pricing">Upgrade to Prime</Link></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

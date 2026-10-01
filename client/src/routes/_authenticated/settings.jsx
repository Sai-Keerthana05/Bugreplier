import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
      <p className="text-muted-foreground mt-1">Manage your preferences.</p>

      <div className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-semibold text-foreground">Theme</h2>
        <p className="text-sm text-muted-foreground mt-1">Dark mode is enabled by default for an ergonomic coding experience.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => document.documentElement.classList.add("dark")}>Dark</Button>
          <Button variant="outline" onClick={() => document.documentElement.classList.remove("dark")}>Light</Button>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">Email reports require a Resend API key configured by your admin.</p>
        <Button className="mt-4" variant="outline" onClick={() => toast.info("No notification preferences to update yet.")}>Manage</Button>
      </div>
    </div>
  );
}

import { Save, Shield, AlertTriangle } from "lucide-react";

export function AdminSettingsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-black">Configure global system parameters</p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2.5 h-12 px-8 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* General Config */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border bg-muted/20">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Platform Configuration</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily Contribution Limit</label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="w-full h-12 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Maximum recordings per user per day to prevent spam.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initial Milestone (Hours)</label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="w-full h-12 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Goal for initial dataset release.</p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-500/80 font-medium">These settings affect all users globally. Changes are logged and audited.</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden opacity-50 pointer-events-none">
            <div className="p-8 border-b border-border bg-muted/20">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest text-muted-foreground italic">Advanced Access Control</h2>
            </div>
            <div className="p-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin management coming soon</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Admin Security</h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              You are currently logged in with **{import.meta.env.MODE}** privileges. Ensure your session is secure.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Auth Provider: Supabase
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Role: Super Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

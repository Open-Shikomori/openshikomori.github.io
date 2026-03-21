import { useEffect, useState } from "react";
import { Shield, ShieldPlus, Trash2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { useAdminAuth } from "../hooks/useAdminAuth";
import { listAdminUsers, listAdmins, removeAdmin, upsertAdmin } from "../services/adminData";

interface AdminRow {
  userId: string;
  email: string | null;
  displayName: string;
  role: "admin" | "superadmin";
  createdAt: string | null;
}

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
}

export function AdminAdminsPage() {
  const { admin } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [candidateId, setCandidateId] = useState("");
  const [candidateRole, setCandidateRole] = useState<"admin" | "superadmin">("admin");
  const [candidateOptions, setCandidateOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageAdmins = admin?.role === "superadmin";

  useEffect(() => {
    void loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    setError(null);
    try {
      const [adminRows, users] = await Promise.all([listAdmins(), listAdminUsers()]);
      setAdmins(adminRows);
      setCandidateOptions(
        users.map((user) => ({
          id: user.id,
          label: `${user.displayName} ${user.email ? `(${user.email})` : ""}`,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin access");
    } finally {
      setLoading(false);
    }
  }

  async function handleGrant() {
    if (!candidateId) return;
    setSubmitting(true);
    try {
      await upsertAdmin(candidateId, candidateRole);
      setCandidateId("");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update admin access");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this admin account?")) return;
    setSubmitting(true);
    try {
      await removeAdmin(userId);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove admin access");
    } finally {
      setSubmitting(false);
    }
  }

  const columns: ColumnDef<AdminRow>[] = [
    {
      accessorKey: "displayName",
      header: "Admin",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-foreground">{row.original.displayName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email || row.original.userId}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
          <Shield className="h-3 w-3" />
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Granted",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        canManageAdmins ? (
          <button
            onClick={() => void handleRemove(row.original.userId)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-3 text-[10px] font-black uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Remove
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Superadmin only</span>
        ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Access</h1>
        <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
          Manage who can operate the moderation and settings console
        </p>
      </div>

      {canManageAdmins ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <ShieldPlus className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Grant or Update Admin Access</h2>
              <p className="text-sm text-muted-foreground">Select an existing authenticated user and assign a role.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <select
              value={candidateId}
              onChange={(event) => setCandidateId(event.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-4"
            >
              <option value="">Select user</option>
              {candidateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={candidateRole}
              onChange={(event) => setCandidateRole(event.target.value as "admin" | "superadmin")}
              className="h-11 rounded-lg border border-input bg-background px-4"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <button
              onClick={() => void handleGrant()}
              disabled={!candidateId || submitting}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-[10px] font-black uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Grant access"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700">
          Only superadmins can grant or revoke admin access.
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center text-sm text-muted-foreground">
          Loading admin access...
        </div>
      ) : (
        <DataTable columns={columns} data={admins} searchKey="displayName" />
      )}
    </div>
  );
}

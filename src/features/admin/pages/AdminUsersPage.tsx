import { useEffect, useMemo, useState } from "react";
import { Edit3, Shield, UserRound } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { AdminUserEditorDialog } from "../components/AdminUserEditorDialog";
import { listAdminUsers, updateAdminUserProfile } from "../services/adminData";
import type { AdminUserRecord } from "@/types/admin";

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUser(payload: Parameters<typeof updateAdminUserProfile>[0]) {
    await updateAdminUserProfile(payload);
    await loadUsers();
  }

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.adminRole).length;
    const publicProfiles = users.filter((user) => user.isPublic).length;
    return { total: users.length, admins, publicProfiles };
  }, [users]);

  const columns: ColumnDef<AdminUserRecord>[] = [
    {
      accessorKey: "displayName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="min-w-[220px]">
            <p className="font-semibold text-foreground">{user.displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email || user.id}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "contributionCount",
      header: "Activity",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{user.contributionCount} total</p>
            <p>{user.recordingsCount} recordings • {user.correctionsCount} corrections</p>
          </div>
        );
      },
    },
    {
      accessorKey: "xpTotal",
      header: "XP",
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.xpTotal}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "adminRole",
      header: "Access",
      cell: ({ row }) =>
        row.original.adminRole ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            <Shield className="h-3 w-3" />
            {row.original.adminRole}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Standard</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => setEditingUser(row.original)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-3 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
        >
          <Edit3 className="mr-2 h-3.5 w-3.5" />
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
            Full authenticated user directory with profile and contribution visibility
          </p>
        </div>
        <button
          onClick={() => void loadUsers()}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total users", value: stats.total },
          { label: "Public profiles", value: stats.publicProfiles },
          { label: "Admins", value: stats.admins },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="inline-flex rounded-xl border border-border bg-muted/30 p-3">
              <UserRound className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center text-sm text-muted-foreground">
          Loading users...
        </div>
      ) : (
        <DataTable columns={columns} data={users} searchKey="displayName" />
      )}

      <AdminUserEditorDialog
        open={Boolean(editingUser)}
        user={editingUser}
        title="Edit user profile"
        description="Adjust visibility, contributor naming, and soft identity fields."
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}

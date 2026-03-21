import { useEffect, useState } from "react";
import { Edit3, Eye, Users2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { AdminUserEditorDialog } from "../components/AdminUserEditorDialog";
import { listAdminContributors, updateAdminUserProfile } from "../services/adminData";
import type { AdminUserRecord } from "@/types/admin";

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";
}

export function AdminContributorsPage() {
  const [contributors, setContributors] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContributor, setEditingContributor] = useState<AdminUserRecord | null>(null);

  useEffect(() => {
    void loadContributors();
  }, []);

  async function loadContributors() {
    setLoading(true);
    setError(null);
    try {
      setContributors(await listAdminContributors());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contributors");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveContributor(payload: Parameters<typeof updateAdminUserProfile>[0]) {
    await updateAdminUserProfile(payload);
    await loadContributors();
  }

  const columns: ColumnDef<AdminUserRecord>[] = [
    {
      accessorKey: "displayName",
      header: "Contributor",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-foreground">{row.original.displayName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email || row.original.id}</p>
        </div>
      ),
    },
    {
      accessorKey: "contributionCount",
      header: "Contribution mix",
      cell: ({ row }) => {
        const contributor = row.original;
        return (
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{contributor.contributionCount} total</p>
            <p>{contributor.recordingsCount} recordings • {contributor.correctionsCount} corrections • {contributor.reviewsCount} reviews</p>
          </div>
        );
      },
    },
    {
      accessorKey: "isPublic",
      header: "Visibility",
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
          row.original.isPublic
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-border bg-muted/30 text-muted-foreground"
        }`}>
          <Eye className="h-3 w-3" />
          {row.original.isPublic ? "Public" : "Private"}
        </span>
      ),
    },
    {
      accessorKey: "lastContributionDate",
      header: "Last activity",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.lastContributionDate)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => setEditingContributor(row.original)}
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contributors</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
            Manage public contributor visibility and community-facing identity
          </p>
        </div>
        <button
          onClick={() => void loadContributors()}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Users2 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{contributors.length} contributor records</h2>
            <p className="text-sm text-muted-foreground">
              Includes public profiles and users with recording, correction, or review activity.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center text-sm text-muted-foreground">
          Loading contributors...
        </div>
      ) : (
        <DataTable columns={columns} data={contributors} searchKey="displayName" />
      )}

      <AdminUserEditorDialog
        open={Boolean(editingContributor)}
        user={editingContributor}
        title="Edit contributor profile"
        description="Update how this contributor appears in public community surfaces."
        onOpenChange={(open) => {
          if (!open) setEditingContributor(null);
        }}
        onSave={handleSaveContributor}
      />
    </div>
  );
}

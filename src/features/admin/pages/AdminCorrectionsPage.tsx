import { useEffect, useState } from "react";
import { CheckSquare, Edit3 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { AdminCorrectionReviewDialog } from "../components/AdminCorrectionReviewDialog";
import { listAdminCorrections, reviewAdminCorrection } from "../services/adminData";
import type { AdminCorrectionRecord } from "@/types/admin";

function StatusBadge({ status }: { status: AdminCorrectionRecord["status"] }) {
  const tones =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "rejected"
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${tones}`}>
      {status}
    </span>
  );
}

export function AdminCorrectionsPage() {
  const [corrections, setCorrections] = useState<AdminCorrectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedCorrection, setSelectedCorrection] = useState<AdminCorrectionRecord | null>(null);

  useEffect(() => {
    void loadCorrections();
  }, [statusFilter]);

  async function loadCorrections() {
    setLoading(true);
    setError(null);
    try {
      setCorrections(await listAdminCorrections({ status: statusFilter }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load corrections");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(payload: Parameters<typeof reviewAdminCorrection>[0]) {
    await reviewAdminCorrection(payload);
    await loadCorrections();
  }

  const columns: ColumnDef<AdminCorrectionRecord>[] = [
    {
      accessorKey: "suggestedText",
      header: "Correction",
      cell: ({ row }) => (
        <div className="min-w-[280px] space-y-2">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original</p>
            <p className="mt-2 text-sm text-muted-foreground">{row.original.originalText}</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Suggested</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{row.original.suggestedText}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "suggesterName",
      header: "Contributor",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{row.original.suggesterName}</p>
          <p className="capitalize">
            {row.original.clipLanguage || "Unknown"}
            {row.original.clipDialect ? ` • ${row.original.clipDialect}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-2">
          <StatusBadge status={row.original.status} />
          {row.original.reviewNote ? (
            <p className="max-w-48 text-xs text-muted-foreground">{row.original.reviewNote}</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedCorrection(row.original)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-3 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
        >
          <Edit3 className="mr-2 h-3.5 w-3.5" />
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Correction Review</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
            Approve or reject transcription improvements with an audit trail
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="h-11 rounded-lg border border-input bg-background px-4 text-[10px] font-black uppercase tracking-widest"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => void loadCorrections()}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{corrections.length} correction records</h2>
            <p className="text-sm text-muted-foreground">
              Each decision now supports reviewer notes and clip transcription versioning.
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
          Loading corrections...
        </div>
      ) : (
        <DataTable columns={columns} data={corrections} searchKey="suggestedText" />
      )}

      <AdminCorrectionReviewDialog
        open={Boolean(selectedCorrection)}
        correction={selectedCorrection}
        onOpenChange={(open) => {
          if (!open) setSelectedCorrection(null);
        }}
        onReview={handleReview}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Edit3, PlayCircle, Waves } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { AdminClipEditorDialog } from "../components/AdminClipEditorDialog";
import { listAdminClips, updateAdminClip } from "../services/adminData";
import type { AdminClipRecord } from "@/types/admin";

function StatusBadge({ status }: { status: AdminClipRecord["status"] }) {
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

export function AdminClipsPage() {
  const [clips, setClips] = useState<AdminClipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [editingClip, setEditingClip] = useState<AdminClipRecord | null>(null);

  useEffect(() => {
    void loadClips();
  }, [statusFilter, languageFilter]);

  async function loadClips() {
    setLoading(true);
    setError(null);
    try {
      setClips(
        await listAdminClips({
          status: statusFilter,
          language: languageFilter,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clips");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveClip(payload: Parameters<typeof updateAdminClip>[0]) {
    await updateAdminClip(payload);
    await loadClips();
  }

  const languages = Array.from(new Set(clips.map((clip) => clip.language))).sort();

  const columns: ColumnDef<AdminClipRecord>[] = [
    {
      accessorKey: "transcription",
      header: "Clip",
      cell: ({ row }) => {
        const clip = row.original;
        return (
          <div className="min-w-[260px]">
            <p className="font-semibold text-foreground">{clip.transcription}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {clip.contributorName} • {Math.round(clip.duration)}s
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold capitalize text-foreground">{row.original.language}</p>
          <p>{row.original.dialect || "No dialect"}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-2">
          <StatusBadge status={row.original.status} />
          {row.original.isDuplicate ? (
            <p className="text-[10px] uppercase tracking-widest text-destructive">Duplicate flagged</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "correctionCount",
      header: "Corrections",
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.correctionCount}</span>,
    },
    {
      id: "audio",
      header: "Audio",
      cell: ({ row }) => (
        <audio controls className="w-52" src={row.original.audioUrl}>
          <PlayCircle className="h-4 w-4" />
        </audio>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => setEditingClip(row.original)}
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clip Moderation</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
            Review raw recordings, final transcripts, and duplicate flags
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
          <select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-4 text-[10px] font-black uppercase tracking-widest"
          >
            <option value="all">All languages</option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <button
            onClick={() => void loadClips()}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Waves className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{clips.length} clips in scope</h2>
            <p className="text-sm text-muted-foreground">
              Filter by moderation state or language, then open a clip to update transcript and status.
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
          Loading clips...
        </div>
      ) : (
        <DataTable columns={columns} data={clips} searchKey="transcription" />
      )}

      <AdminClipEditorDialog
        open={Boolean(editingClip)}
        clip={editingClip}
        onOpenChange={(open) => {
          if (!open) setEditingClip(null);
        }}
        onSave={handleSaveClip}
      />
    </div>
  );
}

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import type { AdminClipRecord } from "@/types/admin";

function getHistoryText(entry: AdminClipRecord["transcriptionHistory"][number]) {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    return String(entry.text || "");
  }

  return String(entry ?? "");
}

function getHistorySource(entry: AdminClipRecord["transcriptionHistory"][number]) {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    return String(entry.source || "unknown");
  }

  return "unknown";
}

interface AdminClipEditorDialogProps {
  open: boolean;
  clip: AdminClipRecord | null;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    clipId: string;
    status: AdminClipRecord["status"];
    transcription: string;
    isDuplicate: boolean;
  }) => Promise<void>;
}

export function AdminClipEditorDialog({
  open,
  clip,
  onOpenChange,
  onSave,
}: AdminClipEditorDialogProps) {
  const [status, setStatus] = useState<AdminClipRecord["status"]>("pending");
  const [transcription, setTranscription] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clip) return;
    setStatus(clip.status);
    setTranscription(clip.transcription);
    setIsDuplicate(clip.isDuplicate);
  }, [clip]);

  async function handleSave() {
    if (!clip) return;
    setSaving(true);
    try {
      await onSave({
        clipId: clip.id,
        status,
        transcription: transcription.trim(),
        isDuplicate,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review clip</DialogTitle>
          <DialogDescription>
            Update moderation status, flag duplicates, and correct the final transcription.
          </DialogDescription>
        </DialogHeader>

        {clip ? (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contributor</p>
                <p className="mt-1 text-sm font-semibold">{clip.contributorName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Language</p>
                <p className="mt-1 text-sm font-semibold capitalize">
                  {clip.language}
                  {clip.dialect ? ` • ${clip.dialect}` : ""}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-semibold">{Math.round(clip.duration)}s</p>
              </div>
            </div>

            <audio controls className="w-full" src={clip.audioUrl}>
              Your browser does not support audio playback.
            </audio>

            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <label className="space-y-2 text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as AdminClipRecord["status"])}
                  className="h-11 w-full rounded-lg border border-input bg-background px-4"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Duplicate clip</p>
                  <p className="text-xs text-muted-foreground">Mark this when the recording duplicates existing approved content.</p>
                </div>
                <Switch checked={isDuplicate} onCheckedChange={setIsDuplicate} />
              </div>
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Final transcription
              </span>
              <textarea
                value={transcription}
                onChange={(event) => setTranscription(event.target.value)}
                className="min-h-40 w-full rounded-xl border border-input bg-background px-4 py-3"
              />
            </label>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transcription versions</p>
              <div className="mt-3 max-h-48 space-y-3 overflow-y-auto">
                {clip.transcriptionHistory.length > 0 ? (
                  clip.transcriptionHistory.map((entry, index) => (
                    <div key={`${clip.id}-${index}`} className="rounded-lg border border-border bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-foreground">{getHistoryText(entry)}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {getHistorySource(entry)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transcription history recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!clip || saving || !transcription.trim()}>
            {saving ? "Saving..." : "Save moderation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

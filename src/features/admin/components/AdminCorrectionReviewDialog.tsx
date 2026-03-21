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

import type { AdminCorrectionRecord } from "@/types/admin";

interface AdminCorrectionReviewDialogProps {
  open: boolean;
  correction: AdminCorrectionRecord | null;
  onOpenChange: (open: boolean) => void;
  onReview: (payload: {
    correctionId: string;
    decision: "approved" | "rejected";
    reviewNote?: string;
  }) => Promise<void>;
}

export function AdminCorrectionReviewDialog({
  open,
  correction,
  onOpenChange,
  onReview,
}: AdminCorrectionReviewDialogProps) {
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    setReviewNote(correction?.reviewNote || "");
  }, [correction]);

  async function handleReview(decision: "approved" | "rejected") {
    if (!correction) return;
    setSaving(decision);
    try {
      await onReview({
        correctionId: correction.id,
        decision,
        reviewNote: reviewNote.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review correction</DialogTitle>
          <DialogDescription>
            Compare the original transcript with the proposed correction before updating the clip.
          </DialogDescription>
        </DialogHeader>

        {correction ? (
          <div className="space-y-6">
            {correction.audioUrl ? (
              <audio controls className="w-full" src={correction.audioUrl}>
                Your browser does not support audio playback.
              </audio>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original</p>
                <p className="mt-3 text-sm text-muted-foreground">{correction.originalText}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Suggested</p>
                <p className="mt-3 text-sm font-semibold text-foreground">{correction.suggestedText}</p>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contributor</p>
                <p className="mt-1 text-sm font-semibold">{correction.suggesterName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Language</p>
                <p className="mt-1 text-sm font-semibold capitalize">
                  {correction.clipLanguage || "Unknown"}
                  {correction.clipDialect ? ` • ${correction.clipDialect}` : ""}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold capitalize">{correction.status}</p>
              </div>
            </div>

            <label className="space-y-2 text-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Review note
              </span>
              <textarea
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                className="min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3"
                placeholder="Explain why this correction is approved or rejected."
              />
            </label>
          </div>
        ) : null}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving !== null}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleReview("rejected")}
              disabled={!correction || saving !== null}
            >
              {saving === "rejected" ? "Rejecting..." : "Reject"}
            </Button>
            <Button onClick={() => handleReview("approved")} disabled={!correction || saving !== null}>
              {saving === "approved" ? "Approving..." : "Approve"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

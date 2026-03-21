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
import { avatarOptions, getAvatarById } from "@/features/contribution/data/avatars";

import type { AdminUserRecord } from "@/types/admin";

interface AdminUserEditorDialogProps {
  open: boolean;
  user: AdminUserRecord | null;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    userId: string;
    displayName: string;
    avatar: string;
    homeIsland: string | null;
    isPublic: boolean;
  }) => Promise<void>;
}

export function AdminUserEditorDialog({
  open,
  user,
  title,
  description,
  onOpenChange,
  onSave,
}: AdminUserEditorDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(avatarOptions[0]?.id || "");
  const [homeIsland, setHomeIsland] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setAvatar(user.avatar || avatarOptions[0]?.id || "");
    setHomeIsland(user.homeIsland || "");
    setIsPublic(user.isPublic);
  }, [user]);

  const avatarMeta = getAvatarById(avatar);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await onSave({
        userId: user.id,
        displayName: displayName.trim(),
        avatar,
        homeIsland: homeIsland.trim() || null,
        isPublic,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: avatarMeta?.bgColor || "var(--muted)" }}
            >
              {avatarMeta?.emoji || "?"}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                {displayName || user?.email || "Unnamed user"}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email || user?.id}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Display name
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4"
                placeholder="Contributor name"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Home island
              </span>
              <input
                value={homeIsland}
                onChange={(event) => setHomeIsland(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4"
                placeholder="Ngazidja, Ndzuwani..."
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Avatar
            </span>
            <select
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-4"
            >
              {avatarOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Public contributor profile</p>
              <p className="text-xs text-muted-foreground">
                Toggle whether this user appears in public community surfaces.
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !user}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../contribution/services/supabase';
import { avatarOptions } from '../../contribution/data/avatars';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';

interface Contributor {
  id: string;
  displayName: string;
  avatar: string;
  contributionCount: number;
  isPublic: boolean;
  createdAt: string;
}

export function AdminContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    if (!supabase) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_public', true)
      .order('contribution_count', { ascending: false });

    if (!error && data) {
      setContributors((data as any[]).map(row => ({
        id: row.id,
        displayName: row.display_name || 'Unknown',
        avatar: row.avatar || '👤',
        contributionCount: row.contribution_count || 0,
        isPublic: !!row.is_public,
        createdAt: row.created_at || new Date().toISOString(),
      } as Contributor)));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contributor?')) return;

    if (!supabase) return;
    await supabase.from('users').delete().eq('id', id);
    fetchContributors();
  };

  const handleSave = async (contributor: Partial<Contributor>) => {
    if (!supabase) return;

    if (contributor.id) {
      // Update
      await (supabase.from('users').update({
        display_name: contributor.displayName,
        avatar: contributor.avatar,
        contribution_count: contributor.contributionCount,
        is_public: contributor.isPublic,
      } as any).eq('id', contributor.id) as any);
    } else {
      // Create - requires auth user first, so this is simplified
      alert('Creating new contributors requires Supabase Auth. Use the invite feature instead.');
    }

    setShowAddModal(false);
    setEditingContributor(null);
    fetchContributors();
  };

  const columns: ColumnDef<Contributor>[] = [
    {
      accessorKey: "displayName",
      header: "Contributor",
      cell: ({ row }) => {
        const contributor = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-xl bg-muted border border-border group-hover:scale-110 transition-transform">
              {contributor.avatar}
            </div>
            <div>
              <span className="font-bold text-sm text-foreground uppercase tracking-tight">{contributor.displayName}</span>
              <p className="text-[10px] text-muted-foreground font-mono opacity-50">ID: {contributor.id.slice(0, 8)}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contributionCount",
      header: "Contributions",
      cell: ({ row }) => (
        <span className="text-sm font-bold text-foreground">{row.getValue("contributionCount")}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      accessorKey: "isPublic",
      header: "Status",
      cell: () => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1.5" />
          Public
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const contributor = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingContributor(contributor)}
              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(contributor.id)}
              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Contributors</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-black">Manage public contributors and their profiles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Contributor
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading contributors...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={contributors} 
          searchKey="displayName"
        />
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingContributor) && (
        <ContributorModal
          contributor={editingContributor}
          onClose={() => {
            setShowAddModal(false);
            setEditingContributor(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface ContributorModalProps {
  contributor: Contributor | null;
  onClose: () => void;
  onSave: (contributor: Partial<Contributor>) => void;
}

function ContributorModal({ contributor, onClose, onSave }: ContributorModalProps) {
  const [displayName, setDisplayName] = useState(contributor?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(contributor?.avatar || avatarOptions[0]?.id || '👤');
  const [contributionCount, setContributionCount] = useState(contributor?.contributionCount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: contributor?.id,
      displayName,
      avatar: selectedAvatar,
      contributionCount,
      isPublic: true,
    });
  };

  const selectedAvatarData = avatarOptions.find(a => a.id === selectedAvatar);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground tracking-tight italic">
            {contributor ? 'Edit Profile' : 'New Contributor'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="flex flex-col items-center p-6 bg-muted/30 rounded-xl border border-dashed border-border">
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner"
              style={{ backgroundColor: selectedAvatarData?.bgColor || 'var(--muted)' }}
            >
              {selectedAvatarData?.emoji || '👤'}
            </div>
            <p className="font-bold text-foreground uppercase tracking-tight">{displayName || 'Anonymous'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Preview</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
                placeholder="Enter name..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avatar Choice</label>
              <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-3 bg-muted/20 rounded-xl border border-border custom-scrollbar">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`h-11 w-11 rounded-full flex items-center justify-center text-xl transition-all ${
                      selectedAvatar === avatar.id ? 'ring-2 ring-primary ring-offset-4 ring-offset-background scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: avatar.bgColor }}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contribution Score</label>
              <input
                type="number"
                min={0}
                value={contributionCount}
                onChange={(e) => setContributionCount(parseInt(e.target.value) || 0)}
                className="w-full h-12 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 border border-border rounded-lg text-xs font-black uppercase tracking-widest hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-14 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../contribution/services/supabase';
import type { Clip } from '../../contribution/types';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';

export function AdminClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchClips();
  }, [statusFilter]);

  const fetchClips = async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await (query.limit(100) as any);

    if (error) {
      console.error('Error fetching clips:', error);
    } else {
      setClips((data || []).map((row: any) => ({
        id: row.id,
        audioUrl: row.audio_url,
        duration: row.duration,
        language: row.language,
        dialect: row.dialect,
        transcription: { text: row.transcription, source: 'manual' },
        contributedBy: row.contributed_by,
        contributedAt: new Date(row.created_at),
        status: row.status,
        correctionsCount: row.correction_count,
        isDuplicate: row.is_duplicate,
        isAnonymous: false,
      } as Clip)));
    }

    setLoading(false);
  };

  const handleStatusChange = async (clipId: string, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;

    const { error } = await (supabase
      .from('clips')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() } as any)
      .eq('id', clipId) as any);

    if (!error) {
      fetchClips();
    }
  };

  const columns: ColumnDef<Clip>[] = [
    {
      accessorKey: "audioUrl",
      header: "Audio",
      cell: ({ row }) => {
        const clip = row.original;
        return (
          <button className="flex items-center gap-3 text-primary font-bold transition-transform hover:scale-105">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-4 w-4" fill="currentColor" />
            </div>
            <span className="text-xs uppercase tracking-widest font-black">{Math.round(clip.duration)}s</span>
          </button>
        );
      },
    },
    {
      id: "transcription",
      accessorFn: (row) => row.transcription.text,
      header: "Transcription",
      cell: ({ row }) => {
        const text = row.original.transcription.text;
        const id = row.original.id;
        return (
          <div>
            <p className="text-sm text-foreground font-medium max-w-xs truncate" title={text}>
              {text}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-50">ID: {id.slice(0, 8)}...</p>
          </div>
        );
      },
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-foreground border border-border">
          {row.getValue("language")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
            status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
            'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const clip = row.original;
        if (clip.status !== 'pending') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Reviewed</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusChange(clip.id, 'approved')}
              className="h-10 w-10 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all border border-green-500/20"
              title="Approve"
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleStatusChange(clip.id, 'rejected')}
              className="h-10 w-10 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white rounded-lg transition-all border border-destructive/20"
              title="Reject"
            >
              <XCircle className="h-5 w-5" />
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Clips</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-black">Manage audio contributions</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-12 px-4 rounded-lg border border-input bg-card text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading clips...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={clips} 
          searchKey="transcription"
        />
      )}
    </div>
  );
}

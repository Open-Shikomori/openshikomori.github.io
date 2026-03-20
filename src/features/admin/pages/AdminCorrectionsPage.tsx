import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../contribution/services/supabase';
import { reviewCorrection } from '../../contribution/services/clips';
import type { Correction } from '../../contribution/types';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';

export function AdminCorrectionsPage() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { admin } = useAdminAuth();

  useEffect(() => {
    fetchCorrections();
  }, [statusFilter]);

  const fetchCorrections = async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from('corrections')
      .select('*, clip:clips(audio_url)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await (query.limit(100) as any);

    if (error) {
      console.error('Error fetching corrections:', error);
    } else {
      setCorrections((data || []).map((row: any) => ({
        id: row.id,
        clipId: row.clip_id,
        originalText: row.original_text,
        suggestedText: row.suggested_text,
        suggestedBy: row.suggested_by,
        suggestedAt: row.created_at ? new Date(row.created_at) : null,
        status: row.status,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
        reviewNote: row.review_note,
        // Join data
        audioUrl: row.clip?.audio_url,
      } as Correction & { audioUrl?: string })));
    }

    setLoading(false);
  };

  const handleReview = async (correctionId: string, decision: 'approved' | 'rejected') => {
    if (!admin) return;

    try {
      await reviewCorrection(correctionId, decision, admin.id);
      fetchCorrections();
    } catch (error) {
      console.error('Error reviewing correction:', error);
      alert('Failed to update correction. Check permissions or network.');
    }
  };

  const columns: ColumnDef<Correction & { audioUrl?: string }>[] = [
    {
      id: "suggestion",
      header: "Comparison",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="p-3 bg-muted/20 rounded-lg border border-border">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Original</p>
              <p className="text-xs text-muted-foreground/60 line-through decoration-destructive/30">{c.originalText}</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Suggested</p>
              <p className="text-xs font-bold text-foreground">{c.suggestedText}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "suggestedAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("suggestedAt") as Date;
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {date?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        );
      },
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
        const c = row.original;
        if (c.status !== 'pending') {
          return <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Reviewed</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReview(c.id, 'approved')}
              className="h-10 px-4 flex items-center justify-center gap-2 bg-foreground text-background rounded-lg hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => handleReview(c.id, 'rejected')}
              className="h-10 w-10 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white rounded-lg transition-all border border-destructive/20"
              title="Reject"
            >
              <XCircle className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Corrections</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-black">Review user-submitted transcription improvements</p>
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
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading corrections...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={corrections} 
          searchKey="suggestion" // Custom search would need to be implemented in DataTable or use accessorKey
        />
      )}
    </div>
  );
}

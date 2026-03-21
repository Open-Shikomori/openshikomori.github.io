import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, AlertCircle, Loader2, CheckCircle, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin, useAdminReview } from '../hooks/useContributions';
import { isSupabaseConfigured } from '../services/supabase';
import type { Correction } from '@/types/contribution';

export function ReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.uid);
  const { corrections, loading: correctionsLoading, error, reviewCorrection } = useAdminReview(user?.uid);

  const loading = authLoading || adminLoading || correctionsLoading;

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h1 className="font-semibold mb-1">System not configured</h1>
          <p className="text-sm text-muted-foreground">
            Firebase environment variables are missing.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. This area is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Review | OpenShikomori</title>
        <meta name="description" content="Admin review page for contribution moderation." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-primary uppercase tracking-wide">
                Admin
              </p>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Review Corrections
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve transcription corrections submitted by contributors.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {corrections.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-medium">No pending corrections</h2>
              <p className="text-muted-foreground mt-1">
                All corrections have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {corrections.length} pending correction{corrections.length !== 1 ? 's' : ''}
              </p>

              {corrections.map((correction) => (
                <CorrectionCard
                  key={correction.id}
                  correction={correction}
                  onReview={reviewCorrection}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface CorrectionCardProps {
  correction: Correction;
  onReview: (id: string, decision: 'approved' | 'rejected') => Promise<boolean>;
}

function CorrectionCard({ correction, onReview }: CorrectionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const handleReview = async (decision: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    const success = await onReview(correction.id, decision);
    if (success) {
      setReviewed(true);
    }
    setIsSubmitting(false);
  };

  if (reviewed) {
    return (
      <div className="p-6 border border-border rounded-lg opacity-50">
        <p className="text-center text-muted-foreground">Reviewed</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6 space-y-4">
      {/* Audio placeholder - would fetch clip details */}
      <div className="p-4 bg-muted/50 rounded">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
          Clip ID: {correction.clipId}
        </p>
        <p className="text-sm text-muted-foreground">
          (Audio player would load here)
        </p>
      </div>

      {/* Original vs Suggested */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-muted/30 rounded border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Original
          </p>
          <p className="text-sm">{correction.originalText}</p>
        </div>
        <div className="p-4 bg-primary/5 rounded border border-primary/20">
          <p className="text-xs text-primary uppercase tracking-wide mb-2">
            Suggested
          </p>
          <p className="text-sm">{correction.suggestedText}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleReview('rejected')}
          disabled={isSubmitting}
          className="flex-1 h-10 px-4 border border-destructive text-destructive font-medium rounded hover:bg-destructive/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Reject
        </button>
        <button
          type="button"
          onClick={() => handleReview('approved')}
          disabled={isSubmitting}
          className="flex-1 h-10 px-4 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
      </div>
    </div>
  );
}

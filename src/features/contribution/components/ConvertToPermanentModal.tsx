import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import {
  ResponsiveModal,
  ResponsiveModalContainer,
  ResponsiveModalScrollable,
} from './ResponsiveModal';

interface ConvertToPermanentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (email: string, password: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
  onSuccess?: () => void;
}

export function ConvertToPermanentModal({
  isOpen,
  onClose,
  onConvert,
  isLoading = false,
  error,
  onSuccess,
}: ConvertToPermanentModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const success = await onConvert(email.trim(), password.trim());
    if (success) {
      setStep('success');
      onSuccess?.();
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setStep('form');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  if (step === 'success') {
    return (
      <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
        <div className="bg-card px-4 py-8 text-center sm:px-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('auth.convertModal.successTitle')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('auth.convertModal.successMessage')}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('auth.convertModal.continue')}
          </button>
        </div>
      </ResponsiveModal>
    );
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalContainer className="relative bg-card">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="sr-only">{t('auth.entryModal.closeAria')}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="border-b border-border px-4 py-5 text-center sm:px-6 sm:py-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('auth.convertModal.title')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('auth.convertModal.subtitle')}
          </p>
        </div>

        <ResponsiveModalScrollable className="px-4 py-4 sm:px-6 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-4 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="convert-email" className="text-sm font-medium">
                {t('auth.convertModal.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="convert-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.convertModal.emailPlaceholder')}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="convert-password" className="text-sm font-medium">
                {t('auth.convertModal.passwordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="convert-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.convertModal.passwordPlaceholder')}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">{t('auth.convertModal.passwordHint')}</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('auth.convertModal.creating')}
                </>
              ) : (
                <>
                  {t('auth.convertModal.submitButton')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full h-11 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('auth.convertModal.cancel')}
            </button>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {t('auth.convertModal.footerInfo')}
              </p>
            </div>
          </form>
        </ResponsiveModalScrollable>
      </ResponsiveModalContainer>
    </ResponsiveModal>
  );
}

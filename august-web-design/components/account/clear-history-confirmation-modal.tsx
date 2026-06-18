'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import { resetUser } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import { disconnectWebPubSub } from '@/services/webpubsub-service';
import { fetchChatHistory } from '@/services/chat-service';
import { clearAllPHI } from '@/utils/clear-phi';

interface ClearHistoryConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCleared?: () => void;
}

export function ClearHistoryConfirmationModal({
  open,
  onOpenChange,
  onCleared,
}: ClearHistoryConfirmationModalProps) {
  const { t, i18n } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = () => {
    if (busy) return;
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (busy) return;
    setErrorMessage(null);
    setBusy(true);
    track('clear_chat_history_confirmed');
    trackClevertap('Chat History Cleared', {});

    try {
      const result = await resetUser(i18n.language || 'en');
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to clear chat history.');
        setBusy(false);
        return;
      }

      if (result.accessToken) {
        useAuthStore.getState().setAccessToken(result.accessToken);
      }
      if (result.user) {
        useAuthStore.getState().setUser(result.user);
      }
      clearAllPHI();

      try {
        await disconnectWebPubSub();
      } catch {
        // best-effort — the new WPS connection will boot from chat-container
      }

      onOpenChange(false);
      onCleared?.();
      router.push('/chat');

      setTimeout(() => {
        void fetchChatHistory().catch(() => {});
      }, 300);
    } catch (error) {
      setErrorMessage(
        (error as Error)?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="max-w-sm rounded-3xl p-6" showCloseButton={!busy}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {t('account.clearHistory.confirmTitle', {
              defaultValue: 'Clear your chat history?',
            })}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t('account.clearHistory.confirmDescription', {
              defaultValue:
                'Clearing history removes your chats from August across all devices. This action cannot be undone.',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t('account.clearHistory.whatWillBeCleared', {
              defaultValue: 'What will be cleared',
            })}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc pl-5">
            <li>
              {t('account.clearHistory.bullet1', {
                defaultValue: 'All chat messages and replies',
              })}
            </li>
            <li>
              {t('account.clearHistory.bullet2', {
                defaultValue: 'Chat attachments shared in conversations (photos, PDFs, reports sent in chat)',
              })}
            </li>
            <li>
              {t('account.clearHistory.bullet3', {
                defaultValue: 'All memory tied to those chats',
              })}
            </li>
          </ul>
        </div>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={busy}
            className="flex-1 h-12 rounded-full text-gray-900 font-semibold border-gray-300 hover:bg-[#EDEBE5]"
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={busy}
            className="flex-1 h-12 rounded-full bg-[#206E55] text-white font-semibold hover:bg-[#185544]"
          >
            {busy
              ? t('account.clearHistory.clearing', {
                  defaultValue: 'Clearing…',
                })
              : t('account.clearHistory.confirmButton', {
                  defaultValue: 'Confirm Deletion',
                })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

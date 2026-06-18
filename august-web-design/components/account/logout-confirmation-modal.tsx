'use client';

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

interface LogoutConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmationModalProps) {
  const { t } = useI18n();

  const handleCancel = () => {
    track('logout_cancelled');
    onOpenChange(false);
  };

  const handleConfirm = () => {
    track('logout_confirmed');
    trackClevertap('Logout Button clicked', { souce: 'settings' });
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs rounded-3xl p-6 text-center" showCloseButton={false}>
        <DialogHeader className="items-center">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {t('account.logoutConfirm.message')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('account.logoutConfirm.message')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-12 rounded-full text-gray-900 font-semibold border-gray-300 hover:bg-[#EDEBE5]"
          >
            {t('account.logoutConfirm.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-full bg-[#206E55] text-white font-semibold hover:bg-[#185544]"
          >
            {t('account.logoutConfirm.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


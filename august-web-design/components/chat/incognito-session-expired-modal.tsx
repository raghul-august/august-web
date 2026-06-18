'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers';

interface IncognitoSessionExpiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function IncognitoSessionExpiredModal({
  open,
  onClose,
}: IncognitoSessionExpiredModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[340px]"
        style={{ borderRadius: '24px' }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('chat.incognito.sessionExpiredTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('chat.incognito.sessionExpiredDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full rounded-full"
            style={{ backgroundColor: '#206E55' }}
          >
            {t('common.back')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

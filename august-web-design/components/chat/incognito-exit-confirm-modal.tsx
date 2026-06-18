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

interface IncognitoExitConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function IncognitoExitConfirmModal({
  open,
  onCancel,
  onConfirm,
}: IncognitoExitConfirmModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[340px]"
        style={{ borderRadius: '24px' }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('chat.incognito.exitConfirmTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('chat.incognito.exitConfirmDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={onConfirm}
            className="w-full rounded-full"
            style={{ backgroundColor: '#206E55' }}
          >
            {t('chat.incognito.exitConfirmButton')}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full rounded-full"
          >
            {t('common.back')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers';
import { updateUserProfile } from '@/services/user-service';
import { track } from '@/services/analytics-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  isPhoneUser: boolean;
  primaryContact: string;
  initialAlternativeContact: string;
  onSave: (name: string, alternativeContact: string) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  initialName,
  isPhoneUser,
  primaryContact,
  initialAlternativeContact,
  onSave,
}: EditProfileModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [alternativeContact, setAlternativeContact] = useState(initialAlternativeContact);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setAlternativeContact(initialAlternativeContact);
    }
  }, [open, initialName, initialAlternativeContact]);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      track('profile_save_tapped');

      await updateUserProfile(name, alternativeContact, isPhoneUser);

      track('profile_saved', {
        has_name: Boolean(name),
        has_alternative_contact: Boolean(alternativeContact),
      });

      onSave(name, alternativeContact);
      onOpenChange(false);
    } catch (error) {
      logger.error('Failed to save profile', serializeError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    track('profile_cancel_tapped');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {t('account.editProfileModal.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('account.editProfileModal.title')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Avatar placeholder */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <span className="text-2xl font-semibold text-[#206E55]">
                {getInitials(name || primaryContact)}
              </span>
            </div>
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('account.editProfileModal.name')}
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('account.editProfileModal.namePlaceholder')}
              className="h-12 rounded-xl border-gray-200 focus:border-[#206E55] focus:ring-[#206E55]"
            />
          </div>

          {/* Primary contact (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {isPhoneUser
                ? t('account.editProfileModal.phone')
                : t('account.editProfileModal.email')}
            </label>
            <Input
              type={isPhoneUser ? 'tel' : 'email'}
              value={primaryContact}
              disabled
              className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-500"
            />
          </div>

          {/* Alternative contact (editable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {isPhoneUser
                ? t('account.editProfileModal.email')
                : t('account.editProfileModal.phone')}
            </label>
            <Input
              type={isPhoneUser ? 'email' : 'tel'}
              value={alternativeContact}
              onChange={(e) => setAlternativeContact(e.target.value)}
              placeholder={
                isPhoneUser
                  ? t('account.editProfileModal.emailPlaceholder')
                  : t('account.editProfileModal.phonePlaceholder')
              }
              className="h-12 rounded-xl border-gray-200 focus:border-[#206E55] focus:ring-[#206E55]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-[#206E55] text-white font-semibold hover:bg-[#185544]"
          >
            {isSaving
              ? t('account.editProfileModal.saving')
              : t('account.editProfileModal.save')}
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full h-12 rounded-xl text-gray-600 font-medium hover:bg-[#EDEBE5]"
          >
            {t('account.editProfileModal.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name: string): string {
  if (!name) return 'AU';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

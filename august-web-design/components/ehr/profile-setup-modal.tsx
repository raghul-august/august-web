'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { RELATION_PRESETS } from '@/types/ehr';

const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
] as const;

export type ProfileSetupValues = {
  name: string;
  /** Empty string in self mode (relationship is implicit). */
  relationship: string;
  /** Empty string when user skipped. Sent as undefined to the API. */
  age: string;
  sex: string;
};

interface Props {
  open: boolean;
  /** 'self-required' captures the user's own profile (no relationship picker).
   *  'family' adds the relationship picker and asks for a family member.
   *  Whether the modal can be closed without saving is controlled by the
   *  separate `dismissable` flag. */
  mode: 'self-required' | 'family';
  /** Prefill for re-edit cases. */
  initial?: Partial<ProfileSetupValues>;
  onSubmit: (values: ProfileSetupValues) => Promise<void>;
  /** Required when `dismissable` is true; called from the X, Cancel, or
   *  backdrop click. */
  onClose?: () => void;
  /** If true, the user can close without saving. 'family' mode is always
   *  dismissable. 'self-required' is dismissable only when this is set —
   *  used by the action-gated flow (Connect / Upload) where cancelling
   *  drops the pending action. */
  dismissable?: boolean;
}

/**
 * Captures name + relationship (family only) + age + sex for a profile.
 * Used as the first-run gate to force the user to identify themselves
 * before they can interact with the health dashboard, and reusable for
 * adding a family member with the full data set.
 *
 * Sex is required because biomarker reference ranges are sex-sensitive
 * and showing wrong-sex ranges is the failure mode that prompted this
 * work. Age is optional — some users won't share it on first use.
 */
export function ProfileSetupModal({ open, mode, initial, onSubmit, onClose, dismissable: dismissableProp }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [relationship, setRelationship] = useState(initial?.relationship ?? '');
  const [age, setAge] = useState(initial?.age ?? '');
  const [sex, setSex] = useState(initial?.sex ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on (re)open so a closed-then-reopened modal isn't stale.
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setRelationship(initial?.relationship ?? '');
      setAge(initial?.age ?? '');
      setSex(initial?.sex ?? '');
      setError(null);
    }
  }, [open, initial?.name, initial?.relationship, initial?.age, initial?.sex]);

  if (!open) return null;

  const requiresRelationship = mode === 'family';
  // 'family' is always dismissable. 'self-required' is dismissable only
  // when the caller opts in via the prop — covers the action-gated flow
  // (Connect / Upload) where cancelling drops the pending action.
  const dismissable = !!onClose && (mode === 'family' || dismissableProp === true);
  const canSubmit =
    name.trim().length > 0 &&
    sex.length > 0 &&
    (!requiresRelationship || relationship.length > 0) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        relationship: requiresRelationship ? relationship : '',
        age: age.trim(),
        sex,
      });
    } catch (err) {
      setError('Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismissable ? onClose : undefined}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-[#141515]">
              {mode === 'self-required' ? 'Tell us about yourself' : 'Add family member'}
            </h3>
            <p className="text-[12px] text-[#6B7370] mt-0.5">
              {mode === 'self-required'
                ? 'We use this to organize your reports and to keep family members’ records separate. You can connect EHRs or upload reports for yourself or family.'
                : 'Their reports will be kept separate from yours.'}
            </p>
          </div>
          {dismissable && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {requiresRelationship && (
            <div>
              <label className="text-sm font-medium text-[#141515] mb-2 block">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {RELATION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setRelationship(preset.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      relationship === preset.value
                        ? 'bg-[#206E55] text-white'
                        : 'bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="profile-name" className="text-sm font-medium text-[#141515] mb-2 block">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === 'self-required' ? 'Your name' : 'Their name'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#141515] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#206E55]/20 focus:border-[#206E55] transition-all"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="profile-age" className="text-sm font-medium text-[#141515] mb-2 block">
                Age <span className="text-[#8A9290] font-normal">(optional)</span>
              </label>
              <input
                id="profile-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="—"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#141515] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#206E55]/20 focus:border-[#206E55] transition-all"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[#141515] mb-2 block">Sex</span>
              <div className="flex gap-1.5">
                {SEX_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSex(opt.value)}
                    className={`flex-1 px-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sex === opt.value
                        ? 'bg-[#206E55] text-white'
                        : 'bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {dismissable && (
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            type="button"
            disabled={!canSubmit}
            className={`${dismissable ? 'flex-1' : 'w-full'} py-2.5 rounded-xl bg-[#206E55] text-white font-medium text-sm hover:bg-[#1a5a46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'self-required' ? 'Continue' : 'Add profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { RELATION_PRESETS } from '@/types/ehr';

interface AddPersonModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    relationship: string;
    age?: string;
    sex?: string;
  }) => Promise<void>;
}

/** Sex is implied by some relationships so we don't make the user pick it
 *  twice. Father / Son are male, Mother / Daughter female. Spouse and Other
 *  could be either, so those relationships keep the sex picker visible. */
const RELATIONSHIP_IMPLIED_SEX: Record<string, 'male' | 'female'> = {
  father: 'male',
  son: 'male',
  mother: 'female',
  daughter: 'female',
};

export function AddPersonModal({ open, onClose, onSubmit }: AddPersonModalProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const impliedSex = useMemo(() => RELATIONSHIP_IMPLIED_SEX[relationship], [relationship]);
  const effectiveSex = impliedSex ?? (sex || undefined);

  // Sex picker only renders when the relationship doesn't imply it.
  const needsSexPicker = relationship !== '' && !impliedSex;

  if (!open) return null;

  const canSubmit =
    name.trim().length > 0
    && relationship.length > 0
    && (!needsSexPicker || sex !== '')
    && !submitting;

  const reset = () => {
    setName('');
    setRelationship('');
    setAge('');
    setSex('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        relationship,
        age: age.trim() || undefined,
        sex: effectiveSex,
      });
      reset();
      onClose();
    } catch {
      setError('Failed to add person. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#141515]">Add Family Member</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Relationship */}
          <div>
            <label className="text-sm font-medium text-[#141515] mb-2 block">Relationship</label>
            <div className="flex flex-wrap gap-2">
              {RELATION_PRESETS.map((preset) => (
                <button
                  key={preset.value}
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

          {/* Sex — only when relationship doesn't imply it. Father/Son/Mother/
              Daughter set sex automatically so we don't double-ask. */}
          {needsSexPicker && (
            <div>
              <label className="text-sm font-medium text-[#141515] mb-2 block">Sex</label>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSex(option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                      sex === option
                        ? 'bg-[#206E55] text-white'
                        : 'bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name + Age on one row when space allows */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
            <div>
              <label htmlFor="person-name" className="text-sm font-medium text-[#141515] mb-2 block">
                Name
              </label>
              <input
                id="person-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter their name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#141515] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#206E55]/20 focus:border-[#206E55] transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="person-age" className="text-sm font-medium text-[#141515] mb-2 block">
                Age
              </label>
              <input
                id="person-age"
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="—"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#141515] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#206E55]/20 focus:border-[#206E55] transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-xl bg-[#206E55] text-white font-medium text-sm hover:bg-[#1a5a46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Person
          </button>
        </div>
      </div>
    </div>
  );
}

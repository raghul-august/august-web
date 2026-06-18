'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { PersonInfo } from '@/types/ehr';

interface Props {
  /** Full list of persons available to the authenticated user. */
  persons: PersonInfo[];
  /** Person id currently selected for THIS upload batch — may differ
   *  from the global selectedPersonId. */
  targetPersonId: string;
  /** Authenticated user's own id, so we can label self as "Self · Name". */
  userId: string;
  onChange: (personId: string) => void;
  onAddPerson?: () => void;
  /** Lock the picker once the batch is in flight so users can't change
   *  the target mid-upload. */
  disabled?: boolean;
}

function getDisplayName(person: PersonInfo, userId: string): string {
  if (person.person_id === userId || person.relationship === 'self') {
    return person.name ? `Self · ${person.name}` : 'Self';
  }
  if (person.name && person.relationship && person.relationship !== person.name) {
    return `${person.name} · ${person.relationship}`;
  }
  return person.name || person.relationship;
}

function getInitial(person: PersonInfo, userId: string): string {
  const source = person.name || person.relationship || (person.person_id === userId ? 'Self' : '');
  return (source.trim().charAt(0) || '·').toUpperCase();
}

/**
 * Compact row above the dropzone showing which person an upload will be
 * attached to. The control is the last chance to catch a wrong-profile
 * upload before files leave the browser; without it users had no
 * indication of the active person at upload time.
 */
export function UploadTargetRow({
  persons,
  targetPersonId,
  userId,
  onChange,
  onAddPerson,
  disabled,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const target = persons.find(p => p.person_id === targetPersonId)
    || persons.find(p => p.person_id === userId)
    || persons[0];
  if (!target) return null;

  const onlySelf = persons.length === 1;
  const displayName = getDisplayName(target, userId);
  const initial = getInitial(target, userId);

  return (
    <div className="rounded-[12px] border border-[#E3E6E5] bg-[#F7F9F8] px-3 py-2.5 text-[13px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#697570] shrink-0">Saving to</span>
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white shrink-0"
            style={{ backgroundColor: target.color || '#206E55' }}
          >
            {initial}
          </span>
          <span className="font-medium text-[#141515] truncate">{displayName}</span>
        </div>
        {!onlySelf && !disabled && (
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="text-[12px] font-medium text-[#206E55] hover:underline shrink-0"
          >
            {expanded ? 'Done' : 'Change'}
          </button>
        )}
      </div>

      {expanded && !disabled && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E3E6E5] pt-3">
          {persons.map((p) => {
            const isSelected = p.person_id === targetPersonId;
            const label = getDisplayName(p, userId);
            const init = getInitial(p, userId);
            return (
              <button
                key={p.person_id}
                type="button"
                onClick={() => {
                  onChange(p.person_id);
                  setExpanded(false);
                }}
                className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  isSelected
                    ? 'bg-[#206E55] text-white'
                    : 'bg-white border border-[#E3E6E5] text-[#141515] hover:border-[#206E55]'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'text-white'
                  }`}
                  style={!isSelected ? { backgroundColor: p.color || '#697570' } : undefined}
                >
                  {init}
                </span>
                {label}
              </button>
            );
          })}
          {onAddPerson && (
            <button
              type="button"
              onClick={onAddPerson}
              className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-[12px] font-medium border border-dashed border-[#C9D1CE] text-[#697570] hover:border-[#206E55] hover:text-[#206E55]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add family member
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import type { PersonInfo } from '@/types/ehr';
import { avatarInitials, formatRelationship } from './utils';

export function PatientProfileRow({
  patientName,
  persons,
  selectedPersonId,
  onSelectPerson,
  onAddPerson,
}: {
  patientName?: string;
  persons: PersonInfo[];
  selectedPersonId: string;
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPerson = persons.find(p => p.person_id === selectedPersonId);

  // Prefer the user-provided profile name (from get-persons) over the
  // FHIR-extracted patient name. patientName is a last-resort fallback
  // for persons who don't have a profile name (e.g. family members
  // inferred from uploaded reports before the user named them).
  const displayName = selectedPerson?.name || patientName || selectedPerson?.relationship || 'Unknown';
  const formattedName = displayName.trim().split(/\s+/).map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').filter(Boolean).join(' ');
  const initials = avatarInitials(displayName);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="flex flex-col items-end gap-1.5">
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#ECEEED] bg-white text-[13px] font-medium text-[#1A1E1C] hover:bg-[#FCFDFD] hover:border-[#C8D8D1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#206E55]/20"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[#206E55]">
            <span className="text-[10px] font-semibold text-white">{initials}</span>
          </span>
          <span className="truncate max-w-[140px]">{formattedName}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-[#6B7370] transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-30 bg-white rounded-xl border border-[#ECEEED] shadow-[0_12px_32px_rgba(24,28,26,0.10)] overflow-hidden w-72"
          >
            <div className="max-h-[300px] overflow-auto py-1.5">
              {/* Render persons in their canonical order so the picker
                  doesn't reshuffle on every selection — the selected
                  row is highlighted in place with a check, not lifted
                  to the top. */}
              {persons.map((person) => {
                const isActive = person.person_id === selectedPersonId;
                const name = isActive
                  ? (person.name || patientName || person.relationship || 'Unknown')
                  : (person.name || person.relationship);
                const personInitials = avatarInitials(name);
                const relation = formatRelationship(person.relationship);
                return (
                  <button
                    key={person.person_id}
                    onClick={() => { onSelectPerson(person.person_id); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors ${isActive ? 'bg-[#F6F8F7]' : 'hover:bg-[#F3F5F4]'}`}
                    role="menuitem"
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: isActive ? '#206E55' : (person.color || '#9CA3AF') }}
                    >
                      <span className="text-[11px] font-semibold text-white">{personInitials}</span>
                    </div>
                    <span className={`min-w-0 flex-1 truncate text-[14px] ${isActive ? 'font-semibold text-[#1A1E1C]' : 'font-medium text-[#1A1E1C]'}`}>{name}</span>
                    {relation && (
                      <span className="shrink-0 text-[12px] text-[#8A9290]">{relation}</span>
                    )}
                    {isActive && (
                      <Check className="h-4 w-4 shrink-0 text-[#206E55]" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Always-visible "Add family member" affordance — used to live
          inside the picker dropdown; surfacing it here keeps a key
          product action one click away instead of two. Outline pill
          style so it visibly reads as a button (not bare text) without
          competing with the primary picker pill above. */}
      <button
        type="button"
        onClick={() => { setOpen(false); onAddPerson(); }}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full border border-[#206E55]/30 bg-white text-[#206E55] hover:bg-[#F0F7F4] hover:border-[#206E55]/60 active:bg-[#E4F0EA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#206E55]/20"
      >
        <Plus className="h-3 w-3" strokeWidth={2.5} />
        Add family member
      </button>
    </div>
  );
}

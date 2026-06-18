'use client';

import type { EhrPatientProfile } from '@/types/ehr';

interface PatientHeroCardProps {
  patients: EhrPatientProfile[];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string, given?: string, family?: string): string {
  if (given && family) return `${given[0]}${family[0]}`.toUpperCase();
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAge(dateStr?: string): string {
  if (!dateStr) return '';
  const birth = new Date(dateStr);
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return `${age}`;
}

export function PatientHeroCard({ patients }: PatientHeroCardProps) {
  const patient = patients?.[0];
  if (!patient) return null;

  const fullName = patient.full_name || `${patient.given_name} ${patient.family_name}`;
  const initials = getInitials(fullName, patient.given_name, patient.family_name);
  const dob = formatDate(patient.birth_date);
  const age = getAge(patient.birth_date);

  return (
    <div
      className="relative rounded-[20px] px-5 pt-[18px] pb-5 mt-2 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #143D2E 0%, #1A4D3A 50%, #206E55 100%)',
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          top: '-80px',
          right: '-70px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />
      <div
        className="absolute w-[130px] h-[130px] rounded-full"
        style={{
          top: '-50px',
          right: '-35px',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      />
      <div
        className="absolute w-[110px] h-[110px] rounded-full"
        style={{
          bottom: '-50px',
          left: '-35px',
          backgroundColor: 'rgba(255,255,255,0.04)',
        }}
      />
      <div
        className="absolute w-[6px] h-[6px] rounded-full"
        style={{
          bottom: '22px',
          right: '22px',
          backgroundColor: 'rgba(255,255,255,0.25)',
        }}
      />

      {/* Overline */}
      <div className="flex items-center gap-1.5 mb-[18px]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4ACA85]" />
        <span
          className="text-[9.5px] font-semibold tracking-[1.8px]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          PATIENT RECORD
        </span>
      </div>

      {/* Name + Avatar row */}
      <div className="flex items-center gap-3.5 mb-[18px]">
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.16)',
          }}
        >
          <span className="text-xl font-bold text-white tracking-[0.5px]">{initials}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <h2
            className="text-[22px] font-semibold text-white leading-[27px]"
            style={{ letterSpacing: '-0.4px' }}
          >
            {fullName}
          </h2>
          {age && (
            <span
              className="self-start px-2.5 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              {age} yrs
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-[0.5px] mb-3.5" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

      {/* Meta row */}
      <div className="flex gap-6">
        {dob && (
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[8.5px] font-semibold tracking-[1.2px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              DATE OF BIRTH
            </span>
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {dob}
            </span>
          </div>
        )}
        {patient.gender && (
          <div
            className="flex flex-col gap-0.5"
            style={dob ? { paddingLeft: '24px', borderLeft: '0.5px solid rgba(255,255,255,0.14)' } : {}}
          >
            <span
              className="text-[8.5px] font-semibold tracking-[1.2px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              BIOLOGICAL SEX
            </span>
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

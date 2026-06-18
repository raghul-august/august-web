/*
 * Patient demographic block collected on the refill-details step
 * (_select-medication.tsx). Persisted to localStorage so a return visit
 * prefills what the user typed last time, and read at the moment we
 * call create-incognito-user so the backend gets it on session create.
 *
 * Values are stored as strings to match the form inputs. `age` is parsed
 * to an int only when serializing into the create-incognito-user body.
 */

export type PatientInfo = {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
};

const STORAGE_KEY = 'august-refill-patient-info';

export const EMPTY_PATIENT_INFO: PatientInfo = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
};

export function readPatientInfo(): PatientInfo {
  if (typeof window === 'undefined') return EMPTY_PATIENT_INFO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PATIENT_INFO;
    const parsed = JSON.parse(raw) as Partial<PatientInfo>;
    return {
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : '',
      lastName: typeof parsed.lastName === 'string' ? parsed.lastName : '',
      age: typeof parsed.age === 'string' ? parsed.age : '',
      gender: typeof parsed.gender === 'string' ? parsed.gender : '',
    };
  } catch {
    return EMPTY_PATIENT_INFO;
  }
}

export function writePatientInfo(info: PatientInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    /* quota or privacy mode — silently drop; form still works in-memory */
  }
}

import { create } from 'zustand';

interface TelehealthState {
  offeringId: string | null;
  setOfferingId: (offeringId: string | null) => void;
}

export const useTelehealthStore = create<TelehealthState>((set) => ({
  offeringId: null,
  setOfferingId: (offeringId) => set({ offeringId }),
}));

import { create } from 'zustand';

interface AccountSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Global flag for the AccountBottomSheet. Lifted out of Sidebar so other
 * pages (e.g. PostPaymentFlow's PreDoctorPopup) can hide overlapping
 * overlays while the sheet is open.
 */
export const useAccountSheetStore = create<AccountSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (open) => set({ isOpen: open }),
}));

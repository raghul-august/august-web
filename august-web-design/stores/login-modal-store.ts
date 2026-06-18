import { create } from 'zustand';

interface LoginModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Global flag that controls whether the SignUpModal is showing. Decoupled
 * from routing: login buttons call `open()`, the modal calls `close()` on
 * success or dismiss. The user stays on the page they clicked from — no
 * navigation, no `?returnTo=` round-trip.
 */
export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

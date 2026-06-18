import { create } from 'zustand';

interface NewConsultModalState {
  isOpen: boolean;
  showSidebarEmptyAction: boolean;
  open: () => void;
  close: () => void;
  showSidebarAction: () => void;
  hideSidebarAction: () => void;
}

export const useNewConsultModalStore = create<NewConsultModalState>((set) => ({
  isOpen: false,
  showSidebarEmptyAction: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, showSidebarEmptyAction: false }),
  showSidebarAction: () => set({ showSidebarEmptyAction: true }),
  hideSidebarAction: () => set({ showSidebarEmptyAction: false }),
}));

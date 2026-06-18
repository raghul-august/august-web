import { create } from 'zustand';

interface ChatInputFocusState {
  pendingFocus: boolean;
  requestFocus: () => void;
  consumeFocus: () => void;
}

export const useChatInputFocusStore = create<ChatInputFocusState>((set) => ({
  pendingFocus: false,
  requestFocus: () => set({ pendingFocus: true }),
  consumeFocus: () => set({ pendingFocus: false }),
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RecentConsultState {
  lastOpenedConsultId: string | null;
  setLastOpenedConsultId: (id: string | null) => void;
}

export const useRecentConsultStore = create<RecentConsultState>()(
  persist(
    (set) => ({
      lastOpenedConsultId: null,
      setLastOpenedConsultId: (id) => set({ lastOpenedConsultId: id }),
    }),
    {
      name: 'recent-consult-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return {
          getItem: (n) => { try { return localStorage.getItem(n); } catch { return null; } },
          setItem: (n, v) => { try { localStorage.setItem(n, v); } catch {} },
          removeItem: (n) => { try { localStorage.removeItem(n); } catch {} },
        };
      }),
    }
  )
);

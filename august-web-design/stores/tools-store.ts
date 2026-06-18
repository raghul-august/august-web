import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ToolId } from '@/lib/tools';

interface ToolsState {
    lastUsedToolId: ToolId | null;
    setLastUsedTool: (id: ToolId) => void;
    clearLastUsedTool: () => void;
}

export const useToolsStore = create<ToolsState>()(
    persist(
        (set) => ({
            lastUsedToolId: null,
            setLastUsedTool: (id) => set({ lastUsedToolId: id }),
            clearLastUsedTool: () => set({ lastUsedToolId: null }),
        }),
        {
            name: 'tools-storage',
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                return {
                    getItem: (name) => {
                        try { return localStorage.getItem(name); } catch { return null; }
                    },
                    setItem: (name, value) => {
                        try { localStorage.setItem(name, value); } catch {}
                    },
                    removeItem: (name) => {
                        try { localStorage.removeItem(name); } catch {}
                    },
                };
            }),
        }
    )
);

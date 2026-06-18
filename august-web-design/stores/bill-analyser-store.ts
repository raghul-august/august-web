import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UploadedFile } from '@/services/media-service';
import type { BillAnalysis } from '@/types/bill-analyser';

export type PipelineStage =
    | 'idle'
    | 'extracting'
    | 'enriching'
    | 'explaining'
    | 'complete'
    | 'error';

interface BillAnalyserState {
    uploadedFiles: UploadedFile[];
    pipelineStage: PipelineStage;
    analysis: BillAnalysis | null;
    error: string | null;
    runId: string | null;
    isWebview: boolean;
    selectedItemIndex: number | null;
    introSeen: boolean;
    checkedActionItems: string[];
    activeSubView: 'recap' | 'pdf' | 'draft' | null; // transient, not persisted

    setUploadedFiles: (files: UploadedFile[]) => void;
    setPipelineStage: (stage: PipelineStage) => void;
    setAnalysis: (analysis: BillAnalysis) => void;
    setError: (error: string) => void;
    setRunId: (id: string | null) => void;
    setIsWebview: (v: boolean) => void;
    setSelectedItemIndex: (index: number | null) => void;
    setIntroSeen: (v: boolean) => void;
    toggleActionItem: (id: string) => void;
    setActiveSubView: (v: 'recap' | 'pdf' | 'draft' | null) => void;
    reset: () => void;
}

const initialState = {
    uploadedFiles: [] as UploadedFile[],
    pipelineStage: 'idle' as PipelineStage,
    analysis: null as BillAnalysis | null,
    error: null as string | null,
    runId: null as string | null,
    isWebview: false,
    selectedItemIndex: null as number | null,
    introSeen: false,
    checkedActionItems: [] as string[],
    activeSubView: null as 'recap' | 'pdf' | 'draft' | null,
};

export const useBillAnalyserStore = create<BillAnalyserState>()(
    persist(
        (set) => ({
            ...initialState,

            setUploadedFiles: (files) => set({ uploadedFiles: files }),

            setPipelineStage: (stage) => set({ pipelineStage: stage }),

            setAnalysis: (analysis) => set({ analysis }),

            setError: (error) => set({ error, pipelineStage: 'error' }),

            setRunId: (id) => set({ runId: id }),

            setIsWebview: (v) => set({ isWebview: v }),

            setSelectedItemIndex: (index) => set({ selectedItemIndex: index }),

            setIntroSeen: (v) => set({ introSeen: v }),

            setActiveSubView: (v) => set({ activeSubView: v }),

            toggleActionItem: (id) => set((s) => ({
                checkedActionItems: s.checkedActionItems.includes(id)
                    ? s.checkedActionItems.filter((i) => i !== id)
                    : [...s.checkedActionItems, id],
            })),

            reset: () => set((s) => ({ ...initialState, isWebview: s.isWebview })),
        }),
        {
            name: 'bill-analyser-storage',
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                return {
                    getItem: (name: string) => {
                        try { return localStorage.getItem(name); } catch { return null; }
                    },
                    setItem: (name: string, value: string) => {
                        try { localStorage.setItem(name, value); } catch {}
                    },
                    removeItem: (name: string) => {
                        try { localStorage.removeItem(name); } catch {}
                    },
                };
            }),
            partialize: (state) => ({
                uploadedFiles: state.uploadedFiles,
                pipelineStage: state.pipelineStage,
                analysis: state.analysis,
                error: state.error,
                runId: state.runId,
                selectedItemIndex: state.selectedItemIndex,
                introSeen: state.introSeen,
                checkedActionItems: state.checkedActionItems,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                const inFlight = !['idle', 'complete', 'error'].includes(state.pipelineStage);
                if (inFlight && !state.runId) {
                    state.pipelineStage = 'idle';
                }
            },
        }
    )
);

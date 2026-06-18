import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UploadedFile } from '@/services/media-service';

export type PipelineStage =
    | 'idle'
    | 'analyzing'
    | 'generating'
    | 'annotating'
    | 'documenting'
    | 'complete'
    | 'error';

export interface DownloadTokens {
    patientPdf: string;
    patientDocx: string;
    physicianPdf: string;
    physicianDocx: string;
}

export interface PendingEdits {
    patient?: Record<string, string>;
    physician?: Record<string, string>;
}

interface AppealState {
    uploadedFiles: UploadedFile[];
    pipelineStage: PipelineStage;
    patientLetter: string;
    physicianLetter: string;
    downloadTokens: DownloadTokens | null;
    error: string | null;
    hasBeenEdited: boolean;
    runId: string | null;
    isWebview: boolean;
    pendingEdits: PendingEdits | null;

    setUploadedFiles: (files: UploadedFile[]) => void;
    setPipelineStage: (stage: PipelineStage) => void;
    setAnnotatedLetters: (patient: string, physician: string) => void;
    setDownloadTokens: (tokens: DownloadTokens) => void;
    setError: (error: string) => void;
    setHasBeenEdited: (v: boolean) => void;
    setRunId: (id: string | null) => void;
    setIsWebview: (v: boolean) => void;
    setPendingEdits: (edits: PendingEdits | null) => void;
    reset: () => void;
}

const initialState = {
    uploadedFiles: [],
    pipelineStage: 'idle' as PipelineStage,
    patientLetter: '',
    physicianLetter: '',
    downloadTokens: null,
    error: null,
    hasBeenEdited: false,
    runId: null,
    isWebview: false,
    pendingEdits: null,
};

export const useAppealStore = create<AppealState>()(
    persist(
        (set) => ({
            ...initialState,

            setUploadedFiles: (files) => set({ uploadedFiles: files }),

            setPipelineStage: (stage) => set({ pipelineStage: stage }),

            setAnnotatedLetters: (patient, physician) => set({
                patientLetter: patient,
                physicianLetter: physician,
            }),

            setDownloadTokens: (tokens) => set({ downloadTokens: tokens }),

            setError: (error) => set({ error, pipelineStage: 'error' }),

            setHasBeenEdited: (v) => set({ hasBeenEdited: v }),

            setRunId: (id) => set({ runId: id }),

            setIsWebview: (v) => set({ isWebview: v }),

            setPendingEdits: (edits) => set({ pendingEdits: edits }),

            reset: () => set((s) => ({ ...initialState, isWebview: s.isWebview })),
        }),
        {
            name: 'appeal-storage',
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
                patientLetter: state.patientLetter,
                physicianLetter: state.physicianLetter,
                downloadTokens: state.downloadTokens,
                error: state.error,
                hasBeenEdited: state.hasBeenEdited,
                pendingEdits: state.pendingEdits,
                runId: state.runId,
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

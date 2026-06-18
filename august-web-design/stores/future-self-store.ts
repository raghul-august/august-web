import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UploadedFile } from '@/services/media-service';
import type { FutureSelfAnalysis, FutureSelfLifestyle, FutureSelfStage } from '@/types/future-self';

type Step = 'landing' | 'questionnaire' | 'processing' | 'results';

interface FutureSelfState {
    uploadedPhoto: UploadedFile | null;
    originalPreviewDataUrl: string | null;
    lifestyle: Partial<FutureSelfLifestyle>;
    questionIndex: number;
    step: Step;
    pipelineStage: FutureSelfStage;
    analysis: FutureSelfAnalysis | null;
    error: string | null;
    runId: string | null;
    isWebview: boolean;

    setUploadedPhoto: (file: UploadedFile | null) => void;
    setOriginalPreviewDataUrl: (url: string | null) => void;
    setLifestyle: (patch: Partial<FutureSelfLifestyle>) => void;
    setQuestionIndex: (i: number) => void;
    setStep: (step: Step) => void;
    setPipelineStage: (s: FutureSelfStage) => void;
    setAnalysis: (a: FutureSelfAnalysis) => void;
    setError: (msg: string) => void;
    setRunId: (id: string | null) => void;
    setIsWebview: (v: boolean) => void;
    reset: () => void;
}

const initialState = {
    uploadedPhoto: null as UploadedFile | null,
    originalPreviewDataUrl: null as string | null,
    lifestyle: {} as Partial<FutureSelfLifestyle>,
    questionIndex: 0,
    step: 'landing' as Step,
    pipelineStage: 'idle' as FutureSelfStage,
    analysis: null as FutureSelfAnalysis | null,
    error: null as string | null,
    runId: null as string | null,
    isWebview: false,
};

export const useFutureSelfStore = create<FutureSelfState>()(
    persist(
        (set) => ({
            ...initialState,
            setUploadedPhoto: (file) => set({ uploadedPhoto: file }),
            setOriginalPreviewDataUrl: (url) => set({ originalPreviewDataUrl: url }),
            setLifestyle: (patch) => set((s) => ({ lifestyle: { ...s.lifestyle, ...patch } })),
            setQuestionIndex: (i) => set({ questionIndex: i }),
            setStep: (step) => set({ step }),
            setPipelineStage: (pipelineStage) => set({ pipelineStage }),
            setAnalysis: (analysis) => set({ analysis }),
            setError: (error) => set({ error, pipelineStage: 'error' }),
            setRunId: (id) => set({ runId: id }),
            setIsWebview: (v) => set({ isWebview: v }),
            reset: () => set((s) => ({ ...initialState, isWebview: s.isWebview })),
        }),
        {
            name: 'future-self-storage',
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
            partialize: (state) => ({
                uploadedPhoto: state.uploadedPhoto,
                originalPreviewDataUrl: state.originalPreviewDataUrl,
                lifestyle: state.lifestyle,
                questionIndex: state.questionIndex,
                step: state.step,
                pipelineStage: state.pipelineStage,
                analysis: state.analysis,
                runId: state.runId,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                const inFlight = ['analyzing', 'generating', 'storing'].includes(state.pipelineStage);
                if (inFlight && !state.runId) {
                    state.pipelineStage = 'idle';
                    state.step = state.uploadedPhoto ? 'questionnaire' : 'landing';
                }
            },
        }
    )
);

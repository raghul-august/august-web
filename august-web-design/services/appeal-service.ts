import type { PipelineStage, DownloadTokens } from '@/stores/appeal-store';
import { useAuthStore } from '@/stores/auth-store';
import { getActiveTenant } from '@/lib/tenant';
import axiosInstance from '@/lib/axios';

interface FileUrlInput {
    blobName: string;
    mimeType: string;
    originalName: string;
}

interface PipelineResult {
    patientLetter: string;
    physicianLetter: string;
    downloadTokens: DownloadTokens;
}


function appealApiRoute(action: string): string {
    return `/api/user/${getActiveTenant()}/appeal/${action}`;
}

// Relative path for axiosInstance
function appealPath(action: string): string {
    return `/user/${getActiveTenant()}/appeal/${action}`;
}

export async function fetchRunStatus(runId: string): Promise<{
    status: 'processing' | 'complete' | 'error';
    stage: string | null;
    patientLetter: string | null;
    physicianLetter: string | null;
    downloadTokens: DownloadTokens | null;
    error: string | null;
} | null> {
    try {
        const res = await axiosInstance.get(appealPath(`run/${runId}/status`));
        return res.data;
    } catch {
        return null;
    }
}

export async function runPipeline(
    fileUrls: FileUrlInput[],
    onStage: (stage: PipelineStage) => void,
    denialText?: string,
    clinicalText?: string,
    onRunId?: (runId: string) => void
): Promise<PipelineResult> {
    // SSE streaming requires raw fetch — auth header added manually
    const token = useAuthStore.getState().getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(appealApiRoute('run'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ fileUrls, denialText, clinicalText }),
    });

    if (!res.ok || !res.body) {
        const text = await res.text().catch(() => 'Pipeline request failed');
        throw new Error(text);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result: PipelineResult | null = null;
    let currentEvent = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith(':')) continue;
                if (line.startsWith('event: ')) {
                    currentEvent = line.slice(7).trim();
                } else if (line.startsWith('data: ') && currentEvent) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (currentEvent === 'run_id') {
                            onRunId?.(data.runId);
                        } else if (currentEvent === 'stage') {
                            onStage(data.stage);
                        } else if (currentEvent === 'result') {
                            result = data;
                        } else if (currentEvent === 'error') {
                            throw new Error(data.message || 'Pipeline failed');
                        }
                    } catch (parseErr) {
                        if (currentEvent === 'error') throw parseErr;
                    }
                    currentEvent = '';
                }
            }
        }
    } catch (err: any) {
        if (result) return result;
        const msg = err?.message || 'Connection lost during processing';
        throw new Error(msg.includes('network') ? 'Connection lost — please try again' : msg);
    }

    if (!result) throw new Error('Pipeline completed without result');
    return result;
}

export async function regenerateDocuments(
    patientLetter: string,
    physicianLetter: string,
    runId?: string | null
): Promise<{ downloadTokens: DownloadTokens }> {
    const clean = (t: string) => t.replace(/<!--\s*tip:.*?-->/g, '').trim();
    const res = await axiosInstance.post(appealPath('generate-documents'), {
        patientLetter: clean(patientLetter),
        physicianLetter: clean(physicianLetter),
        runId,
    });
    return res.data;
}

export async function fetchAppealRun(runId: string): Promise<{
    success: boolean;
    run?: {
        id: string;
        user_id: string;
        patient_letter: string | null;
        physician_letter: string | null;
        status: string;
        created_at: string;
    };
} | null> {
    try {
        const res = await axiosInstance.get(appealPath(`runs/${runId}`));
        return res.data;
    } catch {
        return null;
    }
}

export async function fetchAppealRuns(): Promise<{
    success: boolean;
    runs: Array<{
        id: string;
        status: string;
        has_patient_letter: boolean;
        has_physician_letter: boolean;
        created_at: string;
    }>;
} | null> {
    try {
        const res = await axiosInstance.get(appealPath('runs'));
        return res.data;
    } catch {
        return null;
    }
}

export function downloadUrl(token: string): string {
    return `/api/user/${getActiveTenant()}/appeal/download/${token}`; 
}

import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { getActiveTenant } from '@/lib/tenant';
import type { BillAnalysis } from '@/types/bill-analyser';

function billAnalyserBase(): string {
    return `/user/${getActiveTenant()}/bill-analyser`;
}

function billAnalyserApiRoute(action: string): string {
    return `/api${billAnalyserBase()}/${action}`;
}

export async function runBillAnalysis(
    fileUrls: Array<{ blobName: string; mimeType: string; originalName: string }>,
    onStage: (stage: string) => void,
    onRunId?: (runId: string) => void
): Promise<BillAnalysis> {
    const token = useAuthStore.getState().getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const res = await fetch(billAnalyserApiRoute('run'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ fileUrls }),
        signal: controller.signal,
    });

    if (!res.ok || !res.body) {
        clearTimeout(timeout);
        const text = await res.text().catch(() => 'Pipeline request failed');
        throw new Error(text);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result: BillAnalysis | null = null;
    let currentEvent = '';

    const processLine = (line: string) => {
        if (line.startsWith(':') || !line) return;
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
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) processLine(line);
        }
        // flush decoder and process any remaining buffer
        buffer += decoder.decode();
        if (buffer.trim()) {
            for (const line of buffer.split('\n')) processLine(line);
        }
    } catch (err: any) {
        if (result) return result;
        const msg = err?.message || 'Connection lost during processing';
        throw new Error(msg.includes('network') || msg.includes('abort')
            ? 'Connection lost -- please try again' : msg);
    } finally {
        clearTimeout(timeout);
    }

    if (!result) throw new Error('Pipeline completed without result');
    return result;
}

export async function fetchRunStatus(runId: string): Promise<{
    status: 'processing' | 'complete' | 'error';
    stage: string | null;
    result: BillAnalysis | null;
    error: string | null;
} | null> {
    try {
        const res = await axiosInstance.get(`${billAnalyserBase()}/run/${runId}/status`);
        return res.data;
    } catch {
        return null;
    }
}

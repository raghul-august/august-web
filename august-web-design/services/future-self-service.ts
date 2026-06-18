import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { getActiveTenant } from '@/lib/tenant';
import type { FutureSelfAnalysis, FutureSelfLifestyle } from '@/types/future-self';

function futureSelfApiRoute(action: string): string {
    return `/api/user/${getActiveTenant()}/future-self/${action}`;
}

interface RunPayload {
    sourceFile: { blobName: string; mimeType: string };
    lifestyle: FutureSelfLifestyle;
}

export async function runFutureSelf(
    payload: RunPayload,
    onStage: (stage: string) => void,
    onRunId?: (runId: string) => void
): Promise<FutureSelfAnalysis> {
    const token = useAuthStore.getState().getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);

    const res = await fetch(futureSelfApiRoute('run'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
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
    let result: FutureSelfAnalysis | null = null;
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
        buffer += decoder.decode();
        if (buffer.trim()) {
            for (const line of buffer.split('\n')) processLine(line);
        }
    } catch (err: any) {
        if (result) return result;
        const msg = err?.message || 'Connection lost during processing';
        throw new Error(msg.includes('network') || msg.includes('abort')
            ? 'Connection lost — please try again' : msg);
    } finally {
        clearTimeout(timeout);
    }

    if (!result) throw new Error('Pipeline completed without result');
    return result;
}

export async function fetchFutureSelfRunStatus(runId: string): Promise<{
    status: 'processing' | 'complete' | 'error';
    stage: string | null;
    result: FutureSelfAnalysis | null;
    error: string | null;
} | null> {
    try {
        const res = await axiosInstance.get(`/user/${getActiveTenant()}/future-self/run/${runId}/status`);
        return res.data;
    } catch {
        return null;
    }
}

export async function releaseFutureSelfRun(runId: string): Promise<boolean> {
    try {
        const res = await axiosInstance.post(`/user/${getActiveTenant()}/future-self/run/${runId}/release`, {});
        return Boolean(res.data?.success);
    } catch {
        return false;
    }
}

export async function fetchFutureSelfQuota(): Promise<{ used: number; limit: number; remaining: number } | null> {
    try {
        const res = await axiosInstance.get(`/user/${getActiveTenant()}/future-self/quota`);
        if (res.data?.success) {
            return { used: res.data.used, limit: res.data.limit, remaining: res.data.remaining };
        }
        return null;
    } catch {
        return null;
    }
}

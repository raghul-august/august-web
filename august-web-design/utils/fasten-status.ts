export type FastenStatusPhase = 'processing' | 'success' | 'failure' | 'null';

const PROCESSING_WORKER_STATUSES = new Set([
  'waiting',
  'queued',
  'claimed',
  'downloading',
  'parsing',
  'in_progress',
]);

const SUCCESS_WORKER_STATUSES = new Set([
  'complete',
]);

const FAILURE_WORKER_STATUSES = new Set([
  'partial_failed',
  'failed',
]);

export const getFastenStatusPhase = (workerStatus: string | null | undefined): FastenStatusPhase => {
  if (!workerStatus) {
    return 'null';
  }

  if (SUCCESS_WORKER_STATUSES.has(workerStatus)) {
    return 'success';
  }

  if (FAILURE_WORKER_STATUSES.has(workerStatus)) {
    return 'failure';
  }

  if (PROCESSING_WORKER_STATUSES.has(workerStatus)) {
    return 'processing';
  }

  return 'processing';
};

export const isFastenStatusProcessing = (workerStatus: string | null | undefined): boolean => {
  return getFastenStatusPhase(workerStatus) === 'processing';
};

export const isFastenStatusSuccessful = (workerStatus: string | null | undefined): boolean => {
  return getFastenStatusPhase(workerStatus) === 'success';
};

export const isFastenStatusFailed = (workerStatus: string | null | undefined): boolean => {
  return getFastenStatusPhase(workerStatus) === 'failure';
};

// Connection status step for UI progress
export type ConnectionStep = 'authenticating' | 'requesting' | 'downloading' | 'organizing';

export const getConnectionStep = (workerStatus: string | null | undefined): ConnectionStep => {
  if (!workerStatus) return 'authenticating';

  switch (workerStatus) {
    case 'waiting':
    case 'queued':
      return 'authenticating';
    case 'claimed':
      return 'requesting';
    case 'downloading':
      return 'downloading';
    case 'parsing':
    case 'in_progress':
    case 'complete':
      return 'organizing';
    default:
      return 'authenticating';
  }
};

export const CONNECTION_STEPS: { id: ConnectionStep; label: string }[] = [
  { id: 'authenticating', label: 'Authenticating' },
  { id: 'requesting', label: 'Requesting records' },
  { id: 'downloading', label: 'Downloading data' },
  { id: 'organizing', label: 'Organizing records' },
];

export const getStepProgress = (currentStep: ConnectionStep): number => {
  const stepIndex = CONNECTION_STEPS.findIndex(s => s.id === currentStep);
  return ((stepIndex + 1) / CONNECTION_STEPS.length) * 100;
};

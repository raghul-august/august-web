import { Check, FileText, Loader2, RotateCcw, X } from 'lucide-react';
import type { UploadJob } from '@/stores/ehr-store';

const STATUS_LABEL: Record<string, string> = {
  uploading: 'Uploading',
  extracting: 'Reading',
  indexing: 'Adding to record',
  done: 'Added to your record',
  failed: 'Failed',
};

export function InFlightUploadList({
  jobs,
  onDismissJob,
  onRetryJob,
}: {
  jobs: UploadJob[];
  onDismissJob: (id: string) => void;
  /** Only honored on failed jobs. Re-enqueues the file as a new
   *  uploading job; the runner picks it up immediately. */
  onRetryJob?: (id: string) => void;
}) {
  if (jobs.length === 0) return null;

  return (
    <div className="mb-3 rounded-[14px] bg-[#F8FAF9] border border-[#E4E8E6] p-3">
      <div className="text-[12px] font-semibold text-[#1A1E1C] mb-2">In progress</div>
      <ul className="space-y-1.5">
        {jobs.map(job => {
          const inFlight = job.status !== 'done' && job.status !== 'failed';
          return (
            <li key={job.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white border border-[#E4E8E6]">
              <FileText className="h-3.5 w-3.5 text-[#6B7370] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-[#1A1E1C] truncate" title={job.fileName}>{job.fileName}</div>
                <div className={`text-[11px] mt-0.5 inline-flex items-center gap-1 ${job.status === 'failed' ? 'text-[#C44040]' : job.status === 'done' ? 'text-[#1D7A55]' : 'text-[#6B7370]'}`}>
                  {inFlight && <Loader2 className="h-3 w-3 animate-spin text-[#206E55]" />}
                  {job.status === 'done' && <Check className="h-3 w-3" />}
                  {STATUS_LABEL[job.status] ?? job.status}
                </div>
              </div>
              {job.status === 'failed' && onRetryJob && (
                <button
                  onClick={() => onRetryJob(job.id)}
                  className="text-[#206E55] hover:text-[#1a5a46] p-1 rounded inline-flex items-center gap-1 text-[11px] font-semibold"
                  aria-label="Retry"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
              )}
              {(job.status === 'done' || job.status === 'failed') && (
                <button
                  onClick={() => onDismissJob(job.id)}
                  className="text-[#8A9290] hover:text-[#1A1E1C] p-1 rounded"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

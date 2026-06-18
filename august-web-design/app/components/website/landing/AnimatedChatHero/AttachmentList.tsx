import { FileText, XIcon } from "lucide-react";
import { memo } from "react";

interface AttachmentListProps {
    attachments: string[];
    onRemoveAttachment: (index: number) => void;
}

const AttachmentList = memo(function AttachmentList({
    attachments,
    onRemoveAttachment,
}: AttachmentListProps) {
    if (attachments.length === 0) return null;

    return (
        <div className="px-5 pt-4 pb-0 flex gap-2 flex-wrap">
            {attachments.map((file, index) => (
                <div
                    key={`${file}-${index}`}
                    className="relative flex items-center gap-3 py-2.5 pl-3 pr-4 rounded-xl transition-all duration-200"
                    style={{
                        background: "rgba(0, 0, 0, 0.03)",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                >
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                        style={{ background: "rgba(220, 80, 60, 0.1)" }}
                    >
                        <FileText className="w-4.5 h-4.5" style={{ color: "#DC503C" }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm text-[#1C1917] truncate max-w-[200px]">{file}</span>
                        <span className="text-xs text-text-muted">PDF</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemoveAttachment(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-[#1C1917]/70 text-white hover:bg-[#1C1917] transition-colors"
                        aria-label={`Remove ${file}`}
                    >
                        <XIcon className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
    );
});

export default AttachmentList;

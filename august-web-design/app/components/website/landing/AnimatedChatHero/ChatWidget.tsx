import { track } from "@/app/utils/analytics";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import AttachmentList from "./AttachmentList";
import ChatInputForm from "./ChatInputForm";

const ChatWidget = memo(function ChatWidget() {
    const [attachments, setAttachments] = useState<string[]>([]);
    const chatWidgetRef = useRef<HTMLDivElement>(null);
    const hasTrackedSeen = useRef(false);

    useEffect(() => {
        const el = chatWidgetRef.current;
        if (!el || hasTrackedSeen.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !hasTrackedSeen.current) {
                    hasTrackedSeen.current = true;
                    track("chat_widget_seen", { current_page: "home" });
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const removeAttachment = useCallback((index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    return (
        <div
            ref={chatWidgetRef}
            className="relative mx-auto w-full max-w-2xl rounded-[16px] md:rounded-[24px]"
            style={{
                background: "#FEFEFD",
                border: "1px solid rgba(200, 195, 188, 0.3)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                willChange: "transform",
                boxShadow: `
                    rgba(13, 39, 64, 0.08) 0px 1.2px 30px 0px,
                    inset 3px 3px 2px -3px rgba(255, 255, 255, 0.8),
                    inset -3px -3px 2px -3px rgba(255, 255, 255, 0.8),
                    inset 2px 2px 0.5px -2px rgba(38, 38, 38, 0.06),
                    inset -2px -2px 0.5px -2px rgba(38, 38, 38, 0.06),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
                    inset 0 0 12px 1px rgba(212, 212, 212, 0.08)
                `,
            }}
        >
            <AttachmentList attachments={attachments} onRemoveAttachment={removeAttachment} />
            <ChatInputForm />
        </div>
    );
});

export default ChatWidget;
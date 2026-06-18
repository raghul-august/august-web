import { track } from "@/app/utils/analytics";
import useAutoResizeTextarea from "@/hooks/useAutoResizeTextarea";
import { memo, useCallback, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import ThinkingToast from "./ThinkingToast";
import SendButton from "./SendButton";
import { cn } from "@/lib/utils";



const ChatInputForm = memo(function ChatInputForm() {
    const [value, setValue] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const isTyping = false;
    const hasStartedTyping = useRef(false);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 40,
        maxHeight: 200,
    });

    const handleSendMessage = useCallback(() => {
        const trimmed = value.trim() || "Hello August";
        track("send_message", {
            message_type: "text",
            source_field_id: "chat_input_trial",
        });
        const encoded = encodeURIComponent(trimmed);
        window.open(`/chat?msg=${encoded}`, "_self");
    }, [value]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) {
                    handleSendMessage();
                }
            }
        },
        [handleSendMessage, value]
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            if (!hasStartedTyping.current && newValue.length > 0) {
                hasStartedTyping.current = true;
                track("form_start", {
                    field_id: "chat_input_trial",
                    started_with: "text",
                });
            }
            setValue(newValue);
            adjustHeight();
        },
        [adjustHeight]
    );

    const handleFocus = useCallback(() => {
        setInputFocused(true);
        track("input_entry", {
            field_id: "chat_input_trial",
            current_page: "Home_USRoW",
        });
    }, []);

    const handleBlur = useCallback(() => setInputFocused(false), []);

    return (
        <>
            <div className="pt-3 md:pb-4 md:pt-2 relative">
                <AnimatedPlaceholder inputFocused={inputFocused} hasValue={value.length > 0} />
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder=""
                    className={cn(
                        "w-full pl-4 pr-3 py-3 md:px-7",
                        "resize-none",
                        "bg-transparent",
                        "border-none outline-none",
                        "text-[#1C1917] text-[16px] md:text-[18px]",
                        "placeholder:text-[#999996]",
                        "min-h-[40px]"
                    )}
                    style={{ overflow: "hidden" }}
                />
            </div>

            <div
                className="px-3 py-3 md:px-4 md:pb-4 flex items-center justify-end gap-4"
                style={{ borderTop: "none" }}
            >
                <SendButton isTyping={isTyping} onSendMessage={handleSendMessage} />
            </div>

            <ThinkingToast isTyping={isTyping} />
        </>
    );
});

export default ChatInputForm;
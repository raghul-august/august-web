import { useCallback, useEffect, useRef } from "react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}



function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            const previousHeight = textarea.style.height;
            textarea.style.height = "auto";
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            const finalHeight = `${newHeight}px`;
            if (previousHeight !== finalHeight) {
                textarea.style.height = finalHeight;
            } else {
                textarea.style.height = previousHeight;
            }
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => adjustHeight(), 100);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeoutId);
        };
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export default useAutoResizeTextarea;
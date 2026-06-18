import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";


const ANIMATION_CONFIG = {
    typingSpeed: 60,
    backspaceSpeed: 30,
    holdDuration: 700,
    pauseBeforeNext: 200,
    initialDelay: 1000,
};

const PLACEHOLDER_TEXTS = [
    "Explain my lab report",
    "I have flu or cold - do I need a doctor?",
    "I am feeling anxious",
    "Ask anything",
];



interface AnimatedPlaceholderProps {
    inputFocused: boolean;
    hasValue: boolean;
}

const AnimatedPlaceholder = memo(function AnimatedPlaceholder({
    inputFocused,
    hasValue,
}: AnimatedPlaceholderProps) {
    const [displayedText, setDisplayedText] = useState("Ask anything");
    const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
    const [isLastPlaceholder, setIsLastPlaceholder] = useState(false);

    useEffect(() => {
        if (inputFocused) {
            setDisplayedText("Ask anything");
            setHasCompletedCycle(true);
            return;
        }
        if (hasCompletedCycle) return;

        let cancelled = false;
        const ids: ReturnType<typeof setTimeout>[] = [];
        const schedule = (fn: () => void, delay: number) => {
            const id = setTimeout(() => {
                if (!cancelled) fn();
            }, delay);
            ids.push(id);
        };

        let currentDisplay = "Ask anything";
        const updateText = (text: string) => {
            currentDisplay = text;
            setDisplayedText(text);
        };

        const runInitialBackspace = () => {
            if (cancelled) return;
            if (currentDisplay.length > 0) {
                updateText(currentDisplay.substring(0, currentDisplay.length - 1));
                schedule(runInitialBackspace, ANIMATION_CONFIG.backspaceSpeed);
            } else {
                schedule(() => runTypeCycle(0), ANIMATION_CONFIG.pauseBeforeNext);
            }
        };

        const runTypeCycle = (index: number) => {
            if (cancelled) return;
            if (index >= PLACEHOLDER_TEXTS.length) {
                updateText("Ask anything");
                setHasCompletedCycle(true);
                return;
            }

            const targetText = PLACEHOLDER_TEXTS[index];
            let charIdx = 0;

            const typeChar = () => {
                if (cancelled) return;
                if (charIdx < targetText.length) {
                    charIdx++;
                    updateText(targetText.substring(0, charIdx));
                    schedule(typeChar, ANIMATION_CONFIG.typingSpeed);
                } else {
                    const isLast = index === PLACEHOLDER_TEXTS.length - 1;
                    if (isLast) {
                        setHasCompletedCycle(true);
                    } else {
                        schedule(backspaceChar, ANIMATION_CONFIG.holdDuration);
                    }
                }
            };

            const backspaceChar = () => {
                if (cancelled) return;
                if (currentDisplay.length > 0) {
                    updateText(currentDisplay.substring(0, currentDisplay.length - 1));
                    schedule(backspaceChar, ANIMATION_CONFIG.backspaceSpeed);
                } else {
                    schedule(() => runTypeCycle(index + 1), ANIMATION_CONFIG.pauseBeforeNext);
                }
            };

            if (index === PLACEHOLDER_TEXTS.length - 1) setIsLastPlaceholder(true);
            typeChar();
        };

        schedule(runInitialBackspace, ANIMATION_CONFIG.initialDelay);

        return () => {
            cancelled = true;
            ids.forEach(clearTimeout);
        };
    }, [hasCompletedCycle, inputFocused]);

    if (hasValue) return null;

    return (
        <div
            className={cn(
                "absolute left-4 md:left-8 top-[24px] md:top-[20px] pointer-events-none flex items-center",
                "text-[16px] md:text-[18px] font-normal text-[#999996]"
            )}
        >
            {hasCompletedCycle && !inputFocused && (
                <span
                    className="inline-block bg-[#1C1917] animate-blink"
                    style={{
                        width: "1px",
                        height: "1.2em",
                        marginLeft: "-4px",
                        marginRight: "3px",
                    }}
                />
            )}
            <span>{displayedText}</span>
            {!hasCompletedCycle && !isLastPlaceholder && !inputFocused && (
                <span
                    className="inline-block bg-[#1C1917] animate-blink"
                    style={{
                        width: "1px",
                        height: "1.2em",
                        marginLeft: "4px",
                    }}
                />
            )}
        </div>
    );
});

export default AnimatedPlaceholder;
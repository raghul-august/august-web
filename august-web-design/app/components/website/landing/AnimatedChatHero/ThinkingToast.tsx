import { memo } from "react";

interface ThinkingToastProps {
    isTyping: boolean;
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <div
                    key={dot}
                    className="w-1.5 h-1.5 rounded-full mx-0.5"
                    style={{
                        background: "#206E55",
                        animation: "typingDot 1.2s ease-in-out infinite",
                        animationDelay: `${dot * 0.15}s`,
                    }}
                />
            ))}
        </div>
    );
}

const ThinkingToast = memo(function ThinkingToast({ isTyping }: ThinkingToastProps) {
    if (!isTyping) return null;

    return (
        <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5 shadow-lg z-50 transition-all duration-200"
            style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            }}
        >
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#206E55]">august</span>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>is thinking</span>
                    <TypingDots />
                </div>
            </div>
            <style>{`
                @keyframes typingDot {
                    0%, 100% { opacity: 0.3; transform: scale(0.85); }
                    50% { opacity: 0.9; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
});

export default ThinkingToast

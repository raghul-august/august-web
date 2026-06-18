import { memo } from "react";

const ScrollIndicator = memo(function ScrollIndicator() {
    return (
        <div className="hidden md:flex md:absolute md:bottom-4 left-1/2 z-20 -translate-x-1/2 flex-col items-center gap-2">
            <p
                className="text-text-muted"
                style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                }}
            >
                Scroll
            </p>
            <div
                className="h-9 w-5 rounded-full border border-[#1C1917]/15"
                style={{ padding: "4px" }}
            >
                <div
                    className="h-2 w-full rounded-full bg-[#1C1917]/15"
                    style={{ animation: "scrollDot 2s ease-in-out infinite" }}
                />
            </div>
        </div>
    );
});

export default ScrollIndicator;
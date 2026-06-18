import { memo } from "react";

const HeroCopy = memo(function HeroCopy() {
    return (
        <div className="text-center space-y-1 md:space-y-2">
            <div className="flex justify-center">
                <div className="shine-badge inline-flex items-center rounded-full px-3 py-1.5 md:px-5 md:py-2">
                    <span
                        className="text-[10px] md:text-[12px] font-medium tracking-widest uppercase"
                        style={{ color: "#999996" }}
                    >
                        100% USMLE Score
                    </span>
                </div>
            </div>

            <div>
                <h1 className="hero-chat-heading">
                    Hey, I am august.
                    <br />Ask me about your health.
                </h1>
            </div>

            <p
                className="text-text-secondary mx-auto max-w-md"
                style={{
                    fontSize: "clamp(14px, 1.6vw, 17px)",
                    fontWeight: 400,
                    lineHeight: 1.6,
                }}
            >
                I&apos;m trained by doctors, I remember your health, and
                <br />I&apos;m here whenever you need&nbsp;me.
            </p>
        </div>
    );
});

export default HeroCopy;
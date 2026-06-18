"use client";

import AnimatedAIChatStyles from "./AnimatedChatStyles";
import ChatWidget from "./ChatWidget";
import HeroCopy from "./HeroCopy";
import QuickPromptButtons from "./QuickPromptButtons";
import ScrollIndicator from "./ScrollIndicator";
import TrustBadges from "./TrustBadges";

export function AnimatedAIChatHero() {
    return (
        <section
            className="relative min-h-[100dvh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden md:overflow-hidden"
            style={{ background: "#FAF9F5", willChange: "transform" }}
        >
            <div className="film-grain pointer-events-none absolute inset-0 z-[2]" />

            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-2 pb-6 md:py-[clamp(40px,5vh,80px)]">
                <div
                    className="relative"
                    style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 3vh, 40px)" }}
                >
                    <HeroCopy />
                    <ChatWidget />
                    <QuickPromptButtons />
                    <TrustBadges />
                </div>
            </div>

            <ScrollIndicator />
            <AnimatedAIChatStyles />
        </section>
    );
}























import { memo } from "react";

const AnimatedAIChatStyles = memo(function AnimatedAIChatStyles() {
    return (
        <style>{`
            .hero-entrance {
                /* Removed for LCP optimization */
            }
            .hero-h1-entrance {
                /* Removed for LCP optimization */
            }
            .hero-chat-heading {
                font-size: clamp(30px, 5.5vw, 60px);
                text-wrap: balance;
                font-weight: 400;
                line-height: 1.1;
                letter-spacing: -0.04em;
                padding-bottom: 0.1em;
                background: linear-gradient(90deg, #206E55 0%, #206E55 35%, #4CA882 45%, #7BC4A4 50%, #4CA882 55%, #206E55 65%, #206E55 100%);
                background-size: 300% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shineSmooth 12s ease-in-out 1s infinite;
                will-change: background-position;
            }
            @keyframes shineSmooth {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
            }
            @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
            .animate-blink {
                animation: blink 1s step-end infinite;
            }
        `}</style>
    );
});

export default AnimatedAIChatStyles;
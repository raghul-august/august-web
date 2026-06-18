"use client";

import { useState, useEffect, useRef } from "react";
import { track } from "@/app/utils/analytics";
import { checkCountry } from "@/app/utils/checkCountry";

const ANIMATION_CONFIG = {
  typingSpeed: 60,
  backspaceSpeed: 30,
  holdDuration: 700,
  pauseBeforeNext: 200,
  initialDelay: 1000,
};

function SendIcon({ size, className }: { size: string; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M0.225832 1.89381C-0.0676354 1.01341 0.84984 0.217684 1.67989 0.63271L15.0348 7.31017C15.8026 7.69405 15.8026 8.78968 15.0348 9.17356L1.67989 15.851C0.849837 16.266 -0.0676347 15.4703 0.225832 14.5899L2.13357 8.8667H5.709C6.05418 8.8667 6.334 8.58688 6.334 8.2417C6.334 7.89652 6.05418 7.6167 5.709 7.6167H2.13346L0.225832 1.89381Z"
        fill="white"
      />
    </svg>
  );
}

export function ChatInput({ isMobile = false }: { isMobile?: boolean }) {
  const removeFree = true;
  const finalPlaceholder = removeFree ? "Ask anything" : "Ask anything for free";
  const placeholderTexts = removeFree
    ? [
        "Explain my lab report",
        "I have flu or cold - do I need a doctor?",
        "I am feeling anxious",
        "Ask anything",
      ]
    : [
        "Explain my lab report",
        "I have flu or cold - do I need a doctor?",
        "I am feeling anxious",
        "Ask anything for free",
      ];

  const [value, setValue] = useState("");
  const [displayedText, setDisplayedText] = useState(finalPlaceholder);
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
  const [isLastPlaceholder, setIsLastPlaceholder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasStartedTyping = useRef(false);

  // Single animation effect using fully imperative approach — no side effects in setState updaters
  useEffect(() => {
    if (isInputFocused) return;

    let cancelled = false;
    const ids: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, delay);
      ids.push(id);
    };

    // Track text imperatively via a local variable — never read it from state
    let currentDisplay = finalPlaceholder;
    const updateText = (text: string) => {
      currentDisplay = text;
      setDisplayedText(text);
    };

    // Phase 1: Wait, then backspace the initial "Ask anything" text
    const runInitialBackspace = () => {
      if (cancelled) return;
      if (currentDisplay.length > 0) {
        updateText(currentDisplay.substring(0, currentDisplay.length - 1));
        schedule(runInitialBackspace, ANIMATION_CONFIG.backspaceSpeed);
      } else {
        // Phase 2: Start cycling through placeholder texts
        schedule(() => runTypeCycle(0), ANIMATION_CONFIG.pauseBeforeNext);
      }
    };

    // Phase 2: Type a placeholder, hold, backspace, then move to next
    const runTypeCycle = (index: number) => {
      if (cancelled) return;
      if (index >= placeholderTexts.length) {
        // All done — set final state
        updateText(finalPlaceholder);
        setIsTyping(false);
        setHasCompletedCycle(true);
        return;
      }

      const targetText = placeholderTexts[index];
      let charIdx = 0;

      const typeChar = () => {
        if (cancelled) return;
        if (charIdx < targetText.length) {
          charIdx++;
          updateText(targetText.substring(0, charIdx));
          setIsTyping(true);
          schedule(typeChar, ANIMATION_CONFIG.typingSpeed);
        } else {
          // Done typing this phrase
          setIsTyping(false);
          const isLast = index === placeholderTexts.length - 1;
          if (isLast) {
            // Instantly complete — no delay
            setHasCompletedCycle(true);
          } else {
            // Hold then backspace
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
          // Move to next placeholder
          schedule(() => runTypeCycle(index + 1), ANIMATION_CONFIG.pauseBeforeNext);
        }
      };

      if (index === placeholderTexts.length - 1) setIsLastPlaceholder(true);
      typeChar();
    };

    // Kick off after initial delay
    schedule(runInitialBackspace, ANIMATION_CONFIG.initialDelay);

    return () => {
      cancelled = true;
      ids.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInputFocused]);

  // Auto-resize textarea - supports up to 3 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = isMobile ? 24 : 33;
      const maxHeight = lineHeight * 3;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value, isMobile]);

  // GA4: chat_widget_seen — use IntersectionObserver so GA has time to load
  const chatWidgetRef = useRef<HTMLDivElement | null>(null);
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

  const handleFocus = () => {
    setIsInputFocused(true);
    setDisplayedText("");
    track("input_entry", {
      field_id: "chat_input_trial",
      current_page: "Home_USRoW",
    });
  };

  const handleBlur = () => {
    if (!value && !hasCompletedCycle) {
      setIsInputFocused(false);
    } else if (!value && hasCompletedCycle) {
      setIsInputFocused(false);
      setDisplayedText(finalPlaceholder);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (!hasStartedTyping.current && newValue.length > 0) {
      hasStartedTyping.current = true;
      track("form_start", {
        field_id: "chat_input_trial",
        started_with: "text",
      });
    }

    setValue(newValue);
  };

  const handleSend = () => {
    const trimmed = value.trim() || "Hello August";

    track("send_message", {
      message_type: "text",
      source_field_id: "chat_input_trial",
    });

    const encoded = encodeURIComponent(trimmed);
    const detectedCountry = checkCountry();

    // Fire Meta Pixel Lead event for US visitors only
    if (detectedCountry === "US" && typeof (window as Window & { fbq?: (...args: unknown[]) => void }).fbq === "function") {
      (window as Window & { fbq?: (...args: unknown[]) => void }).fbq!("track", "Lead");
    }

    if (detectedCountry === "IN") {
      window.open(`/join/wa?message=${encoded}&utm=page_cta`, "_self");
    } else {
      window.open(`/chat?msg=${encoded}`, "_self");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Shared textarea styles
  const textareaStyles: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    fontFamily: "Manrope, sans-serif",
    fontSize: isMobile ? 16 : 22,
    fontWeight: 400,
    lineHeight: isMobile ? "24px" : "33px",
    letterSpacing: "0px",
    color: "#000",
    background: "transparent",
    resize: "none",
    overflow: "auto",
    position: "relative",
    zIndex: 2,
    minHeight: isMobile ? "24px" : "33px",
    maxHeight: isMobile ? "72px" : "99px",
    paddingRight: 10,
    boxSizing: "border-box" as const,
  };

  // Shared placeholder overlay
  const placeholderOverlay = !value && (
    <div
      style={{
        position: "absolute",
        left: isMobile ? 18 : 30,
        top: isMobile ? 14 : 16,
        pointerEvents: "none",
        color: "#A0A7A5",
        fontFamily: "Manrope, sans-serif",
        fontSize: isMobile ? 16 : 22,
        fontWeight: 400,
        lineHeight: isMobile ? "24px" : "33px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Cursor BEFORE text when cycle is complete */}
      {hasCompletedCycle && !isInputFocused && !value && (
        <span
          style={{
            display: "inline-block",
            width: isMobile ? "1px" : "0.8px",
            height: "1.3em",
            marginLeft: "-5px",
            marginRight: "5px",
            color: "black",
            backgroundColor: "black",
            animation: "blink 1s step-end infinite",
          }}
        />
      )}
      <span>{displayedText}</span>
      {/* Cursor AFTER text during the typing animation */}
      {!hasCompletedCycle && !isLastPlaceholder && !isInputFocused && !value && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "0.9em",
            backgroundColor: "#A0A7A5",
            marginRight: "2px",
            animation: "blink 1s step-end infinite",
          }}
        />
      )}
    </div>
  );

  const globalStyles = (
    <style>{`
      textarea::placeholder { color: transparent; }
      textarea::-webkit-scrollbar { width: 6px; }
      textarea::-webkit-scrollbar-track { background: transparent; }
      textarea::-webkit-scrollbar-thumb { background: #D1D5D4; border-radius: 3px; }
      textarea::-webkit-scrollbar-thumb:hover { background: #A0A7A5; }
      @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      @keyframes shimmer { 0% { transform: translateX(0%); } 20% { transform: translateX(200%); } 100% { transform: translateX(200%); } }
    `}</style>
  );

  if (isMobile) {
    return (
      <div ref={chatWidgetRef} style={{ width: "100%", margin: "0 auto", position: "relative" }}>
        {/* Input Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "100px",
            borderRadius: "12px",
            border: "1px solid #E8EBEA",
            background: "#FFF",
            boxShadow:
              "0 45px 13px rgba(0,0,0,0), 0 29px 11px rgba(0,0,0,0), 0 16px 10px rgba(0,0,0,0.02), 0 7px 7px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "12px 12px 12px 12px",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={onKeyDown}
              placeholder=""
              aria-label="Ask a health question"
              style={textareaStyles}
            />
            {placeholderOverlay}
          </div>
        </div>

        {/* Button — below input, full width, pill shape */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingRight: "18px",
            paddingLeft: "18px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleSend}
            style={{
              width: "100%",
              height: "auto",
              padding: "16px 32px",
              borderRadius: "40px",
              border: "none",
              background: "linear-gradient(to bottom, #2D9B77, #206E55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "opacity 0.2s",
              fontFamily: "Manrope, sans-serif",
              fontSize: "16px",
              fontWeight: 1000,
              color: "white",
              whiteSpace: "nowrap",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                animation: "shimmer 6s infinite",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>Ask August</span>
            <span style={{ position: "relative", zIndex: 1, display: "inline-flex", transform: "translateY(-2px)" }}>
              <SendIcon className="rotate-[-46deg]" size="12" />
            </span>
          </button>
        </div>

        {globalStyles}
      </div>
    );
  }

  // Desktop
  return (
    <div ref={chatWidgetRef} style={{ width: "100%", margin: "0 auto", position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          borderRadius: "24px",
          border: "1px solid #E8EBEA",
          background: "#FFF",
          boxShadow:
            "0 45px 13px rgba(0,0,0,0), 0 29px 11px rgba(0,0,0,0), 0 16px 10px rgba(0,0,0,0.02), 0 7px 7px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Textarea Row */}
        <div
          style={{
            width: "100%",
            padding: "16px 24px 0 24px",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            placeholder=""
            aria-label="Ask a health question"
            style={textareaStyles}
          />
          {placeholderOverlay}
        </div>

        {/* Button Row — fixed at bottom */}
        <div
          style={{
            width: "100%",
            padding: "12px 24px 12px 24px",
            display: "flex",
            justifyContent: "flex-end",
            boxSizing: "border-box",
          }}
        >
          <button
            onClick={handleSend}
            style={{
              height: "auto",
              padding: "16px 32px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(to bottom, #2D9B77, #206E55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              cursor: "pointer",
              transition: "opacity 0.2s",
              flexShrink: 0,
              fontFamily: "Manrope, sans-serif",
              fontSize: "18px",
              fontWeight: 1000,
              color: "white",
              whiteSpace: "nowrap",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                animation: "shimmer 6s infinite",
              }}
            />
            <span>Ask August</span>
            <span style={{ display: "inline-flex", transform: "translateY(-2px)" }}>
              <SendIcon className="rotate-[-46deg]" size="16" />
            </span>
          </button>
        </div>
      </div>

      {globalStyles}
    </div>
  );
}

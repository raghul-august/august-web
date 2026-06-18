import { memo, useCallback } from "react";
import { track } from "@/app/utils/analytics";
import { CaretRightIcon } from "@phosphor-icons/react";

interface QuickPrompt {
    label: string;
    href: string;
    toolName: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
    {
        label: "Appeal a denied claim",
        href: "/tool/appeal-assistant",
        toolName: "appeal_assistant",
    },
    {
        label: "Save on treatment costs",
        href: "/tool/cost-estimator",
        toolName: "cost_estimator",
    },
    {
        label: "Review a medical bill",
        href: "/tool/bill-analyser",
        toolName: "bill_analyser",
    },
];

const QuickPromptButtons = memo(function QuickPromptButtons() {
    const selectPrompt = useCallback((prompt: QuickPrompt) => {
        track("cta_click", {
            cta: prompt.toolName,
            tool_name: prompt.toolName,
            current_page: "Home_USRoW",
        });
        window.open(prompt.href, "_self");
    }, []);

    return (
        <div className="flex flex-row items-center justify-center gap-2 md:gap-4 mx-auto w-full flex-wrap md:flex-nowrap">
            {QUICK_PROMPTS.map((prompt) => (
                <button
                    key={prompt.toolName}
                    onClick={() => selectPrompt(prompt)}
                    className="inline-flex items-center justify-center gap-1.5 md:gap-2.5 px-3.5 py-2.5 md:px-5 md:py-3 rounded-full text-[13px] md:text-[16px] font-medium tracking-[0.01em] md:normal-case cursor-pointer transition-all duration-200 ease-out whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 active:scale-[0.97]"
                    style={{
                        color: "rgba(28, 25, 23, 0.7)",
                        background: "rgba(28, 25, 23, 0.04)",
                        border: "1px solid rgba(28, 25, 23, 0.06)",
                    }}
                >
                    <span>{prompt.label}</span>
                    <CaretRightIcon className="w-3.5 h-3.5 shrink-0" weight="bold" />
                </button>
            ))}
        </div>
    );
});

export default QuickPromptButtons;

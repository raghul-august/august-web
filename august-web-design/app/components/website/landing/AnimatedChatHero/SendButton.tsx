import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { LoaderIcon } from "lucide-react";
import { memo } from "react";

interface SendButtonProps {
    isTyping: boolean;
    onSendMessage: () => void;
}

const SendButton = memo(function SendButton({
    isTyping,
    onSendMessage,
}: SendButtonProps) {
    return (
        <button
            type="button"
            onClick={onSendMessage}
            disabled={isTyping}
            className="px-6 py-3 font-medium transition-all flex items-center gap-2 rounded-full text-white hover:brightness-110 hover:scale-[1.02] active:scale-[0.97] text-[18px] md:text-[20px]"
            style={{ background: "#206E55" }}
        >
            <span>Ask august</span>
            {isTyping ? (
                <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
            ) : (
                <PaperPlaneTiltIcon className="w-4 h-4" weight="fill" />
            )}
        </button>
    );
});

export default SendButton;

interface Props {
  currentIndex: number;
  totalQuestions: number;
  onBack: () => void;
}

export default function QuizQuestionHeader({
  currentIndex,
  totalQuestions,
  onBack,
}: Props) {
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="flex items-center justify-between w-full px-5 py-4 gap-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex items-center justify-center p-1 bg-transparent border-none cursor-pointer text-[var(--text-primary)] transition-opacity duration-150 hover:opacity-60 shrink-0"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Progress */}
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-[var(--text-secondary)] tabular-nums shrink-0">
          {currentIndex + 1}
        </span>
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--border-subtle)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: "var(--brand-primary)",
            }}
          />
        </div>
        <span className="text-sm font-medium text-[var(--text-secondary)] tabular-nums shrink-0">
          {totalQuestions}
        </span>
      </div>

      {/* Spacer to balance the back button */}
      <div className="w-5 shrink-0" />
    </div>
  );
}

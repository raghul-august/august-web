type Props = { bg?: string; spinner?: boolean };

export default function QuizSuspenseFallback({ bg = "var(--surface-page)", spinner = true }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      {spinner && (
        <div className="w-10 h-10 rounded-full border-[3px] border-[var(--brand-subtle)] border-t-[var(--brand-primary)] animate-spin" />
      )}
    </div>
  );
}

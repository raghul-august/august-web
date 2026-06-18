interface Props {
  label: string;
  tone?: "brand" | "neutral" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  brand:   "bg-[var(--brand-subtle)] text-[var(--text-brand)]",
  neutral: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
  success: "bg-[var(--success-50)] text-[var(--success-700)]",
  warning: "bg-[var(--warning-50)] text-[var(--warning-700)]",
  danger:  "bg-[var(--danger-50)] text-[var(--danger-700)]",
  info:    "bg-[var(--info-50)] text-[var(--info-700)]",
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-6 px-2.5 text-[11px]",
  md: "h-7 px-3 text-[12px]",
};

export default function TierBadge({
  label,
  tone = "brand",
  size = "md",
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full leading-[1.35] font-medium ${toneClasses[tone]} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}

"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  options: SegmentedControlOption[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  className?: string;
  buttonClassName?: string;
  activeClassName?: string;
}

// Roving tabindex segmented control - based on ChipGroup in glp1-dose-calculator/CalculatorScreen.tsx.
// ARIA: role="radiogroup" on container, role="radio" + aria-checked on buttons.
export default function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  buttonClassName,
  activeClassName,
}: Props) {
  const refs = useRef<HTMLButtonElement[]>([]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const count = refs.current.length;
      if (!count) return;
      let next = -1;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = (index + 1) % count;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = (index - 1 + count) % count;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = count - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      refs.current[next]?.focus();
    },
    [],
  );

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={className}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => { if (el) refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={opt.disabled}
            className={active && activeClassName ? `${buttonClassName ?? ""} ${activeClassName}`.trim() : (buttonClassName ?? "")}
            onClick={() => !opt.disabled && onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

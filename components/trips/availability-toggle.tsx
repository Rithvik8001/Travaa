"use client";

import { cn } from "@/lib/utils";
import type { Availability } from "@/lib/trips/dates";

const OPTIONS: readonly { value: Availability; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];

/** The caller's yes/maybe/no on one window — a quiet neutral segmented control. */
export function AvailabilityToggle({
  value,
  disabled = false,
  onSelect,
}: {
  readonly value: Availability | null;
  readonly disabled?: boolean;
  readonly onSelect: (value: Availability) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Your availability"
      className="border-hairline bg-surface-sunken inline-flex rounded-full border p-[3px]"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
            className={cn(
              "rounded-full px-[13px] py-[5px] text-[12.5px] font-medium transition-colors disabled:opacity-55",
              active
                ? "bg-surface text-ink shadow-card"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

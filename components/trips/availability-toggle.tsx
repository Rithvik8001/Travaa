"use client";

import { SegmentedGroup, segmentedItemClass } from "@/components/ui/segmented";
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
    <SegmentedGroup aria-label="Your availability">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
            className={segmentedItemClass(active, "disabled:opacity-55")}
          >
            {option.label}
          </button>
        );
      })}
    </SegmentedGroup>
  );
}

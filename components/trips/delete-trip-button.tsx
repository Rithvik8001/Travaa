"use client";

import { useState, useTransition } from "react";

/**
 * Permanent delete with an inline two-step confirm — no dialog primitive, no
 * native confirm(). First click arms; Delete runs the bound server action.
 */
export function DeleteTripButton({
  action,
}: {
  /** Bound `deleteTrip`. Redirects to the dashboard on success. */
  readonly action: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-danger text-[13.5px] font-medium hover:underline"
      >
        Delete permanently
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[13.5px]">
      <span className="text-muted-foreground">Delete this trip for good?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => action())}
        className="text-danger font-medium hover:underline disabled:opacity-55"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="text-muted-foreground hover:text-ink disabled:opacity-55"
      >
        Cancel
      </button>
    </div>
  );
}

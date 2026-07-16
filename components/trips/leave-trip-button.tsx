"use client";

import { useState, useTransition } from "react";

/** Member leaves a trip, with an inline confirm (rejoining needs the invite link again). */
export function LeaveTripButton({
  action,
}: {
  /** Bound `leaveTrip`. Redirects to the dashboard on success. */
  readonly action: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-muted-foreground hover:text-ink text-[13.5px] font-medium"
      >
        Leave trip
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[13.5px]">
      <span className="text-muted-foreground">Leave this trip?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => action())}
        className="text-danger font-medium hover:underline disabled:opacity-55"
      >
        {pending ? "Leaving…" : "Leave"}
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

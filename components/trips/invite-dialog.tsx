"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { avatarColor } from "@/lib/avatar-color";
import { ensureInviteCode, rotateInviteCode } from "@/lib/trips/actions";
import type { TripMemberView } from "@/lib/trips/queries";

interface InviteDialogProps {
  readonly tripId: string;
  readonly tripName: string;
  readonly initialCode: string | null;
  readonly members: readonly TripMemberView[];
}

export function InviteDialog({
  tripId,
  tripName,
  initialCode,
  members,
}: InviteDialogProps) {
  const [code, setCode] = useState<string | null>(initialCode);
  // Dialog content mounts on open (post-hydration), so window is available here.
  const [origin] = useState(() =>
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const link = code ? `${origin}/j/${code}` : "";

  function generateIfNeeded(open: boolean) {
    if (open && !code) {
      startTransition(async () => {
        const res = await ensureInviteCode(tripId);
        if ("code" in res) setCode(res.code);
      });
    }
  }

  function reset() {
    startTransition(async () => {
      const res = await rotateInviteCode(tripId);
      if ("code" in res) {
        setCode(res.code);
        setCopied(false);
      }
    });
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog.Root onOpenChange={generateIfNeeded}>
      <Dialog.Trigger className="text-brand-ink cursor-pointer text-[13.5px] font-medium hover:underline">
        Invite
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[oklch(0.2_0.02_90/0.32)] backdrop-blur-[3px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="bg-surface shadow-dialog animate-pop fixed top-1/2 left-1/2 z-50 w-[calc(100%-48px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px]">
          <div className="border-hairline border-b px-6 pt-6 pb-[18px]">
            <Dialog.Title className="text-ink text-[18px] font-semibold tracking-[-0.02em]">
              Invite to {tripName}
            </Dialog.Title>
            <Dialog.Description className="text-subtle-foreground mt-0.5 text-[13.5px]">
              Anyone with the link can join.
            </Dialog.Description>
          </div>

          <div className="px-6 py-5">
            <div className="flex gap-2">
              <div className="border-hairline bg-background text-muted-foreground flex-1 overflow-hidden rounded-[11px] border px-[14px] py-[11px] text-[13.5px] text-ellipsis whitespace-nowrap">
                {code ? link || `…/j/${code}` : "Generating link…"}
              </div>
              <button
                type="button"
                onClick={copy}
                disabled={!code}
                className="bg-primary text-primary-foreground hover:bg-ink shrink-0 rounded-[11px] px-4 text-[13.5px] font-medium transition-colors disabled:opacity-55"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="border-hairline bg-background mt-3 flex items-center gap-3 rounded-[11px] border px-[14px] py-3">
              <span className="text-subtle-foreground text-[13px]">Or share code</span>
              <span className="text-ink text-[17px] font-semibold tracking-[0.18em] tabular-nums">
                {code ?? "····"}
              </span>
              <button
                type="button"
                onClick={reset}
                disabled={pending}
                className="text-muted-foreground hover:text-ink ml-auto text-[13px] disabled:opacity-55"
              >
                Reset link
              </button>
            </div>

            <div className="text-subtle-foreground mt-5 mb-2 text-[12px] font-semibold tracking-[0.05em] uppercase">
              Members
            </div>
            <div className="flex flex-col gap-0.5">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-[11px] py-[7px]">
                  <Avatar
                    initial={m.name.slice(0, 1).toUpperCase()}
                    color={avatarColor(m.id)}
                    className="size-[30px] text-[12px]"
                  />
                  <span className="text-foreground flex-1 truncate text-[14.5px]">
                    {m.name}
                  </span>
                  <span className="text-subtle-foreground text-[12.5px]">
                    {m.isOwner ? "Organizer" : "Member"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-[22px]">
            <Dialog.Close className="border-border text-foreground hover:bg-surface-sunken w-full cursor-pointer rounded-[12px] border bg-transparent py-[11px] text-[14.5px] font-medium transition-colors">
              Done
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

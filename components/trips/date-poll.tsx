"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionItem, PresenceList } from "@/components/ui/motion";
import { AvailabilityToggle } from "@/components/trips/availability-toggle";
import { ProposeWindowForm } from "@/components/trips/propose-window-form";
import { avatarColor } from "@/lib/avatar-color";
import { formatWindow } from "@/lib/trips/format";
import {
  AVAILABILITY_COLOR,
  nights,
  rankOptions,
  type Availability,
  type DateOptionView,
} from "@/lib/trips/dates";
import type { TripMemberView } from "@/lib/trips/queries";
import {
  lockDates,
  removeDateOption,
  setAvailability,
  unlockDates,
} from "@/lib/trips/actions";
import { cn } from "@/lib/utils";

interface DatePollProps {
  readonly tripId: string;
  readonly options: readonly DateOptionView[];
  readonly members: readonly TripMemberView[];
  readonly currentUserId: string;
  readonly isOrganizer: boolean;
  /** Archived trip — the whole poll is read-only. */
  readonly readOnly: boolean;
  /** Committed window, set when the organizer has locked the dates. */
  readonly lockedWindow: { startDate: string; endDate: string } | null;
}

function shortWeekday(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function windowMeta(startDate: string, endDate: string): string {
  const n = nights(startDate, endDate);
  const span = `${shortWeekday(startDate)}–${shortWeekday(endDate)}`;
  return `${span} · ${n} night${n === 1 ? "" : "s"}`;
}

export function DatePoll({
  tripId,
  options,
  members,
  currentUserId,
  isOrganizer,
  readOnly,
  lockedWindow,
}: DatePollProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const locked = lockedWindow !== null;
  const editable = !readOnly && !locked;
  const ranked = rankOptions(options);

  function run(action: () => Promise<{ error: string } | void>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section id="dates" className="scroll-mt-24">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Eyebrow className="mb-2">Dates</Eyebrow>
          <h2 className="text-ink text-[19px] font-semibold tracking-[-0.02em]">
            When are we going?
          </h2>
          <p className="text-subtle-foreground mt-0.5 text-[13.5px]">
            {locked
              ? "The window's locked in."
              : editable
                ? "Propose windows, mark who's free, then lock the winner."
                : "Everyone's availability across the proposed windows."}
          </p>
        </div>
        {locked ? (
          <Badge tone="soft" size="sm" className="shrink-0">
            Locked
          </Badge>
        ) : null}
      </div>

      {locked && lockedWindow ? (
        <Card className="mb-4 flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-ink text-[16px] font-semibold tracking-[-0.01em]">
              {formatWindow(lockedWindow.startDate, lockedWindow.endDate)}
            </div>
            <div className="text-subtle-foreground mt-[3px] font-mono text-[12px]">
              {windowMeta(lockedWindow.startDate, lockedWindow.endDate)}
            </div>
          </div>
          {isOrganizer && !readOnly ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => unlockDates(tripId))}
              className="text-muted-foreground hover:text-ink shrink-0 text-[13px] font-medium disabled:opacity-55"
            >
              Reopen poll
            </button>
          ) : null}
        </Card>
      ) : null}

      {ranked.length === 0 ? (
        <Card>
          <p className="text-subtle-foreground mx-auto max-w-[42ch] px-5 py-10 text-center text-[14px] leading-[1.55]">
            No dates on the table yet.{" "}
            {editable
              ? "Float a window below — the crew can weigh in with a tap."
              : "Nothing's been proposed."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <PresenceList>
            {ranked.map((option) => {
              const isLockedOption =
                locked &&
                lockedWindow?.startDate === option.startDate &&
                lockedWindow?.endDate === option.endDate;
              const canRemove =
                editable && (isOrganizer || option.createdBy === currentUserId);

              return (
                <MotionItem key={option.id}>
                  <Card
                    className={cn(
                      "px-5 py-[18px]",
                      isLockedOption && "border-border-strong ring-ring/40 ring-2",
                    )}
                  >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-ink text-[16px] font-semibold tracking-[-0.01em]">
                        {formatWindow(option.startDate, option.endDate)}
                      </span>
                      {option.bestFit ? (
                        <Badge tone="accent" size="sm">
                          Best fit
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-subtle-foreground mt-[3px] font-mono text-[12px]">
                      {windowMeta(option.startDate, option.endDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-ink text-[17px] font-semibold tabular-nums">
                      {option.counts.available}/{option.counts.total}
                    </div>
                    <div className="text-subtle-foreground font-mono text-[10px] tracking-[0.06em] uppercase">
                      available
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-[7px]">
                  {members.map((member) => {
                    const response = option.responses[member.id];
                    return (
                      <Avatar
                        key={member.id}
                        initial={member.name.slice(0, 1).toUpperCase()}
                        color={avatarColor(member.id)}
                        status={response ? AVAILABILITY_COLOR[response] : undefined}
                        dimmed={!response || response === "no"}
                        className="size-[30px] text-[12px]"
                      />
                    );
                  })}
                </div>

                {editable ? (
                  <div className="border-hairline mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <AvailabilityToggle
                      value={option.myValue}
                      disabled={pending}
                      onSelect={(value: Availability) =>
                        run(() => setAvailability(option.id, value))
                      }
                    />
                    <div className="flex items-center gap-4">
                      {canRemove ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => removeDateOption(option.id))}
                          className="text-subtle-foreground hover:text-danger text-[12.5px] transition-colors disabled:opacity-55"
                        >
                          Remove
                        </button>
                      ) : null}
                      {isOrganizer ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => lockDates(tripId, option.id))}
                          className="text-ink text-[13px] font-medium underline decoration-[oklch(0_0_0/0.2)] decoration-1 underline-offset-[3px] transition-colors hover:decoration-ink disabled:opacity-55"
                        >
                          Lock these dates
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                  </Card>
                </MotionItem>
              );
            })}
          </PresenceList>
        </div>
      )}

      {editable ? <ProposeWindowForm tripId={tripId} /> : null}

      {error ? (
        <p role="alert" className="text-danger mt-3 text-[13px]">
          {error}
        </p>
      ) : null}
    </section>
  );
}

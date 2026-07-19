"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionItem, PresenceList } from "@/components/ui/motion";
import { CommentThread } from "@/components/trips/comment-thread";
import { SuggestionForm } from "@/components/trips/suggestion-form";
import { avatarColor } from "@/lib/avatar-color";
import { rankSuggestions, type SuggestionView } from "@/lib/trips/suggestions";
import type { TripMemberView } from "@/lib/trips/queries";
import {
  convertSuggestion,
  removeSuggestion,
  toggleSuggestionVote,
} from "@/lib/trips/actions";
import { cn } from "@/lib/utils";

interface SuggestionListProps {
  readonly tripId: string;
  readonly suggestions: readonly SuggestionView[];
  readonly members: readonly TripMemberView[];
  readonly currentUserId: string;
  readonly isOrganizer: boolean;
  /** Archived trip — the whole board is read-only. */
  readonly readOnly: boolean;
  readonly initialExpandedSuggestionId?: string;
}

export function SuggestionList({
  tripId,
  suggestions,
  members,
  currentUserId,
  isOrganizer,
  readOnly,
  initialExpandedSuggestionId,
}: SuggestionListProps) {
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    new Set(initialExpandedSuggestionId ? [initialExpandedSuggestionId] : []),
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const ranked = rankSuggestions(suggestions);
  const memberById = new Map(members.map((m) => [m.id, m]));

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
    <section id="ideas" className="scroll-mt-24">
      <div className="mb-4">
        <Eyebrow className="mb-2">Ideas</Eyebrow>
        <h2 className="text-ink text-[19px] font-semibold tracking-[-0.02em]">
          What should we do?
        </h2>
        <p className="text-subtle-foreground mt-0.5 text-[13.5px]">
          {readOnly
            ? "What the crew was tossing around."
            : "Drop in places, stays and links — upvote the ones you love."}
        </p>
      </div>

      {ranked.length === 0 ? (
        <Card>
          <p className="text-subtle-foreground mx-auto max-w-[42ch] px-5 py-10 text-center text-[14px] leading-[1.55]">
            The idea board is wide open.{" "}
            {readOnly
              ? "Nothing was suggested."
              : "Drop the first one below and let the crew rally behind it."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <PresenceList>
            {ranked.map((suggestion) => {
              const canRemove =
                !readOnly &&
                (isOrganizer || suggestion.createdBy === currentUserId);
              const isExpanded = expanded.has(suggestion.id);

              return (
                <MotionItem
                  key={suggestion.id}
                  id={`idea-${suggestion.id}`}
                  className="scroll-mt-24"
                >
                  <Card className="px-5 py-[18px]">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    disabled={readOnly || pending}
                    aria-pressed={suggestion.myVote}
                    aria-label={suggestion.myVote ? "Remove your vote" : "Upvote"}
                    onClick={() =>
                      run(() => toggleSuggestionVote(suggestion.id))
                    }
                    className={cn(
                      "flex w-[52px] shrink-0 flex-col items-center gap-1 rounded-[6px] border py-2 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96]",
                      suggestion.myVote
                        ? "border-ink bg-ink text-background"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-ink",
                      "disabled:opacity-55 disabled:hover:border-border",
                    )}
                  >
                    <span aria-hidden className="text-[12px] leading-none">
                      ▲
                    </span>
                    <span className="text-[15px] font-semibold tabular-nums">
                      {suggestion.votes}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {suggestion.url ? (
                        <a
                          href={suggestion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink text-[16px] font-semibold tracking-[-0.01em] break-words underline-offset-2 hover:underline"
                        >
                          {suggestion.title}
                        </a>
                      ) : (
                        <span className="text-ink text-[16px] font-semibold tracking-[-0.01em] break-words">
                          {suggestion.title}
                        </span>
                      )}
                      {suggestion.topPick ? (
                        <Badge tone="accent" size="sm">
                          Top pick
                        </Badge>
                      ) : null}
                    </div>
                    {suggestion.note ? (
                      <p className="text-muted-foreground mt-1 text-[14px] leading-[1.5] break-words">
                        {suggestion.note}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <span className="text-subtle-foreground text-[12.5px]">
                          Added by {suggestion.createdByName}
                        </span>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleExpanded(suggestion.id)}
                          className="text-subtle-foreground hover:text-ink text-[12.5px] transition-colors"
                        >
                          {suggestion.commentCount > 0
                            ? `${suggestion.commentCount} comment${
                                suggestion.commentCount === 1 ? "" : "s"
                              }`
                            : "Comment"}
                        </button>
                        {suggestion.converted ? (
                          <Badge tone="soft" size="sm">
                            Added to itinerary
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        {suggestion.voters.length > 0 ? (
                          <div className="flex flex-wrap gap-[5px]">
                            {suggestion.voters.map((voterId) => {
                              const voter = memberById.get(voterId);
                              if (!voter) return null;
                              return (
                                <Avatar
                                  key={voterId}
                                  initial={voter.name.slice(0, 1).toUpperCase()}
                                  color={avatarColor(voterId)}
                                  className="size-[26px] text-[11px]"
                                />
                              );
                            })}
                          </div>
                        ) : null}
                        {isOrganizer && !readOnly && !suggestion.converted ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              run(() => convertSuggestion(suggestion.id))
                            }
                            className="text-ink text-[12.5px] font-medium underline decoration-[oklch(0_0_0/0.2)] decoration-1 underline-offset-[3px] transition-colors hover:decoration-ink disabled:opacity-55"
                          >
                            Add to itinerary
                          </button>
                        ) : null}
                        {canRemove ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              run(() => removeSuggestion(suggestion.id))
                            }
                            className="text-subtle-foreground hover:text-danger text-[12.5px] transition-colors disabled:opacity-55"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {isExpanded ? (
                      <CommentThread
                        suggestionId={suggestion.id}
                        comments={suggestion.comments}
                        currentUserId={currentUserId}
                        isOrganizer={isOrganizer}
                        readOnly={readOnly}
                      />
                    ) : null}
                  </div>
                </div>
                  </Card>
                </MotionItem>
              );
            })}
          </PresenceList>
        </div>
      )}

      {!readOnly ? <SuggestionForm tripId={tripId} /> : null}

      {error ? (
        <p role="alert" className="text-danger mt-3 text-[13px]">
          {error}
        </p>
      ) : null}
    </section>
  );
}

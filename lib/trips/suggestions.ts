/**
 * Pure ideas-board helpers — no `server-only`, so the client island and the server
 * query share the vocabulary. Mirrors the shape of lib/trips/dates.ts: a read view
 * plus a ranking pass that flags the leading pick.
 */

/** A comment or reply on an idea. Replies are one level deep only. */
export interface CommentView {
  readonly id: string;
  readonly body: string;
  readonly createdBy: string;
  readonly createdByName: string;
  /** ISO timestamp; the client renders it with timeAgo(). */
  readonly createdAt: string;
  /** Replies to a top-level comment; always empty on a reply itself. */
  readonly replies: readonly CommentView[];
}

export interface SuggestionView {
  readonly id: string;
  readonly title: string;
  readonly note: string | null;
  readonly url: string | null;
  readonly createdBy: string;
  readonly createdByName: string;
  /** Upvote tally. */
  readonly votes: number;
  /** Member ids who upvoted, for the avatar stack. */
  readonly voters: readonly string[];
  /** Whether the caller has upvoted. */
  readonly myVote: boolean;
  /** Top-level comments, newest first, each with its replies. */
  readonly comments: readonly CommentView[];
  /** Total comments including replies. */
  readonly commentCount: number;
  /** Whether this idea has been promoted to the itinerary. */
  readonly converted: boolean;
}

export interface RankedSuggestion extends SuggestionView {
  /** The front-runner once there's a vote and something to beat. */
  readonly topPick: boolean;
}

/**
 * Rank ideas by upvotes, newest first on a tie. Callers pass options already in
 * newest-first order so the stable sort preserves recency for equal tallies. The
 * top idea is flagged `topPick` once it has a vote and there's more than one idea.
 */
export function rankSuggestions(
  items: readonly SuggestionView[],
): RankedSuggestion[] {
  const sorted = [...items].sort((a, b) => b.votes - a.votes);

  return sorted.map((item, i) => ({
    ...item,
    topPick: i === 0 && sorted.length > 1 && item.votes > 0,
  }));
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { avatarColor } from "@/lib/avatar-color";
import { timeAgo } from "@/lib/trips/format";
import type { CommentView } from "@/lib/trips/suggestions";
import { addComment, removeComment } from "@/lib/trips/actions";

interface CommentThreadProps {
  readonly suggestionId: string;
  readonly comments: readonly CommentView[];
  readonly currentUserId: string;
  readonly isOrganizer: boolean;
  readonly readOnly: boolean;
}

export function CommentThread({
  suggestionId,
  comments,
  currentUserId,
  isOrganizer,
  readOnly,
}: CommentThreadProps) {
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(
    action: () => Promise<{ error: string } | void>,
    onDone?: () => void,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="border-hairline mt-4 border-t pt-4">
      {comments.length > 0 ? (
        <ul className="flex flex-col gap-3.5">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Comment
                comment={comment}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
                readOnly={readOnly}
                pending={pending}
                onDelete={() => run(() => removeComment(comment.id))}
                onReply={
                  readOnly
                    ? undefined
                    : () =>
                        setReplyTo((id) =>
                          id === comment.id ? null : comment.id,
                        )
                }
              />

              {comment.replies.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-3.5 pl-[34px]">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <Comment
                        comment={reply}
                        currentUserId={currentUserId}
                        isOrganizer={isOrganizer}
                        readOnly={readOnly}
                        pending={pending}
                        onDelete={() => run(() => removeComment(reply.id))}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}

              {replyTo === comment.id ? (
                <div className="mt-3 pl-[34px]">
                  <CommentInput
                    placeholder={`Reply to ${comment.createdByName}…`}
                    pending={pending}
                    onSubmit={(body) =>
                      run(
                        () => addComment(suggestionId, body, comment.id),
                        () => setReplyTo(null),
                      )
                    }
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!readOnly ? (
        <div className={comments.length > 0 ? "mt-4" : ""}>
          <CommentInput
            placeholder="Add a comment…"
            pending={pending}
            onSubmit={(body) => run(() => addComment(suggestionId, body))}
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface CommentProps {
  readonly comment: CommentView;
  readonly currentUserId: string;
  readonly isOrganizer: boolean;
  readonly readOnly: boolean;
  readonly pending: boolean;
  readonly onDelete: () => void;
  readonly onReply?: () => void;
}

function Comment({
  comment,
  currentUserId,
  isOrganizer,
  pending,
  onDelete,
  onReply,
}: CommentProps) {
  const canRemove = comment.createdBy === currentUserId || isOrganizer;

  return (
    <div className="flex gap-2.5">
      <Avatar
        initial={comment.createdByName.slice(0, 1).toUpperCase()}
        color={avatarColor(comment.createdBy)}
        className="mt-0.5 size-[24px] text-[10.5px]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-ink text-[13.5px] font-medium">
            {comment.createdByName}
          </span>
          <span className="text-subtle-foreground text-[12px]">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-foreground mt-0.5 text-[14px] leading-[1.5] break-words">
          {comment.body}
        </p>
        <div className="mt-1 flex items-center gap-3.5">
          {onReply ? (
            <button
              type="button"
              disabled={pending}
              onClick={onReply}
              className="text-subtle-foreground hover:text-ink text-[12px] transition-colors disabled:opacity-55"
            >
              Reply
            </button>
          ) : null}
          {canRemove ? (
            <button
              type="button"
              disabled={pending}
              onClick={onDelete}
              className="text-subtle-foreground hover:text-danger text-[12px] transition-colors disabled:opacity-55"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface CommentInputProps {
  readonly placeholder: string;
  readonly pending: boolean;
  readonly onSubmit: (body: string) => void;
}

function CommentInput({ placeholder, pending, onSubmit }: CommentInputProps) {
  const [body, setBody] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setBody("");
  }

  return (
    <form onSubmit={submit} className="flex items-start gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={1}
        maxLength={1000}
        className="border-hairline bg-surface-sunken text-ink placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:bg-surface focus-visible:ring-ring/20 min-h-[38px] flex-1 resize-y rounded-[10px] border px-3 py-[9px] text-[14px] transition-[border-color,background,box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:outline-none"
      />
      <button
        type="submit"
        disabled={pending || body.trim().length === 0}
        className="text-brand-ink shrink-0 py-[9px] text-[13px] font-medium hover:underline disabled:opacity-55 disabled:hover:no-underline"
      >
        Post
      </button>
    </form>
  );
}

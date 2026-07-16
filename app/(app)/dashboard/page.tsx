import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { Wordmark } from "@/components/ui/wordmark";
import { avatarColor } from "@/lib/avatar-color";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requireSession();
  const handle = user.displayUsername ?? user.name;

  return (
    <main className="mx-auto w-full max-w-[680px] px-6 pt-10 pb-20">
      <header className="mb-11 flex items-center justify-between">
        <Wordmark markClassName="size-6" />
        <div className="flex items-center gap-[18px]">
          <SignOutButton />
          <Avatar
            initial={handle.slice(0, 1).toUpperCase()}
            color={avatarColor(user.id)}
            className="size-8 text-[13px]"
          />
        </div>
      </header>

      <h1 className="text-ink text-[32px] font-semibold tracking-[-0.025em]">
        Your trips
      </h1>
      {/* Becomes the trip-count summary ("3 upcoming · 1 in planning") once trips land. */}
      <p className="text-subtle-foreground mt-1 mb-[30px] text-[15px]">
        Nothing planned yet.
      </p>

      <div className="bg-surface border-hairline shadow-card overflow-hidden rounded-[18px] border">
        <p className="text-subtle-foreground mx-auto max-w-[42ch] px-5 py-11 text-center text-[14.5px] leading-[1.55]">
          Your trips will live here. Start one, share the link, and your crew can
          vote on dates before they even make an account.
        </p>
        <button
          type="button"
          disabled
          title="Lands with trips"
          className="border-hairline text-brand-ink flex w-full items-center gap-2.5 border-t px-5 py-[15px] text-left text-[14.5px] font-medium disabled:opacity-45"
        >
          <span aria-hidden className="text-[19px] leading-none">
            +
          </span>
          Start a new trip
        </button>
      </div>
    </main>
  );
}

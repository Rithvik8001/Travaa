import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { TripListRow } from "@/components/trips/trip-list-row";
import { Avatar } from "@/components/ui/avatar";
import { Wordmark } from "@/components/ui/wordmark";
import { avatarColor } from "@/lib/avatar-color";
import { listTripsForUser } from "@/lib/trips/queries";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requireSession();
  const handle = user.displayUsername ?? user.name;
  const trips = await listTripsForUser(user.id);

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
      <p className="text-subtle-foreground mt-1 mb-[30px] text-[15px]">
        {trips.length === 0
          ? "Nothing planned yet."
          : `${trips.length} trip${trips.length === 1 ? "" : "s"}`}
      </p>

      <div className="bg-surface border-hairline shadow-card overflow-hidden rounded-[18px] border">
        {trips.length === 0 ? (
          <p className="text-subtle-foreground mx-auto max-w-[42ch] px-5 py-11 text-center text-[14.5px] leading-[1.55]">
            Your trips will live here. Start one, share the link, and your crew
            can vote on dates before they even make an account.
          </p>
        ) : (
          trips.map((trip) => <TripListRow key={trip.id} trip={trip} />)
        )}
        <Link
          href="/trips/new"
          className="border-hairline hover:bg-surface-sunken text-brand-ink flex w-full items-center gap-2.5 border-t px-5 py-[15px] text-left text-[14.5px] font-medium transition-colors"
        >
          <span aria-hidden className="text-[19px] leading-none">
            +
          </span>
          Start a new trip
        </Link>
      </div>
    </main>
  );
}

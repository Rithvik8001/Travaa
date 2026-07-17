import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DatePoll } from "@/components/trips/date-poll";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { InviteDialog } from "@/components/trips/invite-dialog";
import { LeaveTripButton } from "@/components/trips/leave-trip-button";
import { MemberStack } from "@/components/trips/member-stack";
import { avatarColor } from "@/lib/avatar-color";
import { deleteTrip, leaveTrip, unarchiveTrip } from "@/lib/trips/actions";
import { getDatePoll, getTripForUser, listTripMembers } from "@/lib/trips/queries";
import { formatWindow, relativeToNow } from "@/lib/trips/format";
import { requireSession } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const session = await requireSession();
  const trip = await getTripForUser(tripId, session.user.id);
  return { title: trip?.name ?? "Trip" };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const { user } = await requireSession();

  const trip = await getTripForUser(tripId, user.id);
  if (!trip) notFound();

  const [members, datePoll] = await Promise.all([
    listTripMembers(tripId),
    getDatePoll(tripId, user.id),
  ]);
  const isArchived = Boolean(trip.archivedAt);
  const isOwner = trip.ownerId === user.id;
  const lockedWindow =
    trip.datesLockedAt && trip.startDate && trip.endDate
      ? { startDate: trip.startDate, endDate: trip.endDate }
      : null;
  const window = formatWindow(trip.startDate, trip.endDate);
  const relative = relativeToNow(trip.startDate);
  const subtitle = [window, trip.destination].filter(Boolean).join(" · ");

  return (
    <div>
      {/* Sticky bar — the trip screen's one piece of chrome (AGENTS.md). */}
      <div className="bg-background/80 border-hairline sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="mx-auto flex h-[54px] max-w-[760px] items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-ink flex items-center gap-[7px] text-[14.5px] transition-colors"
          >
            <span aria-hidden className="text-[17px] leading-none">
              ‹
            </span>
            Trips
          </Link>
          <div className="flex items-center gap-[14px]">
            {isOwner && !isArchived ? (
              <InviteDialog
                tripId={trip.id}
                tripName={trip.name}
                initialCode={trip.inviteCode}
                members={members}
              />
            ) : null}
            {isOwner ? (
              isArchived ? (
                <form action={unarchiveTrip.bind(null, trip.id)}>
                  <button
                    type="submit"
                    className="text-brand-ink text-[13.5px] font-medium hover:underline"
                  >
                    Unarchive
                  </button>
                </form>
              ) : (
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="text-brand-ink text-[13.5px] font-medium hover:underline"
                >
                  Edit
                </Link>
              )
            ) : null}
            <Link
              href="/settings"
              aria-label="Your profile"
              className="rounded-full transition-opacity hover:opacity-90"
            >
              <Avatar
                initial={user.name.slice(0, 1).toUpperCase()}
                color={avatarColor(user.id)}
                className="size-[30px] text-[12.5px]"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[760px] flex-wrap items-start justify-between gap-4 px-6 pt-[30px]">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span
              className={
                isArchived
                  ? "text-muted-foreground bg-muted rounded-full px-2.5 py-[3.5px] text-[10.5px] font-semibold tracking-[0.02em] uppercase"
                  : "text-brand-ink bg-brand/10 rounded-full px-2.5 py-[3.5px] text-[10.5px] font-semibold tracking-[0.02em] uppercase"
              }
            >
              {isArchived ? "Archived" : "Planning"}
            </span>
            {!isArchived && relative ? (
              <span className="text-subtle-foreground text-[13px]">{relative}</span>
            ) : null}
          </div>
          <h1 className="text-ink text-[30px] font-semibold tracking-[-0.03em]">
            {trip.name}
          </h1>
          {subtitle ? (
            <p className="text-muted-foreground mt-1.5 text-[15px]">{subtitle}</p>
          ) : null}
        </div>
        <div className="pt-1">
          <MemberStack members={members} />
        </div>
      </div>

      <div className="mx-auto max-w-[760px] px-6 pt-[26px] pb-[90px]">
        <DatePoll
          tripId={trip.id}
          options={datePoll}
          members={members}
          currentUserId={user.id}
          isOrganizer={isOwner}
          readOnly={isArchived}
          lockedWindow={lockedWindow}
        />

        {isOwner && isArchived ? (
          <div className="mt-6 flex justify-center">
            <DeleteTripButton action={deleteTrip.bind(null, trip.id)} />
          </div>
        ) : null}

        {!isOwner ? (
          <div className="mt-6 flex justify-center">
            <LeaveTripButton action={leaveTrip.bind(null, trip.id)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

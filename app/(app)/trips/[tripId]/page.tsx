import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DatePoll } from "@/components/trips/date-poll";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { InviteDialog } from "@/components/trips/invite-dialog";
import { LeaveTripButton } from "@/components/trips/leave-trip-button";
import { SuggestionList } from "@/components/trips/suggestion-list";
import { ItineraryList } from "@/components/trips/itinerary-list";
import { avatarColor } from "@/lib/avatar-color";
import { deleteTrip, leaveTrip, unarchiveTrip } from "@/lib/trips/actions";
import {
  getDatePoll,
  getSuggestions,
  getItinerary,
  getTripForUser,
  listTripMembers,
} from "@/lib/trips/queries";
import { tripCover } from "@/lib/trips/cover";
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

  const [members, datePoll, suggestions, itinerary] = await Promise.all([
    listTripMembers(tripId),
    getDatePoll(tripId, user.id),
    getSuggestions(tripId, user.id),
    getItinerary(tripId),
  ]);
  const isArchived = Boolean(trip.archivedAt);
  const isOwner = trip.ownerId === user.id;
  const lockedWindow =
    trip.datesLockedAt && trip.startDate && trip.endDate
      ? { startDate: trip.startDate, endDate: trip.endDate }
      : null;
  const window = formatWindow(trip.startDate, trip.endDate);
  const relative = relativeToNow(trip.startDate);

  return (
    <div className="min-h-full">
      {/* Sticky bar — the trip screen's one piece of chrome. */}
      <div className="border-hairline bg-background/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="mx-auto flex h-[58px] w-full max-w-[1120px] items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-ink group flex items-center gap-1.5 text-[14px] transition-colors"
          >
            <span
              aria-hidden
              className="text-[17px] leading-none transition-transform group-hover:-translate-x-0.5"
            >
              ‹
            </span>
            Trips
          </Link>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[1120px] gap-8 px-6 pt-8 pb-32 min-[900px]:grid-cols-[312px_1fr]">
        {/* Identity sidebar */}
        <aside className="self-start min-[900px]:sticky min-[900px]:top-[82px]">
          <div className="bg-surface shadow-card overflow-hidden rounded-[18px]">
            <div
              aria-hidden
              className="relative h-[108px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]"
              style={{ background: tripCover(trip.id) }}
            >
              <span
                className={
                  isArchived
                    ? "text-muted-foreground absolute top-3.5 left-4 rounded-full bg-white/90 px-2.5 py-[3.5px] text-[10px] font-semibold tracking-[0.04em] uppercase backdrop-blur-sm"
                    : "text-brand-ink absolute top-3.5 left-4 rounded-full bg-white/90 px-2.5 py-[3.5px] text-[10px] font-semibold tracking-[0.04em] uppercase backdrop-blur-sm"
                }
              >
                {isArchived ? "Archived" : "Planning"}
              </span>
            </div>

            <div className="p-5">
              <h1 className="text-ink text-[22px] leading-[1.15] font-semibold tracking-[-0.025em]">
                {trip.name}
              </h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">
                {window || "Dates to be decided"}
              </p>
              {trip.destination ? (
                <p className="text-subtle-foreground mt-0.5 text-[13.5px]">
                  {trip.destination}
                </p>
              ) : null}
              {!isArchived && relative ? (
                <p className="text-brand-ink mt-2.5 text-[13px] font-medium">
                  {relative}
                </p>
              ) : null}

              <div className="border-hairline mt-5 border-t pt-5">
                <h2 className="text-subtle-foreground mb-3 text-[11.5px] font-semibold tracking-[0.06em] uppercase">
                  {members.length} {members.length === 1 ? "traveler" : "travelers"}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {members.map((member) => (
                    <li key={member.id} className="flex items-center gap-2.5">
                      <Avatar
                        initial={member.name.slice(0, 1).toUpperCase()}
                        color={avatarColor(member.id)}
                        className="size-[26px] text-[11px]"
                      />
                      <span className="text-foreground min-w-0 flex-1 truncate text-[13.5px]">
                        {member.name}
                      </span>
                      {member.isOwner ? (
                        <span className="text-subtle-foreground text-[11px] tracking-[0.04em] uppercase">
                          Organizer
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              {(isOwner && isArchived) || !isOwner ? (
                <div className="border-hairline mt-5 border-t pt-4">
                  {isOwner && isArchived ? (
                    <DeleteTripButton action={deleteTrip.bind(null, trip.id)} />
                  ) : null}
                  {!isOwner ? (
                    <LeaveTripButton action={leaveTrip.bind(null, trip.id)} />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          <DatePoll
            tripId={trip.id}
            options={datePoll}
            members={members}
            currentUserId={user.id}
            isOrganizer={isOwner}
            readOnly={isArchived}
            lockedWindow={lockedWindow}
          />

          <SuggestionList
            tripId={trip.id}
            suggestions={suggestions}
            members={members}
            currentUserId={user.id}
            isOrganizer={isOwner}
            readOnly={isArchived}
          />

          <ItineraryList
            tripId={trip.id}
            items={itinerary}
            isOrganizer={isOwner}
            readOnly={isArchived}
          />
        </div>
      </main>
    </div>
  );
}

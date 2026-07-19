import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePoll } from "@/components/trips/date-poll";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { InviteDialog } from "@/components/trips/invite-dialog";
import { LeaveTripButton } from "@/components/trips/leave-trip-button";
import { SuggestionList } from "@/components/trips/suggestion-list";
import { ItineraryList } from "@/components/trips/itinerary-list";
import { PackingEntryCard } from "@/components/trips/packing-entry-card";
import { avatarColor } from "@/lib/avatar-color";
import { deleteTrip, leaveTrip, unarchiveTrip } from "@/lib/trips/actions";
import {
  getDatePoll,
  getSuggestions,
  getItinerary,
  getPackingLists,
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
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ idea?: string }>;
}) {
  const { tripId } = await params;
  const { idea } = await searchParams;
  const { user } = await requireSession();

  const trip = await getTripForUser(tripId, user.id);
  if (!trip) notFound();

  const [members, datePoll, suggestions, itinerary, packingLists] = await Promise.all([
    listTripMembers(tripId),
    getDatePoll(tripId, user.id),
    getSuggestions(tripId, user.id),
    getItinerary(tripId, user.id),
    getPackingLists(tripId, user.id),
  ]);
  const isArchived = Boolean(trip.archivedAt);
  const isOwner = trip.ownerId === user.id;
  const lockedWindow =
    trip.datesLockedAt && trip.startDate && trip.endDate
      ? { startDate: trip.startDate, endDate: trip.endDate }
      : null;
  const window = formatWindow(trip.startDate, trip.endDate);
  const relative = relativeToNow(trip.startDate);
  const monogram = trip.name.trim().slice(0, 2).toUpperCase() || "??";

  return (
    <div className="min-h-full">
      {/* Sticky contextual bar — sits under the app sidebar chrome. */}
      <div className="border-hairline bg-background/85 sticky top-14 z-20 border-b backdrop-blur-md min-[900px]:top-0">
        <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6 min-[900px]:px-10">
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
          <div className="flex items-center gap-3">
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
                  <Button type="submit" variant="outline" size="sm">
                    Unarchive
                  </Button>
                </form>
              ) : (
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="text-muted-foreground hover:text-ink hover:bg-surface-2 rounded-[6px] px-3 py-1.5 text-[13.5px] font-medium transition-[color,background-color]"
                >
                  Edit
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[1120px] gap-8 px-6 py-8 min-[900px]:grid-cols-[280px_1fr] min-[900px]:px-10 min-[900px]:py-10">
        {/* Identity sidebar */}
        <aside className="self-start min-[900px]:sticky min-[900px]:top-[88px]">
          <div className="border-border bg-surface overflow-hidden rounded-[8px] border">
            <div className="border-hairline flex items-center gap-3 border-b px-5 py-4">
              <span
                aria-hidden
                className="border-hairline flex size-10 shrink-0 items-center justify-center rounded-[6px] border font-mono text-[13px] font-medium text-white"
                style={{ background: tripCover(trip.id) }}
              >
                {monogram}
              </span>
              <Badge tone={isArchived ? "outline" : "soft"} size="sm">
                {isArchived ? "Archived" : "Planning"}
              </Badge>
            </div>

            <div className="p-5">
              <h1 className="text-ink text-[22px] leading-[1.15] font-semibold tracking-[-0.025em]">
                {trip.name}
              </h1>
              <p className="text-muted-foreground mt-1.5 font-mono text-[12px]">
                {window || "Dates to be decided"}
              </p>
              {trip.destination ? (
                <p className="text-subtle-foreground mt-0.5 text-[13.5px]">
                  {trip.destination}
                </p>
              ) : null}
              {!isArchived && relative ? (
                <p className="text-foreground mt-2.5 text-[13px] font-medium">
                  {relative}
                </p>
              ) : null}

              <div className="border-hairline mt-5 border-t pt-5">
                <h2 className="text-subtle-foreground mb-3 font-mono text-[11px] tracking-[0.08em] uppercase">
                  {members.length}{" "}
                  {members.length === 1 ? "traveler" : "travelers"}
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
                        <span className="text-subtle-foreground font-mono text-[10px] tracking-[0.06em] uppercase">
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
        <div className="flex min-w-0 flex-col gap-12">
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
            initialExpandedSuggestionId={idea}
          />

          <ItineraryList
            tripId={trip.id}
            items={itinerary}
            currentUserId={user.id}
            readOnly={isArchived}
            lockedWindow={lockedWindow}
          />

          <PackingEntryCard tripId={trip.id} lists={packingLists} />
        </div>
      </main>
    </div>
  );
}

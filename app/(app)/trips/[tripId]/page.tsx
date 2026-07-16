import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { avatarColor } from "@/lib/avatar-color";
import { deleteTrip, unarchiveTrip } from "@/lib/trips/actions";
import { getTripForUser } from "@/lib/trips/queries";
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

  const isArchived = Boolean(trip.archivedAt);
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
            {isArchived ? (
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
            )}
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

      <div className="mx-auto max-w-[760px] px-6 pt-[30px]">
        <div className="mb-2 flex items-center gap-2.5">
          {isArchived ? (
            <span className="text-muted-foreground bg-muted rounded-[7px] px-[9px] py-1 text-[11px] font-semibold tracking-[0.04em] uppercase">
              Archived
            </span>
          ) : (
            <span className="text-brand-ink bg-brand/12 rounded-[7px] px-[9px] py-1 text-[11px] font-semibold tracking-[0.04em] uppercase">
              Planning
            </span>
          )}
          {!isArchived && relative ? (
            <span className="text-subtle-foreground text-[13px]">{relative}</span>
          ) : null}
        </div>
        <h1 className="text-ink text-[30px] font-semibold tracking-[-0.025em]">
          {trip.name}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground mt-1.5 text-[15px]">{subtitle}</p>
        ) : null}
      </div>

      <div className="mx-auto max-w-[760px] px-6 pt-[26px] pb-[90px]">
        <div className="bg-surface border-hairline shadow-card rounded-[16px] border">
          <p className="text-subtle-foreground mx-auto max-w-[46ch] px-5 py-11 text-center text-[14.5px] leading-[1.55]">
            {isArchived
              ? "This trip is archived. Unarchive it to pick planning back up, or delete it for good."
              : "Dates, ideas, the itinerary, and who-paid-for-what land here soon. For now, your trip has a home — invite your crew once members arrive."}
          </p>
        </div>

        {isArchived ? (
          <div className="mt-6 flex justify-center">
            <DeleteTripButton action={deleteTrip.bind(null, trip.id)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

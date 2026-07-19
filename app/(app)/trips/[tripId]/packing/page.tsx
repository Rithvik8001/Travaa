import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PackingLists } from "@/components/trips/packing-lists";
import { getPackingLists, getTripForUser, listTripMembers } from "@/lib/trips/queries";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Packing" };

export default async function PackingPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { user } = await requireSession();
  const trip = await getTripForUser(tripId, user.id);
  if (!trip) notFound();

  const [lists, members] = await Promise.all([
    getPackingLists(tripId, user.id),
    listTripMembers(tripId),
  ]);
  const total = lists.reduce((sum, list) => sum + list.totalCount, 0);
  const completed = lists.reduce((sum, list) => sum + list.completedCount, 0);
  const readOnly = Boolean(trip.archivedAt);

  return (
    <div className="min-h-full">
      <div className="border-hairline bg-background/85 sticky top-14 z-20 border-b backdrop-blur-md min-[900px]:top-0">
        <div className="mx-auto flex h-14 w-full max-w-[920px] items-center justify-between px-6 min-[900px]:px-10">
          <Link
            href={`/trips/${tripId}`}
            className="text-muted-foreground hover:text-ink group flex items-center gap-1.5 text-[14px] transition-colors"
          >
            <span
              aria-hidden
              className="text-[17px] leading-none transition-transform group-hover:-translate-x-0.5"
            >
              ‹
            </span>
            {trip.name}
          </Link>
          {readOnly ? (
            <Badge tone="outline" size="sm">
              Archived · read only
            </Badge>
          ) : null}
        </div>
      </div>

      <main className="mx-auto w-full max-w-[920px] px-6 py-10 min-[900px]:px-10">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow className="mb-3">Packing</Eyebrow>
            <h1 className="text-ink text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">
              Pack together, carry clearly.
            </h1>
            <p className="text-muted-foreground mt-2 max-w-[54ch] text-[14px] leading-[1.55]">
              Assign the shared essentials and keep your personal checklist private.
            </p>
          </div>
          {total > 0 ? (
            <p className="text-subtle-foreground font-mono text-[12px] tabular-nums">
              {completed} of {total} packed
            </p>
          ) : null}
        </div>

        <PackingLists
          tripId={tripId}
          lists={lists}
          members={members}
          currentUserId={user.id}
          isOrganizer={trip.ownerId === user.id}
          readOnly={readOnly}
        />
      </main>
    </div>
  );
}

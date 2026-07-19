import type { Metadata } from "next";
import Link from "next/link";
import { ArchivedTripRow } from "@/components/trips/archived-trip-row";
import { TripListRow } from "@/components/trips/trip-list-row";
import { CtaLink } from "@/components/ui/cta-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridFrame } from "@/components/ui/grid-cell";
import { listArchivedTripsForUser, listTripsForUser } from "@/lib/trips/queries";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requireSession();
  const [trips, archived] = await Promise.all([
    listTripsForUser(user.id),
    listArchivedTripsForUser(user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1120px] px-6 py-10 min-[900px]:px-10 min-[900px]:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Trips</Eyebrow>
          <h1 className="text-ink mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">
            Your trips
          </h1>
          <p className="text-muted-foreground mt-2 text-[14px]">
            {trips.length === 0
              ? "Nothing on the board yet — the good kind of blank page."
              : `${trips.length} in the works${
                  archived.length > 0 ? ` · ${archived.length} archived` : ""
                }`}
          </p>
        </div>
        <CtaLink href="/trips/new" size="sm">
          New trip
        </CtaLink>
      </div>

      {trips.length === 0 ? (
        <div className="border-border rounded-[8px] border px-6 py-16 text-center">
          <p className="text-ink text-[16px] font-semibold tracking-[-0.01em]">
            Every trip starts with one person going first.
          </p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-[46ch] text-[14px] leading-[1.6]">
            Start one, share the link, and your crew can vote on dates before
            they even make an account.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/trips/new">Start your first trip</CtaLink>
          </div>
        </div>
      ) : (
        <GridFrame className="grid grid-cols-1 min-[560px]:grid-cols-2 min-[1000px]:grid-cols-3">
          {trips.map((trip) => (
            <TripListRow key={trip.id} trip={trip} className="grid-cell" />
          ))}
          <Link
            href="/trips/new"
            className="grid-cell text-subtle-foreground hover:text-ink hover:bg-surface-2 flex min-h-[136px] flex-col items-center justify-center gap-2 transition-colors duration-150"
          >
            <span
              aria-hidden
              className="border-border flex size-9 items-center justify-center rounded-[6px] border text-[18px] leading-none"
            >
              +
            </span>
            <span className="text-[13px] font-medium">New trip</span>
          </Link>
        </GridFrame>
      )}

      {archived.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-subtle-foreground mb-3 font-mono text-[11px] tracking-[0.12em] uppercase">
            Archived
          </h2>
          <GridFrame className="grid grid-cols-1 min-[560px]:grid-cols-2">
            {archived.map((trip) => (
              <ArchivedTripRow key={trip.id} trip={trip} className="grid-cell" />
            ))}
          </GridFrame>
        </section>
      ) : null}
    </main>
  );
}

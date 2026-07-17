import type { Metadata } from "next";
import Link from "next/link";
import { ArchivedTripRow } from "@/components/trips/archived-trip-row";
import { TripListRow } from "@/components/trips/trip-list-row";
import { CtaLink } from "@/components/ui/cta-link";
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
    <main className="mx-auto w-full max-w-[1080px] px-6 pt-16 pb-32">
      <div
        data-rise-group
        className="mb-9 flex flex-wrap items-end justify-between gap-4"
      >
        <div data-rise>
          <h1 className="text-ink text-[34px] leading-[1.05] font-semibold tracking-[-0.035em]">
            Your trips
          </h1>
          <p className="text-muted-foreground mt-2 text-[15px]">
            {trips.length === 0
              ? "Nothing planned yet — let's fix that."
              : `${trips.length} in the works${
                  archived.length > 0 ? ` · ${archived.length} archived` : ""
                }`}
          </p>
        </div>
        <div data-rise>
          <CtaLink href="/trips/new" size="sm">
            New trip
          </CtaLink>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[20px] px-6 py-16 text-center">
          <p className="text-muted-foreground mx-auto max-w-[46ch] text-[15px] leading-[1.6]">
            Your trips will live here. Start one, share the link, and your crew
            can vote on dates before they even make an account.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/trips/new">Start your first trip</CtaLink>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3">
          {trips.map((trip) => (
            <TripListRow key={trip.id} trip={trip} />
          ))}
          <Link
            href="/trips/new"
            className="text-subtle-foreground hover:text-brand-ink hover:border-brand/40 flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--border)] transition-colors"
          >
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] text-[19px] leading-none"
            >
              +
            </span>
            <span className="text-[13.5px] font-medium">New trip</span>
          </Link>
        </div>
      )}

      {archived.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-subtle-foreground mb-3 text-[12px] font-semibold tracking-[0.08em] uppercase">
            Archived
          </h2>
          <div className="grid grid-cols-1 gap-1 min-[560px]:grid-cols-2">
            {archived.map((trip) => (
              <ArchivedTripRow key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

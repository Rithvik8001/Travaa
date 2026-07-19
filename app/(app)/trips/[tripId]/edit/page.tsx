import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TripForm } from "@/components/trips/trip-form";
import { archiveTrip, updateTrip } from "@/lib/trips/actions";
import { getTripForUser } from "@/lib/trips/queries";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Edit trip" };

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const { user } = await requireSession();

  const trip = await getTripForUser(tripId, user.id);
  if (!trip) notFound();
  // Archived trips are view-only — restore before editing.
  if (trip.archivedAt) redirect(`/trips/${tripId}`);

  return (
    <main className="mx-auto w-full max-w-[960px] flex-1 px-6 py-10 min-[900px]:px-10 min-[900px]:py-14">
      <Link
        href={`/trips/${trip.id}`}
        className="text-muted-foreground hover:text-ink group inline-flex items-center gap-1.5 text-[14px] transition-colors"
      >
        <span
          aria-hidden
          className="text-[17px] leading-none transition-transform group-hover:-translate-x-0.5"
        >
          ‹
        </span>
        Back to trip
      </Link>

      <div className="mt-10 grid gap-10 min-[760px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[760px]:gap-16">
        <div className="min-[760px]:pt-2">
          <Eyebrow className="mb-5">Edit trip</Eyebrow>
          <h1 className="text-ink text-[32px] leading-[1.04] font-semibold tracking-[-0.03em] min-[560px]:text-[40px]">
            Keep the details honest as plans firm up.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-[42ch] text-[15px] leading-[1.6]">
            Everyone on the trip sees these the moment you save.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6 min-[560px]:p-7">
            <TripForm
              action={updateTrip.bind(null, trip.id)}
              submitLabel="Save changes"
              pendingLabel="Saving…"
              defaultValues={{
                name: trip.name,
                destination: trip.destination ?? "",
                startDate: trip.startDate ?? "",
                endDate: trip.endDate ?? "",
              }}
            />
          </Card>

          <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <p className="text-subtle-foreground max-w-[38ch] text-[13px] leading-[1.5]">
              Archiving hides this trip from your dashboard. You can restore it
              anytime.
            </p>
            <form action={archiveTrip.bind(null, trip.id)}>
              <Button type="submit" variant="outline" size="sm">
                Archive trip
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

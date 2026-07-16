import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DecisionCard } from "@/components/ui/decision-card";
import { Wordmark } from "@/components/ui/wordmark";
import { TripForm } from "@/components/trips/trip-form";
import { updateTrip } from "@/lib/trips/actions";
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

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="animate-pop w-full max-w-[400px]">
        <Wordmark className="mb-7 justify-center" />
        <DecisionCard title="Edit trip" subtitle="Update the details as plans firm up.">
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
        </DecisionCard>
      </div>
    </main>
  );
}

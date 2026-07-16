import type { Metadata } from "next";
import { DecisionCard } from "@/components/ui/decision-card";
import { Wordmark } from "@/components/ui/wordmark";
import { TripForm } from "@/components/trips/trip-form";
import { createTrip } from "@/lib/trips/actions";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Start a new trip" };

export default async function NewTripPage() {
  await requireSession();

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="animate-pop w-full max-w-[400px]">
        <Wordmark className="mb-7 justify-center" />
        <DecisionCard
          title="Start a new trip"
          subtitle="Name it now — dates and destination can wait."
        >
          <TripForm
            action={createTrip}
            submitLabel="Create trip"
            pendingLabel="Creating…"
          />
        </DecisionCard>
      </div>
    </main>
  );
}

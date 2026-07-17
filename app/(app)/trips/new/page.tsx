import type { Metadata } from "next";
import Link from "next/link";
import { TripForm } from "@/components/trips/trip-form";
import { createTrip } from "@/lib/trips/actions";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Start a new trip" };

export default async function NewTripPage() {
  await requireSession();

  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 py-20">
      <div className="animate-pop">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-ink group mb-10 inline-flex items-center gap-1.5 text-[14px] transition-colors"
        >
          <span
            aria-hidden
            className="text-[17px] leading-none transition-transform group-hover:-translate-x-0.5"
          >
            ‹
          </span>
          Trips
        </Link>

        <h1 className="text-ink text-[30px] leading-[1.08] font-semibold tracking-[-0.035em]">
          Start a new trip
        </h1>
        <p className="text-muted-foreground mt-2.5 mb-8 text-[15px] leading-[1.55]">
          Name it now — dates and destination can wait.
        </p>

        <TripForm
          action={createTrip}
          submitLabel="Create trip"
          pendingLabel="Creating…"
        />
      </div>
    </main>
  );
}

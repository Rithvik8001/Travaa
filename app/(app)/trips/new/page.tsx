import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TripForm } from "@/components/trips/trip-form";
import { createTrip } from "@/lib/trips/actions";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Start a new trip" };

export default async function NewTripPage() {
  await requireSession();

  return (
    <main className="mx-auto w-full max-w-[960px] flex-1 px-6 py-10 min-[900px]:px-10 min-[900px]:py-14">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-ink group inline-flex items-center gap-1.5 text-[14px] transition-colors"
      >
        <span
          aria-hidden
          className="text-[17px] leading-none transition-transform group-hover:-translate-x-0.5"
        >
          ‹
        </span>
        Trips
      </Link>

      <div className="mt-10 grid gap-10 min-[760px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[760px]:gap-16">
        <div className="min-[760px]:pt-2">
          <Eyebrow className="mb-5">New trip</Eyebrow>
          <h1 className="text-ink text-[32px] leading-[1.04] font-semibold tracking-[-0.03em] min-[560px]:text-[40px]">
            The blank page before the best week of the year.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-[42ch] text-[15px] leading-[1.6]">
            Name it now — dates, destination, and the whole crew can follow. You
            can change every detail later.
          </p>
        </div>

        <Card className="p-6 min-[560px]:p-7">
          <TripForm
            action={createTrip}
            submitLabel="Create trip"
            pendingLabel="Creating…"
          />
        </Card>
      </div>
    </main>
  );
}

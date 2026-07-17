import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CtaLink } from "@/components/ui/cta-link";
import { Wordmark } from "@/components/ui/wordmark";
import { MemberStack } from "@/components/trips/member-stack";
import { joinTrip } from "@/lib/trips/actions";
import { getTripByInviteCode, listTripMembers } from "@/lib/trips/queries";
import { formatWindow } from "@/lib/trips/format";
import { tripCover } from "@/lib/trips/cover";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "You're invited" };

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const trip = await getTripByInviteCode(code);
  if (!trip) notFound();

  const [members, session] = await Promise.all([
    listTripMembers(trip.id),
    getSession(),
  ]);

  const ownerName = members.find((m) => m.isOwner)?.name ?? "Someone";
  const alreadyMember = session
    ? members.some((m) => m.id === session.user.id)
    : false;
  const subtitle = [
    formatWindow(trip.startDate, trip.endDate),
    trip.destination,
    `${members.length} member${members.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="animate-pop w-full max-w-[400px]">
        <Wordmark className="mb-7 justify-center" />

        <Card className="shadow-dialog overflow-hidden">
          <div
            className="relative h-[140px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]"
            style={{ background: tripCover(trip.id) }}
          >
            <div className="absolute inset-0 flex items-end bg-gradient-to-b from-transparent to-black/20 p-[18px]">
              <MemberStack members={members} max={5} />
            </div>
          </div>

          <div className="px-6 pt-6 pb-6 text-center">
            {alreadyMember ? (
              <p className="text-subtle-foreground mb-1.5 text-[13.5px]">
                You&rsquo;re already in
              </p>
            ) : (
              <p className="text-subtle-foreground mb-1.5 text-[13.5px]">
                <span className="text-foreground font-semibold">{ownerName}</span>{" "}
                invited you to
              </p>
            )}
            <h1 className="text-ink text-[21px] font-semibold tracking-[-0.02em]">
              {trip.name}
            </h1>
            <p className="text-subtle-foreground mt-1 mb-[22px] text-[14px]">
              {subtitle}
            </p>

            {alreadyMember ? (
              <>
                <CtaLink href={`/trips/${trip.id}`} size="block">
                  Open trip
                </CtaLink>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-ink mt-2 block py-[9px] text-[14px]"
                >
                  Back to trips
                </Link>
              </>
            ) : session ? (
              <>
                <form action={joinTrip.bind(null, code)}>
                  <Button type="submit" size="block">
                    Accept invitation
                  </Button>
                </form>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-ink mt-2 block py-[9px] text-[14px]"
                >
                  Not now
                </Link>
              </>
            ) : (
              <>
                <CtaLink
                  href={`/sign-in?redirect=/j/${code}`}
                  size="block"
                >
                  Accept invitation
                </CtaLink>
                <p className="text-subtle-foreground mt-3 text-[13.5px]">
                  New to Travaa?{" "}
                  <Link
                    href={`/sign-up?redirect=/j/${code}`}
                    className="text-brand-ink font-medium hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

import { Container } from "@/components/ui/container";
import { BalanceCard } from "./balance-card";
import { Beat } from "./beat";
import { DatesPoll } from "./dates-poll";
import { IdeaCard } from "./idea-card";

export function FeatureBeats() {
  return (
    <section id="features" className="scroll-mt-[66px]">
      <Container className="pt-[110px]">
        <Beat
          className="mb-[88px] min-[900px]:mb-[130px]"
          eyebrow="01 — Pick dates"
          title="Find the weekend that actually works."
          body="Everyone taps their availability once. Travaa points straight at the dates the most people can make — and locks them the moment you're ready. No calendar tennis."
          visual={<DatesPoll />}
        />

        <Beat
          reverse
          className="mb-[88px] min-[900px]:mb-[130px]"
          eyebrow="02 — Decide together"
          title="Every idea gets its moment — then its verdict."
          body="Drop in stays, restaurants, and plans. The group votes and talks it through right there. The winners become itinerary items — no copy-pasting from six chat threads."
          visual={<IdeaCard />}
        />

        <Beat
          className="mb-10"
          eyebrow="03 — Split the bill"
          title="Money math, done. Friendships, intact."
          body="Log what everyone paid, split it equally or your own way, and Travaa nets it down to the fewest possible transfers."
          visual={<BalanceCard />}
        />
      </Container>
    </section>
  );
}

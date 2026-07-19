/**
 * Static copy and sample data for the marketing landing page.
 * Nothing here touches the database — the landing page is a pure Server Component.
 */

import { AVAILABILITY_COLOR, type Availability } from "@/lib/trips/dates";

// Re-exported so landing sections keep importing availability from one place.
export { AVAILABILITY_COLOR };
export type { Availability };

export interface CrewMember {
  readonly initial: string;
  /** CSS color for the avatar chip background. */
  readonly avatar: string;
  readonly availability: Availability;
}

export interface Step {
  readonly n: string;
  readonly title: string;
  readonly desc: string;
}

export interface Feature {
  readonly n: string;
  /** Mono kicker shown above the title. */
  readonly label: string;
  readonly title: string;
  readonly desc: string;
}

export interface Quote {
  readonly text: string;
  readonly name: string;
  readonly sub: string;
  readonly initial: string;
  readonly avatar: string;
}

export interface FooterColumn {
  readonly head: string;
  readonly links: readonly string[];
}

/** The signature bordered feature grid — six cells, mono-labelled. */
export const FEATURES: readonly Feature[] = [
  {
    n: "01",
    label: "Dates",
    title: "One poll, one date",
    desc: "Everyone taps their availability once. The window most people can make rises to the top — lock it and it's the trip's date.",
  },
  {
    n: "02",
    label: "Ideas",
    title: "Decide out loud",
    desc: "Stays, spots, and plans go on the board. The crew upvotes and talks it through, right where the decision happens.",
  },
  {
    n: "03",
    label: "Itinerary",
    title: "The day-by-day",
    desc: "Winning ideas become itinerary items. One shared plan the whole group can shape — not six screenshots.",
  },
  {
    n: "04",
    label: "Packing",
    title: "Nothing left behind",
    desc: "Shared and private lists, items assigned to whoever's carrying them. Checked off as you pack.",
  },
  {
    n: "05",
    label: "Invites",
    title: "A link is enough",
    desc: "Share one link or a short code. People vote and weigh in before they ever make an account.",
  },
  {
    n: "06",
    label: "Expenses",
    title: "Split, stay friends",
    desc: "Log what everyone paid and Travaa nets it down to the fewest transfers. Soon on the grid.",
  },
];

export const CREW: readonly CrewMember[] = [
  { initial: "M", avatar: "oklch(0.9 0 0)", availability: "yes" },
  { initial: "D", avatar: "oklch(0.86 0 0)", availability: "yes" },
  { initial: "P", avatar: "oklch(0.82 0 0)", availability: "yes" },
  { initial: "S", avatar: "oklch(0.78 0 0)", availability: "yes" },
  { initial: "N", avatar: "oklch(0.74 0 0)", availability: "maybe" },
  { initial: "L", avatar: "oklch(0.7 0 0)", availability: "no" },
];

export const STEPS: readonly Step[] = [
  {
    n: "1",
    title: "Open a trip",
    desc: "Name it, sketch a rough window. Thirty seconds and you have a shared board.",
  },
  {
    n: "2",
    title: "Drop the link",
    desc: "One link or a short code. The crew votes on dates before they even sign up.",
  },
  {
    n: "3",
    title: "Lock it and go",
    desc: "Set the date, build the plan, split the costs. Everyone stays in sync as things move.",
  },
];

export const QUOTES: readonly Quote[] = [
  {
    text: "We planned six people to Lisbon in a weekend, not a month. Nobody had to secretly be the project manager.",
    name: "Maya Chen",
    sub: "Planned 3 trips on Travaa",
    initial: "M",
    avatar: "oklch(0.88 0 0)",
  },
  {
    text: "The dates poll alone ended a fight our group chat had been having since February.",
    name: "Lena Brandt",
    sub: "Planned 4 trips on Travaa",
    initial: "L",
    avatar: "oklch(0.78 0 0)",
  },
];

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    head: "Product",
    links: ["Features", "How it works", "Pricing", "Changelog"],
  },
  { head: "Company", links: ["About", "Contact"] },
];

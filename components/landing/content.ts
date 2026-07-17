/**
 * Static copy and sample data for the marketing landing page.
 * Nothing here touches the database — the landing page is a pure Server Component.
 */

export type Availability = "yes" | "maybe" | "no";

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

export interface Detail {
  readonly title: string;
  readonly desc: string;
  /** CSS color for the square bullet mark. */
  readonly mark: string;
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

// "available" carries the blue accent; maybe/no stay quiet warm gray.
export const AVAILABILITY_COLOR: Readonly<Record<Availability, string>> = {
  yes: "oklch(0.585 0.19 266)",
  maybe: "oklch(0.74 0.015 80)",
  no: "oklch(0.83 0.01 80)",
};

export const CREW: readonly CrewMember[] = [
  { initial: "M", avatar: "oklch(0.88 0.04 266)", availability: "yes" },
  { initial: "D", avatar: "oklch(0.88 0.035 240)", availability: "yes" },
  { initial: "P", avatar: "oklch(0.88 0.03 205)", availability: "yes" },
  { initial: "S", avatar: "oklch(0.88 0.035 300)", availability: "yes" },
  { initial: "N", avatar: "oklch(0.88 0.03 160)", availability: "maybe" },
  { initial: "L", avatar: "oklch(0.88 0.035 255)", availability: "no" },
];

export const STEPS: readonly Step[] = [
  {
    n: "1",
    title: "Create a trip",
    desc: "Name it, set a rough window, add a cover. About thirty seconds.",
  },
  {
    n: "2",
    title: "Invite the crew",
    desc: "One link or a four-letter code. People vote before they even make an account.",
  },
  {
    n: "3",
    title: "Decide, then go",
    desc: "Lock dates, build the plan, split the costs. Travaa keeps everyone in sync as things change.",
  },
];

export const DETAILS: readonly Detail[] = [
  {
    mark: "oklch(0.585 0.16 266)",
    title: "Packing lists",
    desc: "Shared and private, with items assigned to whoever's carrying them.",
  },
  {
    mark: "oklch(0.6 0.13 240)",
    title: "Roles & permissions",
    desc: "Organizers, co-organizers, members — everyone sees the right thing.",
  },
  {
    mark: "oklch(0.62 0.11 205)",
    title: "Receipts & files",
    desc: "Attach confirmations and receipts right where they belong.",
  },
  {
    mark: "oklch(0.6 0.14 300)",
    title: "Notifications",
    desc: "Nudges for votes and new expenses. Never a feed to scroll.",
  },
  {
    mark: "oklch(0.62 0.11 160)",
    title: "Real-time sync",
    desc: "Changes appear instantly for the whole group, optimistically.",
  },
  {
    mark: "oklch(0.585 0.15 255)",
    title: "Deep-link invites",
    desc: "Tap a link, land straight inside the trip. No hunting for codes.",
  },
];

export const QUOTES: readonly Quote[] = [
  {
    text: "We planned six people to Lisbon in a weekend, not a month. Nobody had to secretly be the project manager.",
    name: "Maya Chen",
    sub: "Planned 3 trips on Travaa",
    initial: "M",
    avatar: "oklch(0.88 0.04 266)",
  },
  {
    text: "The dates poll alone ended a fight our group chat had been having since February.",
    name: "Lena Brandt",
    sub: "Planned 4 trips on Travaa",
    initial: "L",
    avatar: "oklch(0.88 0.035 255)",
  },
];

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  { head: "Product", links: ["Features", "How it works", "Pricing", "Changelog"] },
  { head: "Company", links: ["About Travaa"] },
];

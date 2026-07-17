"use client";

import {
  Add01Icon,
  Home01Icon,
  Logout03Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface DockLink {
  readonly href: string;
  readonly icon: IconSvgElement;
  readonly label: string;
  /** Extra paths (beyond href) that should light this item up. */
  readonly match?: (pathname: string) => boolean;
}

const LINKS: readonly DockLink[] = [
  { href: "/dashboard", icon: Home01Icon, label: "Trips" },
  {
    href: "/trips/new",
    icon: Add01Icon,
    label: "New trip",
    match: (p) => p.startsWith("/trips/new"),
  },
  { href: "/settings", icon: UserCircleIcon, label: "Profile" },
];

const itemBase =
  "group relative flex size-10 items-center justify-center rounded-[15px] transition-[background-color,color,transform] duration-200 ease-out hover:-translate-y-1 active:scale-[0.94]";

function Tooltip({ label }: { readonly label: string }) {
  return (
    <span className="bg-ink text-background pointer-events-none absolute -top-9 rounded-md px-2 py-1 text-[11.5px] font-medium whitespace-nowrap opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
      {label}
    </span>
  );
}

/** macOS-style floating dock — the only navigation chrome on the app surface. */
export function Dock() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <nav
        aria-label="App"
        className="bg-surface/70 pointer-events-auto relative flex items-center gap-0.5 rounded-[23px] p-2 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.85),inset_0_0_0_1px_oklch(1_0_0/0.25),0_1px_1px_0_oklch(0_0_0/0.05),0_18px_48px_-14px_oklch(0_0_0/0.32),0_0_0_1px_oklch(0_0_0/0.07)] backdrop-blur-2xl"
      >
        {/* Glossy top sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[54%] rounded-t-[23px] bg-[linear-gradient(to_bottom,oklch(1_0_0/0.6),transparent)]"
        />
        {LINKS.map((link) => {
          const active = link.match
            ? link.match(pathname)
            : pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                itemBase,
                active
                  ? "bg-muted text-ink"
                  : "text-muted-foreground hover:text-ink hover:bg-surface-sunken",
              )}
            >
              <Tooltip label={link.label} />
              <HugeiconsIcon icon={link.icon} size={21} strokeWidth={1.8} />
              {active ? (
                <span className="bg-brand absolute bottom-[2px] size-1 rounded-full" />
              ) : null}
            </Link>
          );
        })}

        <span aria-hidden className="bg-hairline mx-1 h-5 w-px" />

        <button
          type="button"
          onClick={handleSignOut}
          disabled={pending}
          aria-label="Sign out"
          className={cn(
            itemBase,
            "text-muted-foreground hover:text-danger hover:bg-surface-sunken disabled:opacity-55",
          )}
        >
          <Tooltip label={pending ? "Signing out…" : "Sign out"} />
          <HugeiconsIcon icon={Logout03Icon} size={20} strokeWidth={1.8} />
        </button>
      </nav>
    </div>
  );
}

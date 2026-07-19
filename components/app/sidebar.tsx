"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Home01Icon,
  InboxIcon,
  Logout03Icon,
  Menu01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Wordmark } from "@/components/ui/wordmark";
import { avatarColor } from "@/lib/avatar-color";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { badgeLabel } from "@/lib/notifications/format";

interface NavLink {
  readonly href: string;
  readonly icon: IconSvgElement;
  readonly label: string;
  readonly isActive: (pathname: string) => boolean;
}

const LINKS: readonly NavLink[] = [
  {
    href: "/dashboard",
    icon: Home01Icon,
    label: "Trips",
    isActive: (p) =>
      p === "/dashboard" ||
      (p.startsWith("/trips/") && !p.startsWith("/trips/new")),
  },
  {
    href: "/trips/new",
    icon: Add01Icon,
    label: "New trip",
    isActive: (p) => p.startsWith("/trips/new"),
  },
  {
    href: "/notifications",
    icon: InboxIcon,
    label: "Inbox",
    isActive: (p) => p.startsWith("/notifications"),
  },
  {
    href: "/settings",
    icon: Settings02Icon,
    label: "Settings",
    isActive: (p) => p.startsWith("/settings"),
  },
];

interface SidebarUser {
  readonly name: string;
  readonly id: string;
  readonly secondary: string;
}

function NavItem({
  link,
  active,
  onNavigate,
  badge,
}: {
  readonly link: NavLink;
  readonly active: boolean;
  readonly onNavigate?: () => void;
  readonly badge?: number;
}) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-[6px] px-3 py-2 text-[14px] font-medium transition-[color,background-color] duration-150",
        active
          ? "bg-surface-2 text-ink"
          : "text-muted-foreground hover:text-ink hover:bg-surface-2",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="bg-accent absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-[2px]"
        />
      ) : null}
      <HugeiconsIcon
        icon={link.icon}
        size={19}
        strokeWidth={active ? 2 : 1.8}
        className="shrink-0"
      />
      {link.label}
      {badge && badge > 0 ? (
        <span
          aria-label={`${badge} items need attention`}
          className="border-hairline bg-surface ml-auto rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] tabular-nums"
        >
          {badgeLabel(badge)}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarBody({
  user,
  pathname,
  onSignOut,
  pending,
  onNavigate,
  inboxCount,
}: {
  readonly user: SidebarUser;
  readonly pathname: string;
  readonly onSignOut: () => void;
  readonly pending: boolean;
  readonly onNavigate?: () => void;
  readonly inboxCount: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-hairline flex h-14 items-center border-b px-5">
        <Wordmark />
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-subtle-foreground px-3 pt-2 pb-1 font-mono text-[10px] tracking-[0.12em] uppercase">
          Menu
        </p>
        {LINKS.map((link) => (
          <NavItem
            key={link.href}
            link={link}
            active={link.isActive(pathname)}
            onNavigate={onNavigate}
            badge={link.href === "/notifications" ? inboxCount : undefined}
          />
        ))}
      </nav>

      <div className="border-hairline border-t p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="hover:bg-surface-2 flex items-center gap-3 rounded-[6px] px-2 py-2 transition-[background-color] duration-150"
        >
          <Avatar
            initial={user.name.charAt(0).toUpperCase()}
            color={avatarColor(user.id)}
            className="size-8 text-[13px]"
          />
          <span className="min-w-0 flex-1">
            <span className="text-ink block truncate text-[13px] font-medium">
              {user.name}
            </span>
            <span className="text-subtle-foreground block truncate font-mono text-[11px]">
              {user.secondary}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          disabled={pending}
          className="text-muted-foreground hover:text-danger hover:bg-surface-2 mt-1 flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-[13.5px] font-medium transition-[color,background-color] duration-150 disabled:opacity-55"
        >
          <HugeiconsIcon
            icon={Logout03Icon}
            size={18}
            strokeWidth={1.8}
            className="shrink-0"
          />
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

/** The signed-in navigation chrome: a fixed left rail at desktop widths, and a
 *  slim top bar with a slide-in drawer below the 900px breakpoint. */
export function Sidebar({
  user,
  inboxCount,
}: {
  readonly user: SidebarUser;
  readonly inboxCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop rail */}
      <aside className="border-hairline bg-surface fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r min-[900px]:block">
        <SidebarBody
          user={user}
          pathname={pathname}
          onSignOut={handleSignOut}
          pending={pending}
          inboxCount={inboxCount}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="border-hairline bg-surface/85 fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md min-[900px]:hidden">
        <Wordmark />
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="text-muted-foreground hover:text-ink hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-[6px] transition-[color,background-color] duration-150 active:scale-[0.96]"
        >
          <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 min-[900px]:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[oklch(0.18_0_0/0.35)]"
          />
          <div className="bg-surface border-hairline absolute inset-y-0 left-0 w-[280px] border-r shadow-[var(--shadow-overlay)]">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-ink hover:bg-surface-2 absolute top-2.5 right-2.5 z-10 inline-flex size-9 items-center justify-center rounded-[6px] transition-[color,background-color] duration-150"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.8} />
            </button>
            <SidebarBody
              user={user}
              pathname={pathname}
              onSignOut={handleSignOut}
              pending={pending}
              inboxCount={inboxCount}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

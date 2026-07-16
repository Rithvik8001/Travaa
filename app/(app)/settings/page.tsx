import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/settings/profile-form";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default async function SettingsPage() {
  const { user } = await requireSession();

  return (
    <main className="mx-auto w-full max-w-[480px] px-6 pt-10 pb-20">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-ink mb-7 flex items-center gap-[7px] text-[14.5px] transition-colors"
      >
        <span aria-hidden className="text-[17px] leading-none">
          ‹
        </span>
        Trips
      </Link>

      <h1 className="text-ink text-[32px] font-semibold tracking-[-0.025em]">
        Profile
      </h1>
      <p className="text-subtle-foreground mt-1 mb-[26px] text-[15px]">
        How your crew sees you.
      </p>

      <div className="bg-surface border-hairline shadow-card rounded-[18px] border p-6">
        <ProfileForm
          defaultValues={{
            name: user.name,
            username: user.displayUsername ?? user.username ?? "",
          }}
        />
      </div>
    </main>
  );
}

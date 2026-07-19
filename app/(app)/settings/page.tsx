import type { Metadata } from "next";
import { ProfileForm } from "@/components/settings/profile-form";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { avatarColor } from "@/lib/avatar-color";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default async function SettingsPage() {
  const { user } = await requireSession();
  const username = user.displayUsername ?? user.username ?? "";

  return (
    <main className="mx-auto w-full max-w-[880px] px-6 py-10 min-[900px]:px-10 min-[900px]:py-14">
      <Eyebrow>Settings</Eyebrow>
      <h1 className="text-ink mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">
        Profile
      </h1>
      <p className="text-muted-foreground mt-2 text-[14px]">
        How your crew sees you across every trip.
      </p>

      <div className="mt-10 grid gap-8 min-[720px]:grid-cols-[240px_1fr]">
        <aside className="min-[720px]:pt-1">
          <div className="flex items-center gap-3.5">
            <Avatar
              initial={(user.name.slice(0, 1) || "?").toUpperCase()}
              color={avatarColor(user.id)}
              className="size-14 text-[22px]"
            />
            <div className="min-w-0">
              <div className="text-ink truncate text-[15px] font-semibold">
                {user.name}
              </div>
              {username ? (
                <div className="text-subtle-foreground truncate font-mono text-[12px]">
                  @{username}
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-subtle-foreground mt-4 max-w-[30ch] text-[13px] leading-[1.55]">
            Your name and avatar appear on every trip, poll, and comment.
          </p>
        </aside>

        <Card className="p-6">
          <ProfileForm defaultValues={{ name: user.name, username }} />
        </Card>
      </div>
    </main>
  );
}

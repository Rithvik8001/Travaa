import { Sidebar } from "@/components/app/sidebar";
import { MotionProvider } from "@/components/ui/motion";
import { requireSession } from "@/lib/session";
import { getInboxBadgeCount } from "@/lib/notifications/queries";

/** The signed-in surface: a fixed left sidebar (drawer on mobile) plus content. */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireSession();
  const secondary =
    "username" in user && typeof user.username === "string" && user.username
      ? `@${user.username}`
      : user.email;
  const inboxCount = await getInboxBadgeCount(user.id);

  return (
    <MotionProvider>
      <Sidebar
        user={{ name: user.name, id: user.id, secondary }}
        inboxCount={inboxCount}
      />
      <div className="min-h-screen pt-14 min-[900px]:pt-0 min-[900px]:pl-[248px]">
        {children}
      </div>
    </MotionProvider>
  );
}

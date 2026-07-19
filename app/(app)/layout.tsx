import { Sidebar } from "@/components/app/sidebar";
import { MotionProvider } from "@/components/ui/motion";
import { requireSession } from "@/lib/session";

/** The signed-in surface: a fixed left sidebar (drawer on mobile) plus content. */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireSession();
  const secondary =
    "username" in user && typeof user.username === "string" && user.username
      ? `@${user.username}`
      : user.email;

  return (
    <MotionProvider>
      <Sidebar user={{ name: user.name, id: user.id, secondary }} />
      <div className="min-h-screen pt-14 min-[900px]:pt-0 min-[900px]:pl-[248px]">
        {children}
      </div>
    </MotionProvider>
  );
}

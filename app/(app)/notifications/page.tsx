import type { Metadata } from "next";
import { NotificationInbox } from "@/components/notifications/inbox";
import { getInbox } from "@/lib/notifications/queries";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Inbox" };

export default async function NotificationsPage() {
  const { user } = await requireSession();
  const inbox = await getInbox(user.id);
  return <NotificationInbox inbox={inbox} />;
}

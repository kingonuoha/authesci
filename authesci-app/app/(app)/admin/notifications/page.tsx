import { Metadata } from "next";
import NotificationsContent from "@/components/modules/notifications/NotificationsContent";

export const metadata: Metadata = {
    title: "Notifications | Authesci",
    description: "View your notifications and activity logs",
};

export default function AdminNotificationsPage() {
    return <NotificationsContent />;
}

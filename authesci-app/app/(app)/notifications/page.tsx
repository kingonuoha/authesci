import { Metadata } from "next";
import NotificationsContent from "@/components/modules/notifications/NotificationsContent";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Notifications | Authesci",
    description: "View your notifications and activity logs",
};

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return <NotificationsContent />;
}

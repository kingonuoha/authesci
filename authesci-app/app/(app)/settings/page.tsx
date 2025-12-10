import { Metadata } from "next";
import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "@/components/modules/settings/GeneralTab";
import { NotificationsTab } from "@/components/modules/settings/NotificationsTab";
import { SecurityTab } from "@/components/modules/settings/SecurityTab";
import Breadcrumb from "@/components/modules/Breadcrumb";

export const metadata: Metadata = {
    title: "Settings | Authesci",
    description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
    const { user } = await getAuthenticatedUser();

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { settings: true },
    });

    const settings = (profile?.settings as any) || {};

    return (
        <div className="container-fluid px-4 py-6">
            <div className="mb-6">
                <h4 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">Settings</h4>
            </div>

            <div className="card border-0 bg-white dark:bg-neutral-700 rounded-2xl shadow-sm">
                <div className="card-body p-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="mb-8 w-full justify-start bg-transparent border-b border-neutral-200 dark:border-neutral-600 rounded-none h-auto p-0 space-x-6">
                            <TabsTrigger
                                value="general"
                                className="rounded-none border-b-2 border-transparent px-4 py-3 bg-transparent text-neutral-500 font-medium data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:text-neutral-400 dark:data-[state=active]:text-primary-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="rounded-none border-b-2 border-transparent px-4 py-3 bg-transparent text-neutral-500 font-medium data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:text-neutral-400 dark:data-[state=active]:text-primary-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="rounded-none border-b-2 border-transparent px-4 py-3 bg-transparent text-neutral-500 font-medium data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:text-neutral-400 dark:data-[state=active]:text-primary-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Security
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-6 focus-visible:outline-none ring-0">
                            <GeneralTab settings={settings} />
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-6 focus-visible:outline-none ring-0">
                            <NotificationsTab settings={settings} />
                        </TabsContent>

                        <TabsContent value="security" className="mt-6 focus-visible:outline-none ring-0">
                            <SecurityTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

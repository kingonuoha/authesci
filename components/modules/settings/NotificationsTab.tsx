"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component or will create a simple one
import { Label } from "@/components/ui/label";
import { updateSettings } from "@/app/(app)/actions/settings";
import { toast } from "react-hot-toast";

interface NotificationsTabProps {
    settings: any;
}

export function NotificationsTab({ settings }: NotificationsTabProps) {
    const [isPending, startTransition] = useTransition();
    const [localSettings, setLocalSettings] = useState(settings?.notifications || {
        emailMarketing: true,
        emailJobAlerts: true,
        emailApplicationUpdates: true,
        emailMessages: true,
        pushNotifications: false,
    });

    const handleToggle = (key: string) => {
        const newSettings = { ...localSettings, [key]: !localSettings[key] };
        setLocalSettings(newSettings);

        startTransition(async () => {
            const result = await updateSettings({
                notifications: newSettings,
            });
            if (result.status === "error") {
                toast.error(result.message);
                // Revert on error
                setLocalSettings(localSettings);
            } else {
                toast.success("Notification preferences saved");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Email Notifications</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Choose what emails you want to receive.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-neutral-900 dark:text-white">Marketing & Newsletter</Label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive updates about new features and promotions.</p>
                    </div>
                    <Switch
                        checked={localSettings.emailMarketing}
                        onCheckedChange={() => handleToggle("emailMarketing")}
                        disabled={isPending}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-neutral-900 dark:text-white">Job Alerts</Label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Get notified when new jobs match your profile.</p>
                    </div>
                    <Switch
                        checked={localSettings.emailJobAlerts}
                        onCheckedChange={() => handleToggle("emailJobAlerts")}
                        disabled={isPending}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-neutral-900 dark:text-white">Application Updates</Label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive updates on your job applications.</p>
                    </div>
                    <Switch
                        checked={localSettings.emailApplicationUpdates}
                        onCheckedChange={() => handleToggle("emailApplicationUpdates")}
                        disabled={isPending}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-neutral-900 dark:text-white">Messages</Label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Get notified when you receive a new message.</p>
                    </div>
                    <Switch
                        checked={localSettings.emailMessages}
                        onCheckedChange={() => handleToggle("emailMessages")}
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive notifications on your device.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-neutral-900 dark:text-white">Enable Push Notifications</Label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive real-time alerts on your browser.</p>
                    </div>
                    <Switch
                        checked={localSettings.pushNotifications}
                        onCheckedChange={() => handleToggle("pushNotifications")}
                        disabled={isPending}
                    />
                </div>
            </div>
        </div>
    );
}

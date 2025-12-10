"use client";

import { ThemeToggle } from "@/components/modules/ThemeToggle"; // Reusing existing
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition, useState } from "react";
import { updateSettings } from "@/app/(app)/actions/settings";
import { toast } from "react-hot-toast";

interface GeneralTabProps {
    settings: any;
}

export function GeneralTab({ settings }: GeneralTabProps) {
    const [isPending, startTransition] = useTransition();
    const [language, setLanguage] = useState(settings?.language || "en");
    const [timezone, setTimezone] = useState(settings?.timezone || "UTC");

    const handleSave = (key: string, value: string) => {
        startTransition(async () => {
            const result = await updateSettings({ [key]: value });
            if (result.status === "error") {
                toast.error(result.message);
            } else {
                toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated`);
            }
        })
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Customize how the application looks on your device.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-neutral-900 dark:text-white">Theme</Label>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Select your preferred theme.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Language & Region</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Set your language and timezone preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={(val) => { setLanguage(val); handleSave("language", val); }}>
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={(val) => { setTimezone(val); handleSave("timezone", val); }}>
                        <SelectTrigger id="timezone">
                            <SelectValue placeholder="Select Timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                            <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                            <SelectItem value="CET">CET (Central European Time)</SelectItem>
                            <SelectItem value="WAT">WAT (West Africa Time)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRealtime } from "@/components/chat/realtime-provider";

interface UserAvatarProps {
    userId?: string;
    src?: string | null;
    name?: string | null;
    className?: string;
    showStatus?: boolean;
}

export function UserAvatar({ userId, src, name, className, showStatus = true }: UserAvatarProps) {
    // Use try-catch or optional chaining for useRealtime in case it's used outside provider
    let isOnline = false;
    try {
        const { onlineUsers } = useRealtime();
        isOnline = userId ? onlineUsers.has(userId) : false;
    } catch (e) {
        // Context not available
    }

    return (
        <div className="relative inline-block">
            <Avatar className={className}>
                <AvatarImage src={src || ""} alt={name || "User"} />
                <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            {showStatus && userId && (
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ${isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-neutral-600"
                        }`}
                    title={isOnline ? "Online" : "Offline"}
                />
            )}
        </div>
    );
}

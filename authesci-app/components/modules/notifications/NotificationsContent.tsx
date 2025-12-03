"use client";

import { useState, useEffect } from "react";
import {
    getNotificationsAction,
    markReadAction,
    markAllReadAction,
    deleteNotificationAction,
    clearAllNotificationsAction,
    getProfileIdAction
} from "@/app/actions/notifications";
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, CheckCheck, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Link from "next/link";
import LogViewerClient from "@/components/modules/activity-logs/LogViewerClient";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function NotificationsContent() {
    const [activeTab, setActiveTab] = useState<"notifications" | "logs">("notifications");
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profileId, setProfileId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchNotifications = async () => {
        try {
            const notes = await getNotificationsAction(50);
            setNotifications(notes);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const pid = await getProfileIdAction();
            setProfileId(pid);
            fetchNotifications();
        };
        init();
    }, []);

    useEffect(() => {
        if (!profileId) return;

        const channel = supabase
            .channel('realtime-notifications-page')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${profileId}`,
                },
                (payload) => {
                    const newNoteRaw = payload.new as any;
                    const newNote = {
                        id: newNoteRaw.id,
                        title: newNoteRaw.title,
                        message: newNoteRaw.message,
                        type: newNoteRaw.type,
                        read: newNoteRaw.read,
                        link: newNoteRaw.link,
                        createdAt: newNoteRaw.created_at,
                        userId: newNoteRaw.user_id,
                        metadata: newNoteRaw.metadata
                    };

                    setNotifications((prev) => [newNote, ...prev]);
                    toast.success("New notification received");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profileId, supabase]);

    const handleMarkRead = async (id: string) => {
        try {
            await markReadAction(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            toast.success("Marked as read");
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllReadAction();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotificationAction(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification deleted");
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    const handleClearAll = async () => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: "This will clear all your notifications.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear all!',
            customClass: {
                popup: 'dark:bg-neutral-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-neutral-300'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await clearAllNotificationsAction();
            setNotifications([]);
            toast.success("All notifications cleared");
        } catch (error) {
            toast.error("Failed to clear notifications");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Manage your notifications and activity logs</p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "notifications"
                            ? "bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                            }`}
                    >
                        Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab("logs")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "logs"
                            ? "bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                            }`}
                    >
                        Logs
                    </button>
                </div>
            </div>

            {activeTab === "notifications" ? (
                <div className="space-y-4">
                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                                {notifications.filter(n => !n.read).length} Unread
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                disabled={notifications.every(n => n.read) || notifications.length === 0}
                                className="h-9"
                            >
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Mark all read
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                disabled={notifications.length === 0}
                                className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear all
                            </Button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center text-neutral-500">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">No notifications</h3>
                                <p className="text-neutral-500 dark:text-neutral-400">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                                {notifications.map((note) => (
                                    <div
                                        key={note.id}
                                        className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-700/50 ${!note.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full overflow-hidden ${!note.read ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700'}`}>
                                                {note.metadata?.visual_type === 'image' && note.metadata?.visual_resource ? (
                                                    <img
                                                        src={note.metadata.visual_resource}
                                                        alt="Notification source"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Bell size={18} />
                                                )}
                                                {!note.read && (
                                                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary-600 border-2 border-white dark:border-neutral-800 rounded-full"></span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className={`text-sm font-semibold mb-1 ${!note.read ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                                            {note.title || note.type}
                                                        </h4>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                                            {note.message}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-neutral-400">
                                                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                            </span>
                                                            {note.link && (
                                                                <Link href={note.link} className="text-xs font-medium text-primary-600 hover:underline">
                                                                    View Details
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {!note.read && (
                                                            <button
                                                                onClick={() => handleMarkRead(note.id)}
                                                                className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
                    <LogViewerClient isAdminView={true} limit={100} />
                </div>
            )}
        </div>
    );
}

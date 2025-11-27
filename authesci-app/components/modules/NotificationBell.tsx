'use client'

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getNotificationsAction, getUnreadCountAction, markReadAction, markAllReadAction, getUserRoleAction, getProfileIdAction } from '@/app/actions/notifications';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchNotifications = async () => {
        try {
            const [notes, count, role] = await Promise.all([
                getNotificationsAction(),
                getUnreadCountAction(),
                getUserRoleAction()
            ]);
            setNotifications(notes);
            setUnreadCount(count);
            setUserRole(role);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
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
            .channel('realtime-notifications')
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
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profileId, supabase]);

    const handleMarkRead = async (id: string) => {
        await markReadAction(id);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        await markAllReadAction();
        fetchNotifications();
    };

    const getNotificationsLink = () => {
        if (!userRole) return '/notifications';
        return `/${userRole.toLowerCase()}/notifications`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="button"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 -mt-0.5 -mr-0.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-900 animate-in zoom-in duration-200">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="z-50 absolute right-0 mt-2 w-full max-w-[394px] min-w-[320px] overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <div className="m-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-900/20">
                        <h6 className="mb-0 text-lg font-semibold text-neutral-900 dark:text-white">Notifications</h6>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-bold text-primary-600 dark:bg-neutral-700 dark:text-white text-xs">
                            {unreadCount}
                        </span>
                    </div>
                    <div className="scroll-sm !border-t-0">
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-neutral-500">No notifications</div>
                            ) : (
                                notifications.slice(0, 6).map((note) => (
                                    <div
                                        key={note.id}
                                        className={`flex justify-between gap-1 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-700 last:border-0 ${!note.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => !note.read && handleMarkRead(note.id)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                                                <Bell size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h6 className="fw-semibold mb-0.5 text-sm font-medium text-neutral-900 dark:text-white truncate">{note.title || note.type}</h6>
                                                <p className="mb-0 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">{note.message}</p>
                                                {note.link && (
                                                    <Link href={note.link} className="text-xs text-primary-600 hover:underline mt-1 block" onClick={(e) => e.stopPropagation()}>
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0 pl-2">
                                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-4 py-3 text-center border-t border-neutral-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800">
                            <Link href={getNotificationsLink()} onClick={() => setIsOpen(false)} className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

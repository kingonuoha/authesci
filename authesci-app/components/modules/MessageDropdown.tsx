'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { getUnreadMessages } from '@/app/actions/chat';

interface UnreadMessage {
    id: string;
    content: string;
    createdAt: Date;
    conversationId: string;
    sender: {
        fullName: string;
        avatarUrl: string | null;
    };
}

export function MessageDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchUnread = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const res = await getUnreadMessages(user.id);
            if (res.success && res.data) {
                setUnreadMessages(res.data);
            }
        };

        fetchUnread();

        // Subscribe to new messages
        const channel = supabase.channel('global-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    const newMessage = payload.new as any;
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user && newMessage.sender_id !== user.id) {
                        // Refresh unread list
                        fetchUnread();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="has-indicator flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="View messages"
            >
                <Mail className="text-xl text-neutral-900 dark:text-white" />
                {unreadMessages.length > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-danger-600 text-[10px] text-white">
                        {unreadMessages.length}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="z-10 absolute right-0 mt-2 w-full max-w-[394px] overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-neutral-700 min-w-[300px]">
                    <div className="m-4 flex items-center justify-between gap-2 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-600/25">
                        <h6 className="mb-0 text-lg font-semibold text-neutral-900">Messages</h6>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-bold text-primary-600 dark:bg-neutral-600 dark:text-white text-xs">
                            {unreadMessages.length}
                        </span>
                    </div>
                    <div className="scroll-sm !border-t-0">
                        <div className="max-h-[400px] overflow-y-auto">
                            {unreadMessages.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No new messages
                                </div>
                            ) : (
                                unreadMessages.map((msg) => (
                                    <Link
                                        key={msg.id}
                                        href={`/messages?id=${msg.conversationId}`}
                                        className="flex justify-between gap-1 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <Image
                                                    className="h-11 w-11 rounded-full object-cover"
                                                    src={msg.sender.avatarUrl || '/assets/images/user.png'}
                                                    alt={msg.sender.fullName}
                                                    width={44}
                                                    height={44}
                                                />
                                            </div>
                                            <div>
                                                <h6 className="fw-semibold mb-1 text-sm">{msg.sender.fullName}</h6>
                                                <p className="mb-0 line-clamp-1 text-sm text-neutral-500">{msg.content}</p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="text-xs text-neutral-500">
                                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        <div className="px-4 py-3 text-center border-t">
                            <Link href="/messages" className="text-center font-semibold text-primary-600 hover:underline dark:text-primary-600 text-sm">
                                See All Messages
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

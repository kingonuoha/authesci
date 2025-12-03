'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { updateLastSeen } from '@/app/actions/chat';

interface RealtimeContextType {
    onlineUsers: Set<string>;
    typingUsers: Record<string, Set<string>>; // conversationId -> Set<userId>
    sendTypingEvent: (conversationId: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({
    userId,
    children
}: {
    userId: string;
    children: ReactNode;
}) {
    const router = useRouter();
    const supabase = createClient();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        // Global channel for presence and database changes
        const channel = supabase.channel('global-chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    console.log('New message received:', payload);
                    // Refresh data to show new message
                    router.refresh();
                }
            )
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const users = new Set<string>();

                Object.values(newState).forEach((presences: any) => {
                    presences.forEach((presence: any) => {
                        if (presence.userId) users.add(presence.userId);
                    });
                });

                setOnlineUsers(users);
            })
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                const { conversationId, userId: typingUserId } = payload;

                setTypingUsers((prev) => {
                    const conversationTyping = new Set(prev[conversationId] || []);
                    conversationTyping.add(typingUserId);
                    return { ...prev, [conversationId]: conversationTyping };
                });

                // Clear typing status after 3 seconds
                setTimeout(() => {
                    setTypingUsers((prev) => {
                        const conversationTyping = new Set(prev[conversationId] || []);
                        conversationTyping.delete(typingUserId);
                        const newPrev = { ...prev, [conversationId]: conversationTyping };
                        if (conversationTyping.size === 0) {
                            delete newPrev[conversationId];
                        }
                        return newPrev;
                    });
                }, 3000);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ userId, onlineAt: new Date().toISOString() });
                    await updateLastSeen(userId);
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router, userId]);

    const sendTypingEvent = (conversationId: string) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'typing',
            payload: { conversationId, userId },
        });
    };

    return (
        <RealtimeContext.Provider value={{ onlineUsers, typingUsers, sendTypingEvent }}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
}


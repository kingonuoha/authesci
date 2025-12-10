'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, Bot, Search } from 'lucide-react';
import { useRealtime } from './realtime-provider';
import { NewChatModal } from './new-chat-modal';
import { AskAiButton } from './ask-ai-button';

interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP' | 'AI_SUPPORT';
    name?: string | null;
    updatedAt: Date;
    messages: {
        content: string;
        createdAt: Date;
    }[];
    participants: {
        user: {
            id: string;
            fullName: string;
            avatarUrl: string | null;
        };
    }[];
}

interface ConversationListProps {
    conversations: Conversation[];
    currentUserId: string;
    currentUserProfile: any;
}

export function ConversationList({
    conversations,
    currentUserId,
    currentUserProfile,
}: ConversationListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeId = searchParams.get('id');
    const { onlineUsers } = useRealtime();
    const supabase = createClient();

    const [items, setItems] = useState<Conversation[]>(conversations);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setItems(conversations);
    }, [conversations]);

    useEffect(() => {
        const channel = supabase.channel('conversation_list_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations',
                },
                (payload) => {
                    const updatedConversation = payload.new as any;
                    setItems((prev) => prev.map((item) =>
                        item.id === updatedConversation.id
                            ? { ...item, name: updatedConversation.name, updatedAt: new Date(updatedConversation.updated_at) }
                            : item
                    ));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const filteredItems = items.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        if (item.name?.toLowerCase().includes(term)) return true;
        const otherParticipant = item.participants.find(p => p.user.id !== currentUserId)?.user;
        return otherParticipant?.fullName.toLowerCase().includes(term);
    });

    return (
        <>
            <div className="flex flex-col gap-3 px-5 pt-5 pb-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 border border-neutral-200 dark:border-neutral-700">
                            <AvatarImage src={currentUserProfile?.avatarUrl || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {currentUserProfile?.fullName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full"></span>
                    </div>
                    <div className="min-w-0">
                        <h6 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                            {currentUserProfile?.fullName || 'User'}
                        </h6>
                        <p className="text-xs text-green-600 dark:text-green-400 truncate">Available</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                    <div className="flex-1">
                        <NewChatModal currentUserId={currentUserId} />
                    </div>
                    <div className="flex-1">
                        <AskAiButton userId={currentUserId} />
                    </div>
                </div>
            </div>

            <div className="chat-search w-full relative px-5 pb-2">
                <span className="icon absolute start-8 top-1/2 -translate-y-1/2 text-xl flex text-neutral-400">
                    <Search className="w-4 h-4" />
                </span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 w-full rounded-lg focus:outline-none focus:ring-1 focus:ring-primary ps-10 pe-4 py-2 text-sm transition-all"
                    autoComplete="off"
                    placeholder="Search chats..."
                />
            </div>

            <div className="chat-all-list flex-1 overflow-y-auto flex flex-col gap-1 mt-2 px-3 pb-3 min-h-0 custom-scrollbar">
                {filteredItems.map((conversation) => {
                    const otherParticipant = conversation.participants.find(
                        (p) => p.user.id !== currentUserId
                    )?.user;

                    const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;
                    const lastMessage = conversation.messages[0];

                    const isGroup = conversation.type === 'GROUP';
                    const isAI = conversation.type === 'AI_SUPPORT';

                    let displayName = 'Unknown User';
                    let displayAvatar = null;

                    if (isGroup) {
                        displayName = conversation.name || 'Group Chat';
                    } else if (isAI) {
                        displayName = 'Authesci AI';
                    } else {
                        displayName = otherParticipant?.fullName || 'Unknown User';
                        displayAvatar = otherParticipant?.avatarUrl;
                    }

                    const isActive = activeId === conversation.id;

                    return (
                        <button
                            key={conversation.id}
                            onClick={() => router.push(`/messages?id=${conversation.id}`)}
                            className={cn(
                                "flex items-center justify-between gap-2 cursor-pointer px-6 py-2.5 transition-colors w-full text-left rounded-lg",
                                isActive
                                    ? "bg-neutral-50 dark:bg-neutral-700/50"
                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="relative shrink-0">
                                    <Avatar className="h-10 w-10">
                                        {isGroup ? (
                                            <AvatarFallback className="bg-purple-100 text-purple-600"><Users className="h-5 w-5" /></AvatarFallback>
                                        ) : isAI ? (
                                            <AvatarFallback className="bg-blue-100 text-blue-600"><Bot className="h-5 w-5" /></AvatarFallback>
                                        ) : (
                                            <>
                                                <AvatarImage src={displayAvatar || ''} />
                                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                                    {displayName?.charAt(0) || '?'}
                                                </AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    {!isGroup && isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full"></span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h6 className="text-sm font-semibold mb-1 text-neutral-900 dark:text-white truncate">
                                        {displayName}
                                    </h6>
                                    <p className="mb-0 text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                        {lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 text-end">
                                {lastMessage && (
                                    <p className="mb-0 text-neutral-400 text-xs lh-1">
                                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false }).replace('about ', '')}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

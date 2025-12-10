'use client';

import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ConversationList } from './conversation-list';

interface ChatLayoutWrapperProps {
    children: React.ReactNode;
    conversations: any[];
    currentUserId: string;
    currentUserProfile: any;
}

export function ChatLayoutWrapper({
    children,
    conversations,
    currentUserId,
    currentUserProfile
}: ChatLayoutWrapperProps) {
    const searchParams = useSearchParams();
    const hasActiveChat = !!searchParams.get('id');

    return (
        <div className="chat-wrapper grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-130px)]">
            <div className={cn(
                "card border-0 overflow-hidden col-span-12 md:col-span-4 xl:col-span-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 h-full",
                hasActiveChat ? "max-md:hidden flex flex-col" : "flex flex-col"
            )}>
                <ConversationList
                    conversations={conversations}
                    currentUserId={currentUserId}
                    currentUserProfile={currentUserProfile}
                />
            </div>
            <div className={cn(
                "col-span-12 md:col-span-8 xl:col-span-9 h-full overflow-hidden",
                hasActiveChat ? "block" : "hidden md:block"
            )}>
                {children}
            </div>
        </div>
    );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getMessages } from '@/app/actions/chat';
import { ChatThread } from '@/components/chat/chat-thread';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { id: true },
    });

    if (!profile) {
        redirect('/onboarding');
    }

    const { id: conversationId } = await searchParams;

    if (!conversationId) {
        return (
            <div className="card border-0 overflow-hidden flex flex-col h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border-neutral-200 dark:border-neutral-700 items-center justify-center text-center p-6">
                <div className="max-w-md space-y-3">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 dark:text-neutral-500"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Select a conversation</h3>
                    <p className="text-neutral-500 dark:text-neutral-400">Choose a chat from the sidebar to start messaging or start a new conversation.</p>
                </div>
            </div>
        );
    }

    const { data: messages } = await getMessages(conversationId);

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            avatarUrl: true,
                            lastSeenAt: true,
                        }
                    }
                }
            }
        }
    });

    const otherParticipantData = conversation?.participants.find(p => p.userId !== profile.id);
    const otherParticipant = otherParticipantData?.user;

    return (
        <ChatThread
            conversationId={conversationId}
            currentUserId={profile.id}
            initialMessages={messages || []}
            conversation={{
                type: conversation?.type || 'DIRECT',
                name: conversation?.name,
                participants: conversation?.participants.map(p => ({
                    id: p.user.id,
                    fullName: p.user.fullName,
                    avatarUrl: p.user.avatarUrl,
                    lastSeenAt: p.user.lastSeenAt
                })) || []
            }}
            otherParticipant={otherParticipant ? {
                id: otherParticipant.id,
                fullName: otherParticipant.fullName,
                avatarUrl: otherParticipant.avatarUrl,
                lastSeenAt: otherParticipant.lastSeenAt,
                lastReadAt: otherParticipantData?.lastReadAt
            } : undefined}
        />
    );
}

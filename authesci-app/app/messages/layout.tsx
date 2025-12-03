import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getConversations } from '@/app/actions/chat';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ChatLayoutWrapper } from '@/components/chat/chat-layout-wrapper';

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
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
    });

    if (!profile) {
        redirect('/onboarding');
    }

    const { data: conversations } = await getConversations(profile.id);

    return (
        <DashboardLayout profile={profile}>
            <ChatLayoutWrapper
                conversations={conversations || []}
                currentUserId={profile.id}
                currentUserProfile={profile}
            >
                {children}
            </ChatLayoutWrapper>
        </DashboardLayout>
    );
}

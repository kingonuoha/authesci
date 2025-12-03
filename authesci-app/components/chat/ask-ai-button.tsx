'use client';

import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { createAiConversation } from '@/app/actions/chat';
import { useRouter } from 'next/navigation';

export function AskAiButton({ userId }: { userId: string }) {
    const router = useRouter();

    const handleClick = async () => {
        const res = await createAiConversation(userId);
        if (res.success && res.data) {
            router.push(`/messages?id=${res.data.id}`);
        }
    };

    return (
        <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleClick}>
            <Bot className="mr-2 h-4 w-4" /> Ask AI Assistant
        </Button>
    );
}

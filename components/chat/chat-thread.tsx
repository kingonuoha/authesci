'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { sendMessage, getUploadSignature, markAsRead, updateConversation, deleteConversation } from '@/app/(app)/actions/chat';
import { useRealtime } from './realtime-provider';
import { Loader2, Pencil, Trash2, Users, MoreVertical, Bot, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string | null;
    sender?: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    } | null;
    attachmentUrl?: string | null;
    attachmentType?: string | null;
}

interface ChatThreadProps {
    conversationId: string;
    currentUserId: string;
    initialMessages: Message[];
    conversation?: {
        type: 'DIRECT' | 'GROUP' | 'AI_SUPPORT';
        name?: string | null;
        participants: {
            id: string;
            fullName: string;
            avatarUrl: string | null;
            lastSeenAt: Date | null;
        }[];
    };
    otherParticipant?: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
        lastSeenAt: Date | null;
        lastReadAt?: Date | null;
    };
}

export function ChatThread({
    conversationId,
    currentUserId,
    initialMessages,
    conversation,
    otherParticipant,
}: ChatThreadProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const { sendTypingEvent, typingUsers, onlineUsers } = useRealtime();
    const supabase = createClient();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [lastReadAt, setLastReadAt] = useState<Date | null>(otherParticipant?.lastReadAt ? new Date(otherParticipant.lastReadAt) : null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [groupName, setGroupName] = useState(conversation?.name || 'Group Chat');

    const isUserScrolledUp = useRef(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const ALL_SUGGESTIONS = [
        "How do I apply for a research grant?",
        "What are the best practices for lab safety?",
        "Explain the latest trends in biotechnology.",
        "Help me draft a funding proposal.",
        "How can I collaborate with other scientists?",
        "What are the requirements for becoming a verified scientist?",
        "Summarize the peer review process.",
        "Tips for managing a research project budget."
    ];

    useEffect(() => {
        // Randomly select 4 suggestions
        const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
    }, []);

    const isTyping = typingUsers[conversationId]?.size > 0;
    const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;

    // Calculate online count for groups
    const onlineCount = conversation?.participants.filter(p => onlineUsers.has(p.id)).length || 0;

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (conversation?.name) {
            setGroupName(conversation.name);
        }
    }, [conversation?.name]);

    useEffect(() => {
        if (otherParticipant?.lastReadAt) {
            setLastReadAt(new Date(otherParticipant.lastReadAt));
        }
    }, [otherParticipant?.lastReadAt]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg && lastMsg.senderId !== currentUserId) {
                        markAsRead(conversationId, currentUserId);
                    }
                }
            },
            { threshold: 0.5 }
        );

        if (lastMessageRef.current) {
            observer.observe(lastMessageRef.current);
        }

        return () => observer.disconnect();
    }, [messages, conversationId, currentUserId]);

    // Parse suggestions from the last AI message
    useEffect(() => {
        if (conversation?.type !== 'AI_SUPPORT') return;
        if (messages.length === 0) {
            // Initial random suggestions are already set by the other useEffect
            return;
        }

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.senderId) {
            // Last message is from user, hide suggestions until AI replies
            setSuggestions([]);
            return;
        }

        // Last message is from AI (senderId is null/undefined usually for AI in this app context, or we check content)
        // In this app, we treat AI messages as having senderId as null or 'ai-bot' in optimistic updates.
        // Let's check the content for our specific delimiter.
        if (lastMessage?.content?.includes('||SUGGESTIONS:')) {
            try {
                const parts = lastMessage.content.split('||SUGGESTIONS:');
                if (parts[1]) {
                    const jsonStr = parts[1].split('||')[0]; // Extract the JSON array part
                    const parsed = JSON.parse(jsonStr);
                    if (Array.isArray(parsed)) {
                        setSuggestions(parsed);
                    }
                }
            } catch (e) {
                console.error('Failed to parse AI suggestions', e);
            }
        }
    }, [messages, conversation?.type]);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        const isMyMessage = lastMessage?.senderId === currentUserId;

        if (scrollRef.current && (!isUserScrolledUp.current || isMyMessage)) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isAiTyping, currentUserId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        isUserScrolledUp.current = !isAtBottom;
    };

    useEffect(() => {
        // Mark as read when opening the thread
        markAsRead(conversationId, currentUserId);

        // Subscribe... (rest of the code unchanged, but need to match the closing of the previous useEffect to avoid syntax errors)
        // Wait, I am replacing a block.
        // Let's ensure I include the full block I am replacing.

        const channel = supabase.channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as any;

                    // If we receive a message from AI (or anyone else really), stop AI typing indicator
                    if (conversation?.type === 'AI_SUPPORT' && newMessage.sender_id !== currentUserId) {
                        setIsAiTyping(false);
                    }

                    // Optimistically append if not already present (though ID check is good)
                    setMessages((prev) => {
                        // Check if message already exists
                        if (prev.some(m => m.id === newMessage.id)) return prev;

                        // We need to fetch sender details or just show basic info until refresh
                        // For now, let's assume senderId is enough or we refetch
                        // But to be instant, we construct a partial message
                        return [...prev, {
                            id: newMessage.id,
                            content: newMessage.content,
                            createdAt: new Date(newMessage.created_at),
                            senderId: newMessage.sender_id,
                            conversationId: newMessage.conversation_id,
                            attachmentUrl: newMessage.attachment_url,
                            attachmentType: newMessage.attachment_type,
                            sender: newMessage.sender_id === currentUserId ? {
                                id: currentUserId,
                                fullName: 'You', // Placeholder
                                avatarUrl: null
                            } : otherParticipant?.id === newMessage.sender_id ? {
                                id: otherParticipant.id,
                                fullName: otherParticipant.fullName,
                                avatarUrl: otherParticipant.avatarUrl
                            } : conversation?.participants.find(p => p.id === newMessage.sender_id) ? {
                                id: newMessage.sender_id,
                                fullName: conversation.participants.find(p => p.id === newMessage.sender_id)?.fullName || 'Unknown',
                                avatarUrl: conversation.participants.find(p => p.id === newMessage.sender_id)?.avatarUrl || null
                            } : conversation?.type === 'AI_SUPPORT' && !newMessage.sender_id ? {
                                id: 'ai-bot',
                                fullName: 'Authesci AI',
                                avatarUrl: null
                            } : null
                        }];
                    });

                    // If we receive a message from someone else, mark it as read immediately if we are viewing
                    if (newMessage.sender_id !== currentUserId) {
                        markAsRead(conversationId, currentUserId);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'participants',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const updatedParticipant = payload.new as any;
                    if (updatedParticipant.user_id !== currentUserId) {
                        setLastReadAt(new Date(updatedParticipant.last_read_at));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, currentUserId, supabase, otherParticipant, conversation]);

    const handleUpdateGroupName = async () => {
        if (!groupName.trim()) return;

        try {
            const result = await updateConversation(conversationId, { name: groupName });
            if (result.success) {
                toast.success('Group name updated');
                setIsEditingName(false);
                router.refresh();
            } else {
                toast.error('Failed to update group name');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleDeleteConversation = async () => {
        if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            try {
                const result = await deleteConversation(conversationId);
                if (result.success) {
                    toast.success('Conversation deleted');
                    router.push('/messages');
                    router.refresh();
                } else {
                    toast.error('Failed to delete conversation');
                }
            } catch (error) {
                toast.error('An error occurred');
            }
        }
    };

    const handleSendMessage = async (content: string, file?: File) => {
        let attachment = undefined;

        if (conversation?.type === 'AI_SUPPORT') {
            setIsAiTyping(true);
        }

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            content,
            createdAt: new Date(),
            senderId: currentUserId,
            sender: {
                id: currentUserId,
                fullName: 'You',
                avatarUrl: null
            },
            attachmentUrl: file ? URL.createObjectURL(file) : undefined,
            attachmentType: file ? (file.type.startsWith('image/') ? 'IMAGE' : 'FILE') : undefined
        };

        setMessages(prev => [...prev, optimisticMessage]);

        if (file) {
            try {
                const { timestamp, signature, apiKey, cloudName } = await getUploadSignature();

                if (!apiKey || !cloudName) {
                    throw new Error('Missing Cloudinary configuration');
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                formData.append('folder', 'authesci-chat');

                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                attachment = {
                    url: data.secure_url,
                    type: data.resource_type === 'image' ? 'IMAGE' : 'FILE',
                };
            } catch (error) {
                console.error('File upload error:', error);
                // Remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.id !== tempId));
                toast.error('Failed to upload attachment');
                if (conversation?.type === 'AI_SUPPORT') setIsAiTyping(false);
                return;
            }
        }

        const result = await sendMessage(conversationId, currentUserId, content, attachment as any);

        if (result.success && result.data) {
            setMessages(prev => {
                // Check if the real message ID already exists (from realtime)
                const exists = prev.some(m => m.id === result.data.id);
                if (exists) {
                    // Just remove the temp message
                    return prev.filter(m => m.id !== tempId);
                }
                // Replace optimistic message with real one
                // Ensure we keep the sender info if the server response is missing it (though it shouldn't be)
                return prev.map(m => m.id === tempId ? {
                    ...result.data,
                    sender: result.data.sender || optimisticMessage.sender,
                    // Ensure camelCase for attachments if server returns snake_case (Prisma usually handles this but just in case)
                    attachmentUrl: result.data.attachmentUrl,
                    attachmentType: result.data.attachmentType
                } as Message : m);
            });
        } else {
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error('Failed to send message');
            if (conversation?.type === 'AI_SUPPORT') setIsAiTyping(false);
        }
    };

    const handleTyping = () => {
        sendTypingEvent(conversationId);
    };

    return (
        <div className="card border-0 overflow-hidden flex flex-col h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-2 px-4 md:px-6 py-2.5 active border-b border-neutral-200 dark:border-neutral-600">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/messages')}
                        className="md:hidden mr-1 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    {conversation?.type === 'GROUP' ? (
                        <>
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-purple-100 text-purple-600"><Users className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex flex-col">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            className="h-7 text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateGroupName()}
                                        />
                                        <Button size="sm" variant="ghost" onClick={handleUpdateGroupName}>Save</Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                                        <h6 className="text-base mb-0 font-semibold text-neutral-900 dark:text-white">{groupName}</h6>
                                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                    </div>
                                )}
                                <p className="mb-0 text-xs text-neutral-500 dark:text-neutral-400">
                                    {onlineCount} people online
                                </p>
                            </div>
                        </>
                    ) : conversation?.type === 'AI_SUPPORT' ? (
                        <>
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-blue-100 text-blue-600"><Bot className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex flex-col">
                                <h6 className="text-base mb-0 font-semibold text-neutral-900 dark:text-white">Authesci AI</h6>
                                <p className="mb-0 text-xs text-neutral-500 dark:text-neutral-400">Always online</p>
                            </div>
                        </>
                    ) : otherParticipant ? (
                        <>
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={otherParticipant.avatarUrl || ''} />
                                    <AvatarFallback className="bg-gray-100 text-gray-600">
                                        {otherParticipant.fullName?.charAt(0) || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full"></span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h6 className="text-base mb-0 font-semibold text-neutral-900 dark:text-white">{otherParticipant.fullName}</h6>
                                <p className="mb-0 text-xs text-neutral-500 dark:text-neutral-400">
                                    {isOnline ? 'Online' : otherParticipant.lastSeenAt
                                        ? `Last seen ${formatDistanceToNow(new Date(otherParticipant.lastSeenAt), { addSuffix: true })}`
                                        : 'Offline'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="font-semibold">Chat</div>
                    )}
                </div>

                <div className="action inline-flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => toast('Call feature coming soon!', { icon: '🚧' })}
                        className="p-2 text-neutral-600 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                        title="Voice Call"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => toast('Video call feature coming soon!', { icon: '🚧' })}
                        className="p-2 text-neutral-600 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                        title="Video Call"
                    >
                        <Video className="w-5 h-5" />
                    </button>

                    {conversation?.type === 'GROUP' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors" type="button">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename Group
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={handleDeleteConversation}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Group
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <div
                className="chat-message-list flex-1 overflow-y-auto flex flex-col p-6 gap-6 bg-neutral-50/30 dark:bg-neutral-900/10"
                onScroll={handleScroll}
            >
                <div className={`flex flex-col ${messages.length === 0 && conversation?.type === 'AI_SUPPORT' ? 'justify-center items-center h-full' : 'justify-end mt-auto'} gap-4`}>
                    {messages.length === 0 && conversation?.type === 'AI_SUPPORT' ? (
                        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500 my-auto">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                                    <Bot className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Hi, I'm Authesci AI
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    Ask me anything about your research, grants, or platform features.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full px-4">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="text-left text-sm p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all hover:border-primary/50 hover:shadow-sm"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => {
                                const isRead = lastReadAt ? new Date(message.createdAt) <= lastReadAt : false;
                                const isLastMessage = index === messages.length - 1;

                                return (
                                    <div key={message.id} ref={isLastMessage ? lastMessageRef : null}>
                                        <MessageBubble
                                            message={message}
                                            isCurrentUser={message.senderId === currentUserId}
                                            isRead={isRead}
                                        />
                                    </div>
                                );
                            })}

                            {/* Dynamic Suggestions for ongoing chat */}
                            {suggestions.length > 0 && conversation?.type === 'AI_SUPPORT' && !isAiTyping && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="text-xs px-3 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {(isTyping || isAiTyping) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4 mb-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {isAiTyping ? 'Authesci AI is typing...' : 'Someone is typing...'}
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
        </div>
    );
}

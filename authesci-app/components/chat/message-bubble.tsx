'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
    message: {
        id: string;
        content: string;
        createdAt: Date;
        sender?: {
            id: string;
            fullName: string;
            avatarUrl: string | null;
        } | null;
        attachmentUrl?: string | null;
        attachmentType?: string | null;
    };
    isCurrentUser: boolean;
    isRead?: boolean;
}

export function MessageBubble({ message, isCurrentUser, isRead }: MessageBubbleProps) {
    return (
        <div className={cn(
            "max-w-[85%] md:max-w-[70%] flex gap-3",
            isCurrentUser ? "ms-auto text-white flex-row-reverse" : "text-neutral-900 dark:text-white"
        )}>
            {!isCurrentUser && (
                <Avatar className="h-9 w-9 shrink-0 mt-auto mb-1">
                    {message.sender ? (
                        <>
                            <AvatarImage src={message.sender.avatarUrl || ''} />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                                {message.sender.fullName?.charAt(0) || '?'}
                            </AvatarFallback>
                        </>
                    ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Bot className="h-5 w-5" />
                        </AvatarFallback>
                    )}
                </Avatar>
            )}

            <div className={cn(
                "p-4 md:p-5 rounded-2xl shadow-sm relative group",
                isCurrentUser
                    ? "bg-primary rounded-br-none"
                    : "bg-white dark:bg-neutral-700 rounded-bl-none border border-neutral-100 dark:border-neutral-600"
            )}>
                <div className={cn(
                    "mb-2 text-sm md:text-base leading-relaxed break-words prose dark:prose-invert max-w-none",
                    isCurrentUser
                        ? "text-primary-foreground prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-ul:text-primary-foreground prose-ol:text-primary-foreground prose-a:text-primary-foreground prose-code:text-primary-foreground prose-pre:bg-primary-800 prose-pre:text-primary-foreground"
                        : "text-neutral-700 dark:text-neutral-200 prose-headings:text-neutral-900 dark:prose-headings:text-white prose-p:text-neutral-700 dark:prose-p:text-neutral-200 prose-strong:text-neutral-900 dark:prose-strong:text-white prose-a:text-primary prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-800"
                )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content.split('||SUGGESTIONS')[0]}
                    </ReactMarkdown>
                </div>

                {message.attachmentUrl && (
                    <div className="mt-3 mb-1">
                        {message.attachmentType === 'IMAGE' ? (
                            <div className="relative aspect-square max-w-[240px] overflow-hidden rounded-xl border border-white/20">
                                <img
                                    src={message.attachmentUrl}
                                    alt="Attachment"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ) : (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "text-xs underline flex items-center gap-1.5 p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors",
                                    isCurrentUser ? "text-white" : "text-primary"
                                )}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span>View Attachment</span>
                            </a>
                        )}
                    </div>
                )}

                <div className={cn(
                    "flex items-center gap-1.5 text-[11px] opacity-80",
                    isCurrentUser ? "justify-end text-primary-foreground/90" : "justify-end text-neutral-400"
                )}>
                    <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                    {isCurrentUser && (
                        <span title={isRead ? "Read" : "Sent"}>
                            {isRead ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

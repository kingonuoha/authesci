'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Bot, FileText, Download } from 'lucide-react';
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
    animateTyping?: boolean;
}

export function MessageBubble({ message, isCurrentUser, isRead, animateTyping = false }: MessageBubbleProps) {
    const [displayedContent, setDisplayedContent] = React.useState(animateTyping ? "" : message.content);
    const [isTypingComplete, setIsTypingComplete] = React.useState(!animateTyping);

    // Reset if content changes or animation prop changes
    React.useEffect(() => {
        if (!animateTyping) {
            setDisplayedContent(message.content);
            setIsTypingComplete(true);
            return;
        }

        // If we already typed this specific content, don't re-type (unless we want to force it)
        // But here we rely on the parent to only pass animateTyping=true for new messages.
        // For safety, if displayedContent matches, stop.
        if (displayedContent === message.content) {
            setIsTypingComplete(true);
            return;
        }

        setDisplayedContent("");
        setIsTypingComplete(false);

        const words = message.content.split(" ");
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex >= words.length) {
                clearInterval(interval);
                setIsTypingComplete(true);
                return;
            }
            // Add next word
            setDisplayedContent(prev => prev ? prev + " " + words[currentIndex] : words[currentIndex]);
            currentIndex++;
        }, 30); // Speed of typing

        return () => clearInterval(interval);
    }, [message.content, animateTyping]);

    const contentToShow = isTypingComplete ? message.content : displayedContent;

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
                        : "text-neutral-700 dark:text-neutral-100 prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100 prose-p:text-neutral-700 dark:prose-p:text-neutral-200 prose-strong:text-neutral-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-800 prose-code:text-neutral-800 dark:prose-code:text-neutral-200"
                )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {contentToShow.split('||SUGGESTIONS')[0]}
                    </ReactMarkdown>
                </div>

                {message.attachmentUrl && (
                    <div className="mt-3 mb-1">
                        {message.attachmentType === 'IMAGE' && !message.attachmentUrl.toLowerCase().endsWith('.pdf') ? (
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
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all group/file text-left",
                                    isCurrentUser
                                        ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-500/50 hover:shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                    isCurrentUser ? "bg-white/20" : "bg-neutral-100 dark:bg-neutral-700"
                                )}>
                                    <FileText className={cn("w-5 h-5", isCurrentUser ? "text-white" : "text-neutral-500 dark:text-neutral-400")} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={cn(
                                        "text-sm font-medium truncate max-w-[150px]",
                                        isCurrentUser ? "text-white" : "text-neutral-900 dark:text-white"
                                    )}>
                                        {decodeURIComponent(message.attachmentUrl.split('/').pop()?.split('?')[0] || "Attachment")}
                                    </p>
                                    <p className={cn(
                                        "text-xs opacity-70",
                                        isCurrentUser ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"
                                    )}>
                                        Download File
                                    </p>
                                </div>
                                <Download className={cn(
                                    "w-4 h-4 opacity-70 group-hover/file:opacity-100 transition-opacity",
                                    isCurrentUser ? "text-white" : "text-neutral-400"
                                )} />
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

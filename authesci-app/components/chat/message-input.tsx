'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Image as ImageIcon, X, File as FileIcon, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
    onSendMessage: (content: string, file?: File) => Promise<void>;
    onTyping: () => void;
}

export function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if ((!content.trim() && !file) || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(content, file || undefined);
            setContent('');
            setFile(null);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleTyping = () => {
        onTyping();
    };

    return (
        <div className="px-6 pb-4 bg-white dark:bg-neutral-800">
            {file && (
                <div className="mb-3 p-2 bg-neutral-50 dark:bg-neutral-700 rounded-lg w-fit border border-neutral-200 dark:border-neutral-600 flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-neutral-200 dark:bg-neutral-600 rounded-md overflow-hidden">
                        {file.type.startsWith('image/') ? (
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FileIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[150px]">
                            {file.name}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                    </div>
                    <button
                        onClick={() => setFile(null)}
                        className="ml-2 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full transition-colors"
                    >
                        <X className="h-4 w-4 text-neutral-500" />
                    </button>
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
                className="chat-message-box flex items-center justify-between py-4 border-t border-neutral-200 dark:border-neutral-600 mt-auto"
            >
                <input
                    type="text"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="border-0 grow bg-white dark:bg-transparent focus:border-0 focus:outline-none focus:ring-0 text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    disabled={isSending}
                />

                <div className="chat-message-box-action flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xl text-neutral-600 dark:text-neutral-200 hover:text-primary transition-colors"
                        disabled={isSending}
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xl text-neutral-600 dark:text-neutral-200 hover:text-primary transition-colors"
                        disabled={isSending}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={(!content.trim() && !file) || isSending}
                        className="btn btn-sm bg-primary hover:bg-primary/90 text-white rounded-lg inline-flex items-center gap-2 px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}

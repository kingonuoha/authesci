'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchContacts, createConversation } from '@/app/actions/chat';
import { useEffect } from 'react';

interface NewChatModalProps {
    currentUserId: string;
}

export function NewChatModal({ currentUserId }: NewChatModalProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const router = useRouter();

    // Simple debounce implementation if hook doesn't exist
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        async function search() {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            const res = await searchContacts(debouncedQuery, currentUserId);
            if (res.success) {
                setResults(res.data || []);
            }
            setLoading(false);
        }
        search();
    }, [debouncedQuery, currentUserId]);

    const toggleUserSelection = (user: any) => {
        setSelectedUsers(prev => {
            const exists = prev.some(u => u.id === user.id);
            if (exists) {
                return prev.filter(u => u.id !== user.id);
            }
            return [...prev, user];
        });
    };

    const handleStartChat = async () => {
        if (selectedUsers.length === 0) return;

        setLoading(true);
        const participantIds = selectedUsers.map(u => u.id);
        const type = participantIds.length > 1 ? 'GROUP' : 'DIRECT';
        const name = type === 'GROUP' ? selectedUsers.map(u => u.fullName).join(', ') : undefined;

        const res = await createConversation(currentUserId, participantIds, type, name);
        if (res.success && res.data) {
            setOpen(false);
            setSelectedUsers([]);
            setQuery('');
            router.push(`/messages?id=${res.data.id}`);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> New Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Selected Users for Group Chat */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((u) => (
                                <div key={u.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                                    <span>{u.fullName}</span>
                                    <button onClick={() => toggleUserSelection(u)} className="hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {loading && query !== debouncedQuery && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!loading && results.length === 0 && debouncedQuery && (
                            <p className="text-center text-sm text-muted-foreground p-4">
                                No users found.
                            </p>
                        )}
                        {results.map((user) => {
                            const isSelected = selectedUsers.some(u => u.id === user.id);
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => toggleUserSelection(user)}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                        isSelected ? "bg-accent" : "hover:bg-muted"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl || ''} />
                                        <AvatarFallback>
                                            {user.fullName?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-medium text-sm">{user.fullName}</span>
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {user.role.toLowerCase()}
                                        </span>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleStartChat} disabled={selectedUsers.length === 0 || loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Chat'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

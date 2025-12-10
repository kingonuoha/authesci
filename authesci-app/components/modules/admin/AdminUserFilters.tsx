"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming you have this, otherwise I'll implement a simple one or duplicate it.
// I will verify if use-debounce exists, if not I'll just use useEffect with timeout.

export function AdminUserFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [role, setRole] = useState(searchParams.get("role") || "ALL");
    const [status, setStatus] = useState(searchParams.get("status") || "ALL"); // Banned/Active
    const [date, setDate] = useState(searchParams.get("date") || ""); // Simple date string for now

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedSearch) params.set("search", debouncedSearch);
        else params.delete("search");

        if (role && role !== "ALL") params.set("role", role);
        else params.delete("role");

        if (status && status !== "ALL") params.set("status", status);
        else params.delete("status");

        if (date) params.set("date", date);
        else params.delete("date");

        params.set("page", "1"); // Reset to page 1 on filter change

        router.push(`?${params.toString()}`);
    }, [debouncedSearch, role, status, date, router]); // Intentionally not including searchParams to avoid loop

    const clearFilters = () => {
        setSearch("");
        setRole("ALL");
        setStatus("ALL");
        setDate("");
        router.push("?");
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="SCIENTIST">Scientist</SelectItem>
                        <SelectItem value="EMPLOYER">Employer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="COLLABORATOR">Collaborator</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="BANNED">Banned</SelectItem>
                    </SelectContent>
                </Select>

                {/* For date, using a simple input type="date" for join date filtering (Joined After) */}
                <Input
                    type="date"
                    placeholder="Joined after..."
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    title="Joined After"
                />
            </div>
            {(search || role !== "ALL" || status !== "ALL" || date) && (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}

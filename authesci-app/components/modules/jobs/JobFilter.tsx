"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { JobType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function JobFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    // Search state (needs local state for debouncing)
    const [search, setSearch] = useState(searchParams.get("search") || "");

    // Sync search state with URL if it changes externally
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = searchParams.get("search") || "";
            if (search !== currentSearch) {
                const params = new URLSearchParams(searchParams.toString());
                if (search) params.set("search", search);
                else params.delete("search");
                router.push(`?${params.toString()}`, { scroll: false });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, searchParams, router]);

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set("search", search); // Keep search
        params.delete("category");
        params.delete("jobType");
        params.delete("sort");

        router.push(`?${params.toString()}`, { scroll: false });
        setOpen(false);
    };

    // Derived state from URL
    const category = searchParams.get("category") || "all";
    const jobType = searchParams.get("jobType") || "all";
    const sort = searchParams.get("sort") || "newest";

    const activeFilterCount = [
        category !== "all",
        jobType !== "all",
        sort !== "newest"
    ].filter(Boolean).length;

    return (
        <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <Input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Filter Jobs</DialogTitle>
                        <DialogDescription>
                            Narrow down your search results. Changes apply immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={category} onValueChange={(val) => updateFilter("category", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="Biology">Biology</SelectItem>
                                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                                    <SelectItem value="Physics">Physics</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Job Type</label>
                            <Select value={jobType} onValueChange={(val) => updateFilter("jobType", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.values(JobType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace("_", " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort By</label>
                            <Select value={sort} onValueChange={(val) => updateFilter("sort", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={clearFilters} className="w-full">Clear Filters</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

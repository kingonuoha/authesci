"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlProps {
    totalPages: number;
    currentPage: number;
}

export function PaginationControl({ totalPages, currentPage }: PaginationControlProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                asChild
            >
                <Link href={createPageURL(1)} aria-disabled={currentPage <= 1}>
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="sr-only">First Page</span>
                </Link>
            </Button>
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                asChild
            >
                <Link href={createPageURL(currentPage - 1)} aria-disabled={currentPage <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                </Link>
            </Button>

            <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </span>

            <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                asChild
            >
                <Link href={createPageURL(currentPage + 1)} aria-disabled={currentPage >= totalPages}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                </Link>
            </Button>
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                asChild
            >
                <Link href={createPageURL(totalPages)} aria-disabled={currentPage >= totalPages}>
                    <ChevronsRight className="h-4 w-4" />
                    <span className="sr-only">Last Page</span>
                </Link>
            </Button>
        </div>
    );
}

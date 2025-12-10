import { Skeleton } from "@/components/ui/skeleton";

export function KanbanSkeleton() {
    return (
        <div className="flex h-full w-full gap-6 overflow-x-auto p-6">
            {[1, 2, 3].map((col) => (
                <div key={col} className="flex h-full w-80 min-w-[320px] flex-col gap-4 rounded-xl bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

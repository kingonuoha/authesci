import { JobCardSkeleton } from "@/components/modules/loaders/JobCardSkeleton";

export default function Loading() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex flex-col gap-4">
                <div className="h-10 w-48 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-96 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <JobCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

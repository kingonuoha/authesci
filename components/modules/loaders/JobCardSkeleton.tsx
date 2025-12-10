import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function JobCardSkeleton() {
    return (
        <Card className="h-full rounded-xl border-0 p-6 text-center">
            <div className="flex justify-center">
                <Skeleton className="mb-4 h-16 w-16 rounded-xl" />
            </div>
            <div className="space-y-2">
                <Skeleton className="mx-auto h-6 w-3/4" />
                <Skeleton className="mx-auto h-4 w-1/2" />
            </div>
            <div className="mt-6 flex justify-center">
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
        </Card>
    );
}

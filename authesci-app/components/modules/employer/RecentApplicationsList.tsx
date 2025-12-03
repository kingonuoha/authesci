import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";

export async function RecentApplicationsList({ employerId }: { employerId: string }) {
    const applications = await prisma.application.findMany({
        where: {
            job: { employerId }
        },
        include: {
            applicant: true,
            job: true
        },
        orderBy: { createdAt: "desc" },
        take: 6 // Increased to 6 for grid
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <Button variant="outline" asChild size="sm">
                    <Link href="/employer/jobs">View All Jobs</Link>
                </Button>
            </div>

            {applications.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No applications yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-neutral-200 dark:border-neutral-700">
                                            <AvatarImage src={app.applicant.profilePicture || ""} />
                                            <AvatarFallback>{app.applicant.fullName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm line-clamp-1" title={app.applicant.fullName}>
                                                {app.applicant.fullName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-primary-600" asChild>
                                        <Link href={`/messages?userId=${app.applicantId}`}>
                                            <MessageSquare className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs text-muted-foreground mb-1">Applied for:</p>
                                    <p className="text-sm font-medium line-clamp-1 text-primary-600 dark:text-primary-400" title={app.job.title}>
                                        {app.job.title}
                                    </p>
                                </div>

                                <Button variant="secondary" size="sm" className="w-full" asChild>
                                    <Link href={`/employer/jobs/${app.job.id}/applicants`}>
                                        View Application <ExternalLink className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

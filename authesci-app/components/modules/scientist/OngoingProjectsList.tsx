import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getProfileId } from "@/lib/auth-utils";

export async function OngoingProjectsList() {
    const userId = await getProfileId();
    if (!userId) return null;

    const projects = await prisma.project.findMany({
        where: {
            collaborators: {
                some: {
                    userId: userId,
                    status: "ACTIVE",
                },
            },
            status: "ACTIVE",
        },
        include: {
            creator: {
                select: { fullName: true },
            },
            tasks: {
                where: { status: { not: "DONE" } },
                take: 1,
            },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ongoing Projects</CardTitle>
            </CardHeader>
            <CardContent>
                {projects.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No active projects.</p>
                ) : (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                            >
                                <div>
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {project.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created by {project.creator.fullName} •{" "}
                                        {formatDistanceToNow(new Date(project.updatedAt), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline">Active</Badge>
                                    {project.tasks.length > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {project.tasks.length} open tasks
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

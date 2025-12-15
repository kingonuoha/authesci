import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function ScientistApplicationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
    });

    if (!profile || profile.role !== "SCIENTIST") {
        redirect("/dashboard");
    }

    const applications = await prisma.application.findMany({
        where: { applicantId: profile.id },
        include: {
            job: {
                include: {
                    employer: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">My Applications</h1>

            {applications.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                        <Link href="/jobs" className="btn btn-primary">Browse Jobs</Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                            <Link href={`/jobs/${app.job.id}`}>{app.job.title}</Link>
                                        </h3>
                                        <Badge variant={
                                            app.status === "ACCEPTED" ? "default" : // Hired
                                                app.status === "REJECTED" ? "destructive" :
                                                    app.status === "SHORTLISTED" ? "secondary" : "outline"
                                        }>
                                            {app.status === "ACCEPTED" ? "HIRED" : app.status}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{app.job.employer.institution}</span>
                                        </div>
                                        {app.job.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{app.job.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                        <span>Job ID: {app.job.id.slice(0, 8)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link href={`/jobs/${app.job.id}`} className="btn btn-outline btn-sm">
                                        View Job
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

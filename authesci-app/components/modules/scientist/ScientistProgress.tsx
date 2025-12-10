import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Link as LinkIcon, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfileId } from "@/lib/auth-utils";

export async function ScientistProgress() {
    const userId = await getProfileId();
    if (!userId) return null;

    const profile = await prisma.profile.findUnique({
        where: { id: userId },
    });

    if (!profile) return null;

    // Calculate completion
    let completedFields = 0;
    const totalFields = 7; // Bio, Skills, Experience, CV, Avatar, Institution, Publications

    if (profile.bio) completedFields++;
    if (profile.skills && profile.skills.length > 0) completedFields++;
    if (profile.experience) completedFields++;
    if (profile.cvUrl) completedFields++;
    if (profile.avatarUrl) completedFields++;
    if (profile.institution) completedFields++;
    if (profile.publications && profile.publications.length > 0) completedFields++;

    const percentage = Math.round((completedFields / totalFields) * 100);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profile Completion
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{percentage}%</span>
                    <span className="text-xs text-muted-foreground">
                        {completedFields}/{totalFields} fields
                    </span>
                </div>
                <Progress value={percentage} className="h-2" />

                {percentage === 100 ? (
                    <div className="flex items-center gap-2 mt-3 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Profile Complete!</span>
                    </div>
                ) : (
                    <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">
                            Complete your profile to increase your chances of being hired.
                        </p>
                        <Button asChild variant="outline" size="sm" className="w-full text-xs h-7">
                            <Link href="/scientist/profile">
                                Finish Profile
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

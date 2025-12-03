import { prisma } from "@/lib/prisma";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <p className="text-xs text-muted-foreground mt-2">
                    Complete your profile to increase your chances of being hired.
                </p>
            </CardContent>
        </Card>
    );
}

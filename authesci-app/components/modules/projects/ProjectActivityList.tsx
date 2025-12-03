import { getProjectActivity } from "@/app/actions/projects";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/modules/common/UserAvatar";

export async function ProjectActivityList({ projectId }: { projectId: string }) {
    const { success, data } = await getProjectActivity(projectId);

    if (!success || !data || data.length === 0) {
        return <div className="text-sm text-neutral-500 italic">No recent activity.</div>;
    }

    return (
        <div className="space-y-4">
            {data.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 items-start">
                    <UserAvatar
                        userId={activity.userId}
                        src={activity.user.avatarUrl}
                        name={activity.user.fullName}
                        className="w-8 h-8 mt-1"
                        showStatus={false}
                    />
                    <div>
                        <p className="text-sm text-neutral-900 dark:text-white">
                            <span className="font-medium">{activity.user.fullName}</span> {activity.action}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

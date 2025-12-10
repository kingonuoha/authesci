import { getProjectActivity } from "@/app/(app)/actions/projects";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/modules/common/UserAvatar";

export async function ProjectActivityList({ projectId, limit = 10 }: { projectId: string; limit?: number }) {
    const { success, data } = await getProjectActivity(projectId, limit);

    if (!success || !data || data.length === 0) {
        return <div className="text-sm text-neutral-500 italic">No recent activity.</div>;
    }

    const formatActivityMessage = (action: string, metadata: any) => {
        switch (action) {
            case "TASK_CREATED":
                return <span>created task <span className="font-medium text-neutral-800 dark:text-neutral-200">"{metadata?.title || 'Unknown'}"</span></span>;
            case "TASK_STATUS_UPDATED":
                return <span>updated status of task <span className="font-medium text-neutral-800 dark:text-neutral-200">"{metadata?.title || 'Unknown'}"</span> to <span className="font-medium text-blue-600 dark:text-blue-400 capitalize">{metadata?.status?.toLowerCase().replace('_', ' ') || 'Unknown'}</span></span>;
            case "TASK_UPDATED":
                return <span>updated task <span className="font-medium text-neutral-800 dark:text-neutral-200">"{metadata?.title || 'Unknown'}"</span></span>;
            case "TASK_DELETED":
                return <span>deleted a task</span>;
            case "FILE_UPLOADED":
                return <span>uploaded file <span className="font-medium text-neutral-800 dark:text-neutral-200">"{metadata?.fileName || 'Unknown'}"</span></span>;
            case "PROJECT_MARKED_COMPLETE":
                return <span>marked the project as <span className="font-medium text-green-600 dark:text-green-400">Complete</span></span>;
            case "PROJECT_COMPLETED":
                return <span>confirmed project completion and <span className="font-medium text-green-600 dark:text-green-400">released payment</span></span>;
            case "COLLABORATOR_INVITED":
                return <span>invited <span className="font-medium text-neutral-800 dark:text-neutral-200">{metadata?.inviteeName || metadata?.inviteeEmail || 'a user'}</span> to the project</span>;
            default:
                // Fallback: try to make action readable (replace _ with space and lowercase)
                return <span>{action.toLowerCase().replace(/_/g, ' ')}</span>;
        }
    };

    return (
        <div className="space-y-4">
            {data.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                    <UserAvatar
                        userId={activity.userId}
                        src={activity.user.avatarUrl}
                        name={activity.user.fullName}
                        className="w-8 h-8 mt-1 flex-shrink-0"
                        showStatus={false}
                    />
                    <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            <span className="font-semibold text-neutral-900 dark:text-white mr-1">{activity.user.fullName}</span>
                            {formatActivityMessage(activity.action, activity.metadata)}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

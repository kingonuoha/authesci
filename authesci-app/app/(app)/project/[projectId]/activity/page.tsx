import { ProjectActivityList } from "@/components/modules/projects/ProjectActivityList";

export default async function ProjectActivityPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Project Activity</h1>
                <p className="text-neutral-500 dark:text-neutral-400">A complete log of all actions taken in this project.</p>
            </div>

            <div className="card rounded-lg border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700">
                <div className="card-body p-6">
                    <ProjectActivityList projectId={projectId} limit={50} />
                </div>
            </div>
        </div>
    );
}

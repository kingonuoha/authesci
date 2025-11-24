import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/modules/kanban/KanbanBoard";

export default async function KanbanPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const collaborators = await prisma.collaborator.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true
        }
      }
    }
  });

  return (
    <div className="h-[calc(100vh-140px)]">
      <KanbanBoard projectId={projectId} initialTasks={tasks as any} collaborators={collaborators} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import FileManager from "@/components/modules/files/FileManager";

export default async function FilesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const files = await prisma.projectFile.findMany({
    where: { projectId: projectId },
    orderBy: { createdAt: 'desc' },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true }
  });

  const isCompleted = project?.status === 'COMPLETED';

  return (
    <div className="p-6">
      <FileManager
        projectId={projectId}
        initialFiles={files}
        readOnly={isCompleted}
      />
    </div>
  );
}

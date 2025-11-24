import { prisma } from "@/lib/prisma";
import FileManager from "@/components/modules/files/FileManager";

export default async function FilesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const files = await prisma.projectFile.findMany({
    where: { projectId: projectId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6">
      <FileManager projectId={projectId} initialFiles={files} />
    </div>
  );
}

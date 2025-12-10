import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProjectLayout from "@/components/layouts/ProjectLayout";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
  });

  if (!profile) {
      redirect("/onboarding");
  }

  // First check if project exists
  const project = await prisma.project.findUnique({
      where: { id: projectId }
  });

  if (!project) {
      notFound();
  }

  // Check if user is a collaborator
  const projectCollaborator = await prisma.collaborator.findFirst({
      where: {
          projectId: projectId,
          userId: profile.id
      },
      include: {
          project: true
      }
  });

  // Allow access if user is a collaborator OR if user is ADMIN (optional, but good practice)
  // For now, strictly collaborator as per previous logic
  if (!projectCollaborator) {
    // Not a collaborator
    redirect("/dashboard?error=Unauthorized");
  }

  return (
    <ProjectLayout project={projectCollaborator.project} profile={profile}>
      {children}
    </ProjectLayout>
  );
}

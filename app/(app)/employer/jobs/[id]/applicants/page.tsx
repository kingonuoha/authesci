import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ApplicantGrid } from "@/components/modules/jobs/ApplicantGrid";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Helper to sign URL if it's a raw file (PDF) that might be authenticated
const getSignedUrl = (url: string | null) => {
  if (!url) return null;
  // If it's already signed (contains signature), return it
  if (url.includes("/s--")) return url;

  try {
    // Attempt to extract public ID and sign it
    // URL format: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<public_id>
    // OR https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/<public_id>

    // We only care if it's a Cloudinary URL
    if (!url.includes("cloudinary.com")) return url;

    // Split by '/upload/'
    const parts = url.split("/upload/");
    if (parts.length !== 2) return url;

    let publicIdWithVersion = parts[1];
    // Remove version if present (starts with v)
    let publicId = publicIdWithVersion;
    if (publicIdWithVersion.match(/^v\d+\//)) {
      publicId = publicIdWithVersion.replace(/^v\d+\//, "");
    }

    // Determine resource type from URL
    const isRaw = url.includes("/raw/");
    const resourceType = isRaw ? "raw" : "image";

    // Generate signed URL
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "authenticated", // Force authenticated to generate signature
      sign_url: true,
      secure: true
    });
  } catch (e) {
    console.error("Failed to sign URL:", e);
    return url;
  }
};

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "EMPLOYER") {
    redirect(`/${profile.role.toLowerCase()}/dashboard`);
  }

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          applicant: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    notFound();
  }

  if (job.employerId !== profile.id) {
    redirect("/employer/jobs"); // Unauthorized
  }

  return (
    <div className="container py-10">
      <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Applicants for {job.title}</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          You have {job.applications.length} applicant{job.applications.length !== 1 && 's'} for this position.
        </p>
      </div>

      <div className="mt-6">
        <ApplicantGrid
          applicants={job.applications.map(app => ({
            id: app.id,
            user: {
              id: app.applicant.userId,
              name: app.applicant.fullName,
              email: app.applicant.email,
              image: app.applicant.avatarUrl,
              role: app.applicant.role,
            },
            status: app.status,
            appliedAt: app.createdAt,
            coverLetter: app.coverLetter,
            aiMatchScore: app.aiMatchScore,
            aiIntel: app.aiIntel as any,
            // Override resumeUrl with signed one if needed (Wait, ApplicantGrid doesn't use resumeUrl prop directly?
            // It just maps 'applicants'. I need to see where resumeUrl is used.
            // Ah, ApplicantGrid uses 'user.image' for avatar.
            // It doesn't seem to show CV link? Step 103: "Read Cover Letter" and "View Profile".
            // "View Profile" goes to /employer/applicants/[id].
            // So I need to sign the URL in THAT page (ApplicantProfilePage).
            // But wait, does ApplicantGrid show CV?
            // No, it shows "Read Cover Letter".
            // So this file (JobApplicantsPage) passes data to ApplicantGrid.
            // But ApplicantGrid links to `/employer/applicants/${applicant.user.id}`.
            // So the signing logic must be in `app/(app)/employer/applicants/[id]/page.tsx`.
            // BUT, if the USER meant "CV View" in the *list*...
            // Step 103 shows no CV link in the grid card.
            // So I should fix `app/(app)/employer/applicants/[id]/page.tsx` instead.
          }))}
        />
      </div>
    </div>
  );
}

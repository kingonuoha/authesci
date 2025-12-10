import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Briefcase, Calendar, Award, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ApplicantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const viewerProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!viewerProfile) {
    redirect("/onboarding");
  }

  if (viewerProfile.role !== "EMPLOYER") {
    redirect(`/${viewerProfile.role.toLowerCase()}/dashboard`);
  }

  // Fetch the applicant's profile
  // The 'id' param here is the user ID (from ApplicantGrid link)
  const applicantProfile = await prisma.profile.findUnique({
    where: { userId: id },
    include: {
        applications: {
            include: {
                job: true
            }
        }
    }
  });

  if (!applicantProfile) {
    notFound();
  }

  return (
    <div className="container py-10 max-w-4xl">
      <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-400"></div>
        
        <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
                <Avatar className="w-[120px] h-[120px] rounded-full object-fit-cover border-4 border-white dark:border-neutral-800 shadow-md">
                    <AvatarImage src={applicantProfile.avatarUrl || ""} alt={applicantProfile.fullName} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-neutral-100 dark:bg-neutral-700">
                        {applicantProfile.fullName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <a href={`mailto:${applicantProfile.email}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                        </a>
                    </Button>
                    {applicantProfile.cvUrl && (
                        <Button asChild>
                            <a href={applicantProfile.cvUrl} target="_blank" rel="noopener noreferrer">
                                <BookOpen className="w-4 h-4 mr-2" />
                                View CV
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">{applicantProfile.fullName}</h1>
                <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-6">{applicantProfile.bio || "No bio provided."}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-neutral-400" />
                                Experience
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                                {applicantProfile.experience || "No experience listed."}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-neutral-400" />
                                Education
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-300">
                                {applicantProfile.institution || "No institution listed."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-neutral-400" />
                                Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {applicantProfile.skills.length > 0 ? (
                                    applicantProfile.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary">{skill}</Badge>
                                    ))
                                ) : (
                                    <p className="text-neutral-500 text-sm">No skills listed.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-neutral-400" />
                                Publications
                            </h3>
                            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-300 space-y-1">
                                {applicantProfile.publications.length > 0 ? (
                                    applicantProfile.publications.map((pub, index) => (
                                        <li key={index}>{pub}</li>
                                    ))
                                ) : (
                                    <p className="text-neutral-500 text-sm">No publications listed.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

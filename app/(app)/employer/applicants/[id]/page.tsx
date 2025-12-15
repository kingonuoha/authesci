import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Briefcase, Calendar, Award, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import cloudinary from "@/lib/cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeviceType } from "@prisma/client";
import { headers } from "next/headers";

// Helper to sign URL
const getSignedUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("/s--")) return url;

    try {
        if (!url.includes("cloudinary.com")) return url;
        const parts = url.split("/upload/");
        if (parts.length !== 2) return url;

        let publicIdWithVersion = parts[1];
        let publicId = publicIdWithVersion;
        if (publicIdWithVersion.match(/^v\d+\//)) {
            publicId = publicIdWithVersion.replace(/^v\d+\//, "");
        }

        const isRaw = url.includes("/raw/");
        const resourceType = isRaw ? "raw" : "image";

        return cloudinary.url(publicId, {
            resource_type: resourceType,
            type: "upload",
            sign_url: true,
            secure: true
        });
    } catch (e) {
        console.error("Failed to sign URL:", e);
        return url;
    }
};

export default async function ApplicantProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const currentUserProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
    });

    if (!currentUserProfile || currentUserProfile.role !== "EMPLOYER") {
        redirect("/dashboard");
    }

    // Fetch applicant profile
    // The 'id' param here is the user ID (from ApplicantGrid link)
    const applicantProfile = await prisma.profile.findUnique({
        where: { userId: id },
        include: {
            applications: {
                include: {
                    job: true
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!applicantProfile) {
        notFound();
    }

    // Sign the CV URL
    const signedCvUrl = getSignedUrl(applicantProfile.cvUrl);

    // --- Profile View & Notification Logic (Batch 8) ---
    const COOLDOWN_HOURS = 0.4;
    const viewerId = currentUserProfile.id;
    const viewedId = applicantProfile.id;

    // 1. Check if we already notified this user about this viewer recently
    const recentNotification = await prisma.notification.findFirst({
        where: {
            userId: viewedId,
            type: "PROFILE_VIEW",
            createdAt: {
                gt: new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000)
            },
            // Note: JSON filtering in Prisma can be tricky. 
            // We'll fetch recent view notifications and filter in memory for safety/simplicity 
            // unless we are sure about the specific JSON structure query support.
        }
    });

    // We only care if the *specific* viewer notified recently. 
    // Since we can't easily query JSON arrays/objects reliably across all prisma versions without strict typing,
    // let's just check if we find one with matching metadata in the returned set (or just one check).
    // Actually, finding *any* recent view might be enough to prevent spam if we wanted global cooldown, 
    // but we want per-employer.

    // Let's refine the query:
    const specificRecentNotification = await prisma.notification.findFirst({
        where: {
            userId: viewedId,
            type: "PROFILE_VIEW",
            createdAt: {
                gt: new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000)
            },
            metadata: {
                path: ['viewerId'],
                equals: viewerId
            }
        }
    });

    // Log the page view
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Unknown";
    // Simple device detection
    let deviceType: DeviceType = DeviceType.DESKTOP;
    if (userAgent.match(/Mobile|Android|iPhone/i)) {
        deviceType = DeviceType.MOBILE;
    } else if (userAgent.match(/iPad|Tablet/i)) {
        deviceType = DeviceType.TABLET;
    }

    // Check for very recent page view (1 hour) to de-dupe
    const recentPageView = await prisma.pageView.findFirst({
        where: {
            path: `/employer/applicants/${viewedId}`, // The path being visited
            userId: currentUserProfile.id, // The viewer (Profile ID)
            timestamp: {
                gt: new Date(Date.now() - 60 * 60 * 1000)
            }
        }
    });

    if (!recentPageView) {
        await prisma.pageView.create({
            data: {
                path: `/employer/applicants/${viewedId}`,
                userId: currentUserProfile.id, // Viewer (Profile ID)
                ipAddress: "127.0.0.1",
                deviceType: deviceType,
                userAgent: userAgent,
            }
        });
    }



    if (!specificRecentNotification) {
        // Send Notification
        const { createNotification } = await import("@/lib/notifications/service"); // Dynamic import to avoid circular deps if any

        await createNotification(
            viewedId,
            "PROFILE_VIEW",
            `${currentUserProfile.fullName} viewed your profile`,
            "Profile Viewed",
            `/scientist/profile`, // Link to their own profile or analytics
            { viewerId: viewerId, viewerName: currentUserProfile.fullName },
            "image",
            currentUserProfile.companyLogoUrl || currentUserProfile.avatarUrl || undefined
        );
    }

    return (
        <div className="container py-10 max-w-4xl">
            <Link href="/employer/jobs" className="inline-flex items-center gap-2 mb-6 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
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
                            {signedCvUrl && (
                                <Button asChild>
                                    <a href={signedCvUrl} target="_blank" rel="noopener noreferrer">
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
                                        Education Background
                                    </h3>
                                    <div className="text-neutral-600 dark:text-neutral-300 space-y-2">
                                        {(() => {
                                            const edu = applicantProfile.education as { degree?: string; courseOfStudy?: string; duration?: string } | null;

                                            if (edu && (edu.degree || edu.courseOfStudy || edu.duration)) {
                                                return (
                                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                                        {applicantProfile.institution && (
                                                            <div className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                                {applicantProfile.institution}
                                                            </div>
                                                        )}
                                                        {edu.degree && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-neutral-700 dark:text-neutral-400">Degree: </span>
                                                                {edu.degree}
                                                            </div>
                                                        )}
                                                        {edu.courseOfStudy && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-neutral-700 dark:text-neutral-400">Course: </span>
                                                                {edu.courseOfStudy}
                                                            </div>
                                                        )}
                                                        {edu.duration && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-neutral-700 dark:text-neutral-400">Duration: </span>
                                                                {edu.duration}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return <p>{applicantProfile.institution || "No education details provided."}</p>;
                                        })()}
                                    </div>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { MapPin, Briefcase, DollarSign, Clock, Copy, ExternalLink, Sparkles, Info, Building2, Users, Shapes, Trash2 } from "lucide-react";
import { Job, Profile } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ApplicantAvatarGroup } from "@/components/modules/jobs/ApplicantAvatarGroup";
import Image from "next/image";
import { MatchReasoning } from "./MatchReasoning";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type JobWithEmployer = Job & {
  employer: Profile;
  matchScore?: number; // Added for AI recommendations
  aiReasoning?: any; // JSON object from AI
  _count?: {
    applications: number;
  };
};

interface JobCardProps {
  job: JobWithEmployer;
  isEmployer?: boolean; // If true, show edit/manage links
  applications?: any[]; // Pass applications for avatar group
}

export function JobCard({ job, isEmployer = false, applications = [] }: JobCardProps) {
  const isRecommended = !isEmployer && (job.matchScore ?? 0) >= 80;

  // ...

  return (
    <div className={`card h-full p-0 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col relative group bg-white dark:bg-neutral-800 ${isRecommended
      ? "border border-purple-500/50 dark:border-purple-400/50 shadow-lg shadow-purple-500/10 dark:shadow-purple-900/20 ring-1 ring-purple-500/20"
      : "border border-neutral-200 dark:border-neutral-700 hover:shadow-lg"
      }`}>
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI PICK
        </div>
      )}

      <div className={`card-header border-b border-neutral-200 dark:border-neutral-700 py-4 px-6 flex justify-between items-start ${isRecommended ? 'bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10' : ''}`}>
        <div className="pr-12 flex gap-3 items-start">
          {/* Company Logo */}
          {/* Company Logo */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900">
            <Image
              src={
                (job.employer as any).companyLogoUrl ||
                (job.employer as any).avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  job.employer.institution || job.employer.fullName
                )}&background=random`
              }
              alt={job.employer.institution || "Company Logo"}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h5 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-1" title={job.title}>{job.title}</h5>
              {isRecommended && (
                <MatchReasoning
                  matchScore={job.matchScore!}
                  reasoning={job.aiReasoning?.reasoning}
                  keyMatches={job.aiReasoning?.keyMatches}
                  missingSkills={job.aiReasoning?.missingSkills}
                />
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              {/* <Building2 className="w-4 h-4" /> */}
              <span className="font-medium">{job.employer.institution || job.employer.fullName}</span>
            </div>
          </div>
        </div>


        {!isRecommended && (
          <span className={`badge ${job.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : job.status === "CLOSED" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"} px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap`}>
            {job.status}
          </span>
        )}
      </div>

      <div className="card-body p-6 flex-1">
        <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            <span>{job.jobType.replace("_", " ")}</span>
          </div>
          {job.projectType && (
            <div className="flex items-center gap-1">
              <Shapes className="w-4 h-4" />
              <span>{job.projectType}</span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.salaryRange && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{job.salaryRange}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </div>
          {job._count?.applications !== undefined && (
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
              <Users className="w-4 h-4" />
              <span>{job._count.applications} Applicants</span>
            </div>
          )}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-4">{job.description}</p>

        {isEmployer && applications && applications.length > 0 && (
          <div className="mt-auto pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">Applicants</span>
              <ApplicantAvatarGroup applicants={applications} max={3} />
            </div>
          </div>
        )}
      </div>
      <div className="card-footer border-t border-neutral-200 dark:border-neutral-600 py-4 px-6 flex justify-end gap-2 bg-neutral-50 dark:bg-neutral-900/50 mt-auto">
        {isEmployer ? (
          <>
            {(job.status === "PENDING_PAYMENT" || job.status === "DRAFT" || job.status === "ACTIVE") && (
              <div className="flex gap-2">
                {job.status === "ACTIVE" && (
                  <RetractButton jobId={job.id} />
                )}
                <Link
                  href={`/employer/jobs/${job.id}/edit`}
                  className="btn btn-outline-secondary text-sm px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700 transition-colors"
                >
                  Edit
                </Link>
              </div>
            )}

            {job.status === "CLOSED" ? (
              <div className="flex gap-2">
                <RemixButton jobId={job.id} />
                <ViewProjectButton jobId={job.id} />
              </div>
            ) : (
              <Link
                href={`/employer/jobs/${job.id}/applicants`}
                className="btn btn-outline-secondary text-sm px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700 transition-colors ml-2"
              >
                View Applicants
              </Link>
            )}
          </>
        ) : (
          <Link
            href={`/jobs/${job.id}`}
            className="btn btn-primary text-sm px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div >
  );
}

function RemixButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemix = async () => {
    const result = await MySwal.fire({
      title: 'Remix Job?',
      text: "This will create a draft copy of this job.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remix it!',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-neutral-300'
      }
    });

    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const { remixJob } = await import("@/app/(app)/actions/jobs");
      const result = await remixJob(jobId);
      if (result.status === "success") {
        toast.success(result.message);
        // Redirect to edit page of new job? Or just refresh list
        // For now, refresh
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to remix job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemix}
      disabled={loading}
      className="btn btn-outline-secondary text-sm px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
    >
      <Copy className="w-4 h-4" />
      {loading ? "Remixing..." : "Remix"}
    </button>
  );
}

function ViewProjectButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleViewProject = async () => {
    setLoading(true);
    try {
      const { getProjectForJob } = await import("@/app/(app)/actions/jobs");
      const result = await getProjectForJob(jobId);
      if (result.status === "success" && result.projectId) {
        router.push(`/project/${result.projectId}`);
      } else {
        toast.error(result.message || "Project not found");
      }
    } catch (error) {
      toast.error("Failed to find project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleViewProject}
      disabled={loading}
      className="btn btn-primary text-sm px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2"
    >
      <ExternalLink className="w-4 h-4" />
      {loading ? "Loading..." : "View Project"}
    </button>
  );
}

function RetractButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRetract = async () => {
    const result = await MySwal.fire({
      title: 'Retract Job?',
      text: "This will remove the job from the marketplace and set it to Draft.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, retract it!',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-neutral-300'
      }
    });

    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const { deleteJob } = await import("@/app/(app)/actions/jobs");
      const res = await deleteJob(jobId);
      if (res.success) {
        toast.success("Job retracted to drafts");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to retract job");
      }
    } catch (error) {
      toast.error("Failed to retract job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetract}
      disabled={loading}
      className="btn btn-outline-danger text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      {loading ? "Retracting..." : "Retract"}
    </button>
  );
}

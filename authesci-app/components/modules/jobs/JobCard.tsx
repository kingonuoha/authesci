"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { MapPin, Briefcase, DollarSign, Clock, Copy, ExternalLink } from "lucide-react";
import { Job, Profile } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

import { ApplicantAvatarGroup } from "@/components/modules/jobs/ApplicantAvatarGroup";

type JobWithEmployer = Job & {
  employer: Profile;
};

interface JobCardProps {
  job: JobWithEmployer;
  isEmployer?: boolean; // If true, show edit/manage links
  applications?: any[]; // Pass applications for avatar group
}

export function JobCard({ job, isEmployer = false, applications = [] }: JobCardProps) {
  return (
    <div className="card h-full p-0 rounded-xl border border-neutral-200 dark:border-neutral-600 overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-neutral-800 flex flex-col">
      <div className="card-header border-b border-neutral-200 dark:border-neutral-600 py-4 px-6 flex justify-between items-start">
        <div>
          <h5 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 line-clamp-1" title={job.title}>{job.title}</h5>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {job.employer.institution || job.employer.fullName}
          </p>
        </div>
        <span className={`badge ${job.status === "ACTIVE" ? "bg-green-100 text-green-700" : job.status === "CLOSED" ? "bg-purple-100 text-purple-700" : "bg-neutral-100 text-neutral-700"} px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap`}>
          {job.status}
        </span>
      </div>
      <div className="card-body p-6 flex-1">
        <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            <span>{job.jobType.replace("_", " ")}</span>
          </div>
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
                     {(job.status === "PENDING_PAYMENT" || job.status === "DRAFT") && (
                        <button
                            onClick={async () => {
                                const { initiateJobPayment } = await import("@/app/actions/jobs");
                                const result = await initiateJobPayment(job.id);
                                if (result.status === "success" && result.paystackUrl) {
                                    window.location.href = result.paystackUrl;
                                } else {
                                    alert(result.message || "Payment initialization failed");
                                }
                            }}
                            className="btn btn-primary text-sm px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                        >
                            Pay Now
                        </button>
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
    </div>
  );
}

function RemixButton({ jobId }: { jobId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRemix = async () => {
        if (!confirm("This will create a draft copy of this job. Continue?")) return;
        setLoading(true);
        try {
            const { remixJob } = await import("@/app/actions/jobs");
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
            const { getProjectForJob } = await import("@/app/actions/jobs");
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

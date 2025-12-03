"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteJobAction } from "@/app/actions/admin";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, Calendar, Users, Briefcase, ExternalLink, Trash2 } from "lucide-react";
import { ApplicantAvatarGroup } from "@/components/modules/jobs/ApplicantAvatarGroup";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Link from "next/link";

const MySwal = withReactContent(Swal);

interface Job {
    id: string;
    title: string;
    employer: any; // Using any for simplicity as we passed full profile
    status: string;
    createdAt: Date;
    salaryRange?: string | null;
    finalPrice?: any; // Decimal
    applications: any[];
    project?: {
        id: string;
        collaborators: any[];
    } | null;
}

interface AdminJobTableProps {
    jobs: Job[];
}

export function AdminJobTable({ jobs }: AdminJobTableProps) {
    const handleDelete = async (jobId: string) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
                popup: 'dark:bg-neutral-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-neutral-300'
            }
        });

        if (result.isConfirmed) {
            const deleteResult = await deleteJobAction(jobId);
            if (deleteResult.success) {
                toast.success("Job deleted");
            } else {
                toast.error("Failed to delete job");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
                const isProject = !!job.project;
                const people = isProject
                    ? job.project!.collaborators.map((c: any) => ({
                        id: c.id,
                        user: {
                            id: c.user.id,
                            name: c.user.fullName,
                            email: c.user.email,
                            image: c.user.avatarUrl
                        },
                        status: c.role, // Show role as status
                        appliedAt: c.joinedAt
                    }))
                    : job.applications.map((a: any) => ({
                        id: a.id,
                        user: {
                            id: a.applicant.id,
                            name: a.applicant.fullName,
                            email: a.applicant.email,
                            image: a.applicant.avatarUrl
                        },
                        status: a.status,
                        appliedAt: a.createdAt
                    }));

                return (
                    <div key={job.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
                        <div className="p-5 flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 gap-3">
                                <div className="flex items-start gap-3 overflow-hidden">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900">
                                        {job.employer.companyLogoUrl ? (
                                            <img
                                                src={job.employer.companyLogoUrl}
                                                alt={job.employer.institution || "Company Logo"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                <Briefcase size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white truncate" title={job.title}>
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                            {job.employer.institution || job.employer.fullName}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                    {job.status}
                                </Badge>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-neutral-400" />
                                    <span>{job.finalPrice ? `$${job.finalPrice}` : job.salaryRange || "Not specified"}</span>
                                </div>
                            </div>

                            {/* People Section */}
                            <div className="mt-auto">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        {isProject ? "Collaborators" : "Applicants"}
                                    </span>
                                    <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                                        {people.length}
                                    </span>
                                </div>
                                <div className="min-h-[32px]">
                                    {people.length > 0 ? (
                                        <ApplicantAvatarGroup
                                            applicants={people}
                                            max={5}
                                            title={isProject ? "Collaborators" : "Applicants"}
                                        />
                                    ) : (
                                        <span className="text-sm text-neutral-400 italic">No {isProject ? "collaborators" : "applicants"} yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(job.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>

                            {isProject ? (
                                <Button asChild size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                                    <Link href={`/project/${job.project!.id}`}>
                                        View Project <ExternalLink className="w-3 h-3 ml-2" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/jobs/${job.id}`}>
                                        View Job
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}

            {jobs.length === 0 && (
                <div className="col-span-full text-center py-12 text-neutral-500">
                    No jobs found.
                </div>
            )}
        </div>
    );
}

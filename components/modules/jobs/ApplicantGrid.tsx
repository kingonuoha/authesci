"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, ArrowRight, CreditCard, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";
import { updateApplicationStatus, startApplicantChat } from "@/app/(app)/actions/applications";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Applicant {
  id: string; // This is the Application ID
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role?: string;
  };
  status: string;
  appliedAt: Date;
  coverLetter?: string | null;
  aiMatchScore?: number | null;
  aiIntel?: {
    matchScore?: number;
    keyMatches?: string[];
    missingSkills?: string[];
    reasoning?: string;
  } | null;
}

interface ApplicantGridProps {
  applicants: Applicant[];
  jobStatus?: string;
}

const COVER_IMAGES = [
  "/assets/images/user-grid/user-grid-bg1.png",
  "/assets/images/user-grid/user-grid-bg2.png",
  "/assets/images/user-grid/user-grid-bg3.png",
  "/assets/images/user-grid/user-grid-bg4.png",
  "/assets/images/user-grid/user-grid-bg5.png",
  "/assets/images/user-grid/user-grid-bg6.png",
  "/assets/images/user-grid/user-grid-bg7.png",
  "/assets/images/user-grid/user-grid-bg8.png",
  "/assets/images/user-grid/user-grid-bg9.png",
  "/assets/images/user-grid/user-grid-bg10.png",
  "/assets/images/user-grid/user-grid-bg11.png",
  "/assets/images/user-grid/user-grid-bg12.png",
];

export const ApplicantGrid: React.FC<ApplicantGridProps> = ({ applicants, jobStatus }) => {
  const router = useRouter();
  const [chatLoadingId, setChatLoadingId] = React.useState<string | null>(null);

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const result = await updateApplicationStatus(applicationId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openConfirmDialog = (type: 'reject', applicantId: string, applicantName: string) => {
    Swal.fire({
      title: 'Confirm Rejection',
      html: `Are you sure you want to reject <strong>${applicantName}</strong>?<br/><br/>They will be notified that they can no longer apply for this particular job.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reject Applicant',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-neutral-300'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusUpdate(
          applicantId,
          ApplicationStatus.REJECTED
        );
      }
    });
  };

  const handleChatClick = async (applicationId: string, userName: string) => {
    setChatLoadingId(applicationId);
    toast.loading(`Starting chat with ${userName}...`, { id: 'chat-toast' });

    try {
      const result = await startApplicantChat(applicationId);

      if (result.success && result.conversationId) {
        toast.success("Chat started! Redirecting...", { id: 'chat-toast' });
        router.push(`/messages?id=${result.conversationId}`);
      } else {
        toast.error(result.error || "Failed to start chat", { id: 'chat-toast' });
        setChatLoadingId(null);
      }
    } catch (error) {
      toast.error("An error occurred", { id: 'chat-toast' });
      setChatLoadingId(null);
    }
  };

  const showCoverLetter = (name: string, coverLetter: string) => {
    Swal.fire({
      title: `Cover Letter from ${name}`,
      html: `<div class="text-left max-h-[60vh] overflow-y-auto p-2">${coverLetter.replace(/\n/g, '<br/>')}</div>`,
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white text-xl font-bold mb-4',
        htmlContainer: 'dark:text-neutral-300 text-base leading-relaxed'
      }
    });
  };

  const showAiReasoning = (applicantName: string, intel: Applicant['aiIntel']) => {
    if (!intel) return;

    const keyMatchesHtml = intel.keyMatches?.length
      ? `<div class="mb-3 text-left">
           <strong class="text-green-600 dark:text-green-400 block mb-1">✅ Key Matches</strong>
           <ul class="list-disc pl-5 text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
             ${intel.keyMatches.map(m => `<li>${m}</li>`).join('')}
           </ul>
         </div>`
      : '';

    const missingSkillsHtml = intel.missingSkills?.length
      ? `<div class="mb-3 text-left">
           <strong class="text-red-500 dark:text-red-400 block mb-1">⚠️ Missing / Gaps</strong>
           <ul class="list-disc pl-5 text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
             ${intel.missingSkills.map(m => `<li>${m}</li>`).join('')}
           </ul>
         </div>`
      : '';

    const reasoningHtml = intel.reasoning
      ? `<div class="text-left bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg mb-4 text-sm text-neutral-700 dark:text-neutral-300">
           ${intel.reasoning}
         </div>`
      : '';

    Swal.fire({
      title: `AI Analysis: ${applicantName}`,
      html: `
        <div class="flex items-center justify-center mb-4">
           <div class="text-3xl font-bold ${intel.matchScore && intel.matchScore >= 70 ? 'text-purple-600' : 'text-neutral-600'}">
             ${intel.matchScore}%
           </div>
           <span class="ml-2 text-sm text-neutral-500">Match Score</span>
        </div>
        ${reasoningHtml}
        <div class="grid grid-cols-1 gap-4">
          ${keyMatchesHtml}
          ${missingSkillsHtml}
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-neutral-300'
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
        {applicants.map((applicant, index) => {
          const coverImage = COVER_IMAGES[index % COVER_IMAGES.length];

          return (
            <div key={applicant.id} className="relative border border-neutral-200 dark:border-neutral-600 rounded-2xl overflow-hidden bg-white dark:bg-neutral-800">
              {/* Cover Background */}
              <div className="h-32 w-full overflow-hidden">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>

              {/* Dropdown Action */}
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm w-8 h-8 rounded-lg flex justify-center items-center text-white transition-colors border border-white/20">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-lg p-1">
                    {applicant.status === "PENDING" && (
                      <DropdownMenuItem
                        className="cursor-pointer px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-200"
                        onClick={() => handleStatusUpdate(applicant.id, ApplicationStatus.SHORTLISTED)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Shortlist
                      </DropdownMenuItem>
                    )}

                    {(applicant.status === "PENDING" || applicant.status === "SHORTLISTED") && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md text-sm font-medium"
                          onClick={() => {
                            if (jobStatus !== "ACTIVE") {
                              toast.error("You must activate the job before hiring an applicant.");
                              return;
                            }
                            window.location.href = `/employer/invoices/${applicant.id}`;
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Hire Applicant
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm font-medium"
                          onClick={() => openConfirmDialog('reject', applicant.id, applicant.user.name || 'Applicant')}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}

                    {applicant.status === "ACCEPTED" && (
                      <DropdownMenuItem disabled className="px-4 py-2 text-sm text-neutral-400">
                        Hired
                      </DropdownMenuItem>
                    )}
                    {applicant.status === "REJECTED" && (
                      <DropdownMenuItem disabled className="px-4 py-2 text-sm text-neutral-400">
                        Rejected
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 text-center relative">
                {/* Avatar - Pulled up to overlap cover */}
                <div className="-mt-[50px] mb-3 flex justify-center relative z-10">
                  <Avatar className="w-[100px] h-[100px] border-4 border-white dark:border-neutral-800 shadow-sm">
                    <AvatarImage src={applicant.user.image || ""} alt={applicant.user.name || "Applicant"} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-600 dark:text-neutral-300">
                      {applicant.user.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h6 className="text-lg font-semibold mb-1 text-neutral-900 dark:text-white">
                  {applicant.user.name || "Unknown Applicant"}
                </h6>

                {/* AI Match Score Badge */}
                {
                  applicant.aiMatchScore && (
                    <div className="mb-4 flex justify-center">
                      <button
                        onClick={() => applicant.aiIntel && showAiReasoning(applicant.user.name || "Applicant", applicant.aiIntel)}
                        disabled={!applicant.aiIntel}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-transform hover:scale-105 active:scale-95 cursor-pointer ${applicant.aiMatchScore >= 80
                          ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                          : applicant.aiMatchScore >= 60
                            ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}>
                        <span className="text-lg">✨</span>
                        {applicant.aiMatchScore}% AI Match
                      </button>
                    </div>
                  )
                }

                {/* Info Section - Matches 'center-border' style */}
                <div className="relative bg-gradient-to-r from-primary-50 to-primary-50/50 dark:from-primary-900/10 dark:to-primary-900/5 rounded-lg p-3 flex items-center justify-between gap-4 mb-6 border border-primary-100 dark:border-primary-900/20">
                  {/* Vertical Divider */}
                  <div className="absolute w-px h-full bg-neutral-200 dark:bg-neutral-700 left-1/2 top-0 transform -translate-x-1/2"></div>

                  <div className="text-center w-1/2 relative z-10">
                    <h6 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">
                      {applicant.status}
                    </h6>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Status</span>
                  </div>

                  <div className="text-center w-1/2 relative z-10">
                    <h6 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">
                      {new Date(applicant.appliedAt).toLocaleDateString()}
                    </h6>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Applied</span>
                  </div>
                </div>

                {
                  applicant.coverLetter && (
                    <button
                      onClick={() => showCoverLetter(applicant.user.name || "Applicant", applicant.coverLetter!)}
                      className="mb-4 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center justify-center gap-1 mx-auto"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Read Cover Letter
                    </button>
                  )
                }

                {/* View Profile Button */}
                <Link
                  href={`/employer/applicants/${applicant.user.id}`}
                  className="bg-primary-50 hover:bg-primary-600 dark:bg-primary-900/20 dark:hover:bg-primary-600 text-primary-600 hover:text-white dark:text-primary-400 dark:hover:text-white transition-all duration-300 py-2.5 px-3 rounded-lg flex items-center justify-center font-medium gap-2 w-full text-sm group"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Static Chat Button */}
                <button
                  onClick={() => handleChatClick(applicant.id, applicant.user.name || "Applicant")}
                  disabled={chatLoadingId === applicant.id}
                  className="mt-2 w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-all duration-300 py-2.5 px-3 rounded-lg flex items-center justify-center font-medium gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-4 h-4" />
                  {chatLoadingId === applicant.id ? "Starting..." : "Chat"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

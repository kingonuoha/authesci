"use client";

import React, { useState } from "react";
import { UserAvatar } from "@/components/modules/common/UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApplicantListModal } from "./ApplicantListModal";

interface Applicant {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  status: string;
  appliedAt: Date;
}

interface ApplicantAvatarGroupProps {
  applicants: Applicant[];
  max?: number;
  showTooltip?: boolean;
  interactive?: boolean;
  title?: string;
}

export const ApplicantAvatarGroup: React.FC<ApplicantAvatarGroupProps> = ({
  applicants,
  max = 5,
  showTooltip = true,
  interactive = true,
  title = "Applicants",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visibleApplicants = applicants.slice(0, max);
  const remainingCount = Math.max(0, applicants.length - max);

  return (
    <>
      <div className="flex -space-x-2 overflow-hidden">
        <TooltipProvider>
          {visibleApplicants.map((applicant) => (
            <Tooltip key={applicant.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <div className={`relative group ${interactive ? "cursor-pointer" : "cursor-default"}`}>
                  <UserAvatar
                    userId={applicant.user.id}
                    src={applicant.user.image}
                    name={applicant.user.name}
                    className="w-8 h-8 border-2 border-white dark:border-neutral-800 transition-transform hover:-translate-y-1"
                    showStatus={true}
                  />
                </div>
              </TooltipTrigger>
              {interactive && showTooltip && (
                <TooltipContent>
                  <p>{applicant.user.name || applicant.user.email}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>

        {remainingCount > 0 && (
          <button
            onClick={() => interactive && setIsModalOpen(true)}
            disabled={!interactive}
            className={`relative w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 border-2 border-white dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 z-10 ${interactive ? "hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors cursor-pointer" : "cursor-default"
              }`}
          >
            +{remainingCount}
          </button>
        )}
      </div>

      {interactive && (
        <ApplicantListModal
          applicants={applicants}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          title={title}
        />
      )}
    </>
  );
};

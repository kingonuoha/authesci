"use client";

import { Profile } from "@prisma/client";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";

export function useProfileCompletion(profile: Profile) {
  const { percentage, isVerified, missingFields } = getProfileCompletion(profile);

  const canApplyForJobs = percentage >= 80;
  const canPostProjects = percentage >= 80;
  const canViewDetails = true; // Always allowed

  return {
    percentage,
    isVerified,
    missingFields,
    permissions: {
      canApplyForJobs,
      canPostProjects,
      canViewDetails,
    },
  };
}

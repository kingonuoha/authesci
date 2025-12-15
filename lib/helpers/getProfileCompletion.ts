import { Profile, Role } from "@prisma/client";

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  isVerified: boolean;
}

const COMMON_FIELDS = ["fullName", "bio", "avatarUrl", "skills"];

const ROLE_FIELDS: Record<Role, string[]> = {
  SCIENTIST: [...COMMON_FIELDS, "institution", "experience", "cvUrl", "education"], // Added education
  EMPLOYER: ["fullName", "bio", "avatarUrl", "institution"], // Removed skills
  COLLABORATOR: [...COMMON_FIELDS], // Minimal requirements for collaborators
  ADMIN: [...COMMON_FIELDS],
};

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name",
  bio: "Bio",
  avatarUrl: "Profile Picture",
  skills: "Skills",
  institution: "Institution/Company",
  experience: "Experience",
  publications: "Publications",
  cvUrl: "CV/Resume",
  certifications: "Certifications",
  education: "Education Details",
};

export function getProfileCompletion(profile: Profile): ProfileCompletion {
  const requiredFields = ROLE_FIELDS[profile.role] || COMMON_FIELDS;
  let filledCount = 0;
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    const value = profile[field as keyof Profile];
    
    let isFilled = false;
    if (Array.isArray(value)) {
      isFilled = value.length > 0;
    } else if (typeof value === "string") {
      isFilled = value.trim().length > 0;
    } else if (typeof value === "object" && value !== null) {
      // Check if object has any non-empty keys (basic check for non-empty education object)
      isFilled = Object.keys(value).length > 0;
    } else {
      isFilled = !!value;
    }

    if (isFilled) {
      filledCount++;
    } else {
      missingFields.push(FIELD_LABELS[field] || field);
    }
  });

  const percentage = Math.round((filledCount / requiredFields.length) * 100);

  return {
    percentage,
    missingFields,
    isVerified: percentage >= 80,
  };
}

"use client";

import Link from "next/link";
import { UserCheck, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

interface ProfileCompletionCardProps {
  percentage: number;
  missingFields: string[];
  role: string;
}

export function ProfileCompletionCard({ percentage, missingFields, role }: ProfileCompletionCardProps) {
  if (percentage >= 80) return null;

  // Determine color scheme based on completion percentage
  const getColorScheme = () => {
    if (percentage >= 80) return {
      gradient: "from-success-600/10",
      icon: "bg-success-600",
      text: "text-success-600 dark:text-success-400",
      border: "border-success-200 dark:border-success-600/50",
    };
    if (percentage >= 50) return {
      gradient: "from-warning-600/10",
      icon: "bg-warning-600",
      text: "text-warning-600 dark:text-warning-400",
      border: "border-warning-200 dark:border-warning-600/50",
    };
    return {
      gradient: "from-primary-600/10",
      icon: "bg-primary-600",
      text: "text-primary-600 dark:text-primary-400",
      border: "border-primary-200 dark:border-primary-600/50",
    };
  };

  const colors = getColorScheme();

  return (
    <div className={`card shadow-none border border-gray-200 dark:border-neutral-600 dark:bg-neutral-700 rounded-lg h-full bg-gradient-to-l ${colors.gradient} to-bg-white`}>
      <div className="card-body p-5">
        {/* Header with Icon and Percentage */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className={`mb-0 w-[50px] h-[50px] ${colors.icon} shrink-0 text-white flex justify-center items-center rounded-full`}>
              <UserCheck className="w-6 h-6" />
            </span>
            <div>
              <p className="font-medium text-neutral-900 dark:text-white mb-1 text-sm">Profile Completion</p>
              <h6 className="mb-0 dark:text-white text-2xl font-bold">{percentage}%</h6>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${colors.icon}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          {percentage >= 80 ? (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400 mt-0.5 shrink-0" />
              <p className="text-neutral-600 dark:text-neutral-300 mb-0">
                Great! Your profile is verified and complete.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400 mt-0.5 shrink-0" />
              <p className="text-neutral-600 dark:text-neutral-300 mb-0">
                Complete your profile to unlock all features
              </p>
            </div>
          )}
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-200 mb-2">
              Missing items:
            </p>
            <ul className="space-y-1">
              {missingFields.slice(0, 3).map((field) => (
                <li key={field} className="text-xs text-secondary-light flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500"></span>
                  {field}
                </li>
              ))}
              {missingFields.length > 3 && (
                <li className="text-xs text-secondary-light italic">
                  +{missingFields.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <Link 
          href={`/${role.toLowerCase()}/profile`}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${colors.icon} hover:opacity-90 text-white`}
        >
          Complete Profile
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

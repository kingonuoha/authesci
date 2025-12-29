"use client";

import { Role } from "@prisma/client";
import { User, Building2, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  role: Role;
  setRole: (role: Role) => void;
  variant?: 'default' | 'glass';
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, setRole, variant = 'default' }) => {
  const isGlass = variant === 'glass';

  return (
    <div className="mb-6">
      <label className={cn("block text-sm font-medium mb-3", isGlass ? "text-white" : "text-neutral-700 dark:text-neutral-300")}>
        I want to join as a...
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scientist Card */}
        <div
          onClick={() => setRole(Role.SCIENTIST)}
          className={cn(
            "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
            isGlass
              ? role === Role.SCIENTIST
                ? "border-white bg-white/20 backdrop-blur-sm"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
              : role === Role.SCIENTIST
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500 hover:border-primary-500 hover:bg-primary-50/50"
                : "border-neutral-200 bg-white dark:bg-neutral-800 dark:border-neutral-700 hover:border-primary-500 hover:bg-primary-50/50"
          )}
        >
          {role === Role.SCIENTIST && (
            <div className={cn("absolute top-3 right-3", isGlass ? "text-white" : "text-primary-600 dark:text-primary-500")}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isGlass
                ? role === Role.SCIENTIST
                  ? "bg-white text-primary-600"
                  : "bg-white/10 text-white"
                : role === Role.SCIENTIST
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
            )}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className={cn("font-semibold text-lg", isGlass ? "text-white" : "text-neutral-900 dark:text-white")}>Scientist</h3>
              <p className={cn("text-xs mt-1 leading-relaxed", isGlass ? "text-white/80" : "text-neutral-500 dark:text-neutral-400")}>
                Find research projects, collaborate with peers, and get funded.
              </p>
            </div>
          </div>
        </div>

        {/* Employer Card */}
        <div
          onClick={() => setRole(Role.EMPLOYER)}
          className={cn(
            "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
            isGlass
              ? role === Role.EMPLOYER
                ? "border-white bg-white/20 backdrop-blur-sm"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
              : role === Role.EMPLOYER
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500 hover:border-primary-500 hover:bg-primary-50/50"
                : "border-neutral-200 bg-white dark:bg-neutral-800 dark:border-neutral-700 hover:border-primary-500 hover:bg-primary-50/50"
          )}
        >
          {role === Role.EMPLOYER && (
            <div className={cn("absolute top-3 right-3", isGlass ? "text-white" : "text-primary-600 dark:text-primary-500")}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isGlass
                ? role === Role.EMPLOYER
                  ? "bg-white text-primary-600"
                  : "bg-white/10 text-white"
                : role === Role.EMPLOYER
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
            )}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={cn("font-semibold text-lg", isGlass ? "text-white" : "text-neutral-900 dark:text-white")}>Employer</h3>
              <p className={cn("text-xs mt-1 leading-relaxed", isGlass ? "text-white/80" : "text-neutral-500 dark:text-neutral-400")}>
                Post jobs, hire talent, and manage research projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;

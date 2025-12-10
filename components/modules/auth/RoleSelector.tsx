"use client";

import { Role } from "@prisma/client";
import { User, Building2, CheckCircle2 } from "lucide-react";

interface RoleSelectorProps {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, setRole }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
        I want to join as a...
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scientist Card */}
        <div
          onClick={() => setRole(Role.SCIENTIST)}
          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 ${role === Role.SCIENTIST
              ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
              : "border-neutral-200 bg-white dark:bg-neutral-800 dark:border-neutral-700"
            }`}
        >
          {role === Role.SCIENTIST && (
            <div className="absolute top-3 right-3 text-primary-600 dark:text-primary-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === Role.SCIENTIST
                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Scientist</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Find research projects, collaborate with peers, and get funded.
              </p>
            </div>
          </div>
        </div>

        {/* Employer Card */}
        <div
          onClick={() => setRole(Role.EMPLOYER)}
          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 ${role === Role.EMPLOYER
              ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
              : "border-neutral-200 bg-white dark:bg-neutral-800 dark:border-neutral-700"
            }`}
        >
          {role === Role.EMPLOYER && (
            <div className="absolute top-3 right-3 text-primary-600 dark:text-primary-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === Role.EMPLOYER
                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Employer</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
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

"use client";

import { useState } from "react";
import { MoreHorizontal, FileText, Check, X, ChevronDown } from "lucide-react";
import { Application, Profile, ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus } from "@/app/actions/applications";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

type ApplicationWithProfile = Application & {
  applicant: Profile;
};

interface ApplicantListProps {
  applications: ApplicationWithProfile[];
}

export function ApplicantList({ applications }: ApplicantListProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.success) {
      toast.success(`Status updated to ${newStatus}`);
      setOpenDropdownId(null);
    } else {
      toast.error("Failed to update status");
    }
  };

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.length === 0 ? (
        <div className="col-span-full text-center py-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">No applications yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400">When candidates apply, they will appear here.</p>
        </div>
      ) : (
        applications.map((app) => (
          <div key={app.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {app.applicant.avatarUrl ? (
                    <img 
                      src={app.applicant.avatarUrl} 
                      alt={app.applicant.fullName} 
                      className="w-12 h-12 rounded-full object-cover border border-neutral-100 dark:border-neutral-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-200 dark:border-blue-800">
                      {app.applicant.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate max-w-[150px]" title={app.applicant.fullName}>
                      {app.applicant.fullName}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[150px]" title={app.applicant.email}>
                      {app.applicant.email}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown(app.id)}
                    className="btn btn-ghost btn-sm p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {openDropdownId === app.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenDropdownId(null)}
                      ></div>
                      <div className="absolute right-0 top-8 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-600 z-20 py-1 overflow-hidden">
                        <button 
                          onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors"
                        >
                          Mark as Shortlisted
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, "ACCEPTED")}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 flex items-center gap-2 transition-colors"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 transition-colors"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`badge px-2.5 py-1 rounded-full text-xs font-medium border ${
                  app.status === "ACCEPTED" ? "bg-green-50 text-green-700 border-green-200" :
                  app.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                  app.status === "SHORTLISTED" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                  "bg-neutral-50 text-neutral-700 border-neutral-200"
                }`}>
                  {app.status}
                </span>
                <span className="text-xs text-neutral-400">
                  {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-900/30 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
              {app.resumeUrl ? (
                <a 
                  href={app.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              ) : (
                <button disabled className="btn btn-outline w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                  <FileText className="w-4 h-4" />
                  No Resume
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

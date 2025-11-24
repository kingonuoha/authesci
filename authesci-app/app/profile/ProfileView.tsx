"use client";

import { Profile } from "@prisma/client";
import { Edit, FileText, Download } from "lucide-react";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div className="card h-full border-0 bg-white dark:bg-neutral-700 rounded-2xl shadow-sm">
      <div className="card-body p-6">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-200 dark:border-neutral-600 pb-4">
          <ul className="flex flex-wrap text-sm font-medium text-center" role="tablist">
            <li className="mr-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 border-primary-600 text-primary-600 rounded-t-lg active dark:text-primary-500 dark:border-primary-500"
                type="button"
                role="tab"
              >
                Overview
              </button>
            </li>
          </ul>
          <button 
            onClick={onEdit} 
            className="btn btn-outline-primary flex items-center gap-2 px-4 py-2 rounded-lg border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="space-y-8">
          {/* Skills */}
          <div>
            <h6 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Skills</h6>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="badge bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">No skills added yet.</p>
            )}
          </div>

          {/* Experience */}
          <div>
            <h6 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Experience</h6>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600">
              <p className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                {profile.experience || "No experience details provided."}
              </p>
            </div>
          </div>

          {/* Publications (Scientist Only) */}
          {profile.role === "SCIENTIST" && (
            <div>
              <h6 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Publications</h6>
              {profile.publications.length > 0 ? (
                <ul className="space-y-3">
                  {profile.publications.map((pub, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600">
                      <div className="mt-1 min-w-[24px]">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-200">{pub}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400">No publications listed.</p>
              )}
            </div>
          )}

          {/* CV Download */}
          {profile.cvUrl && (
            <div>
              <h6 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Resume / CV</h6>
              <a 
                href={profile.cvUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors border border-primary-200"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

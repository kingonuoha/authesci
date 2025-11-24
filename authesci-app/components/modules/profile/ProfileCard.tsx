"use client";

import { Profile } from "@prisma/client";
import Image from "next/image";
import { VerifiedBadge } from "@/components/modules/profile/VerifiedBadge";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { isVerified } = getProfileCompletion(profile);

  return (
    <div className="user-grid-card relative border border-neutral-200 dark:border-neutral-600 rounded-2xl overflow-hidden bg-white dark:bg-neutral-700 h-full">
      {/* Cover Image */}
      <Image
        src="/assets/images/user-grid/user-grid-bg1.png"
        alt="Cover"
        width={400}
        height={150}
        className="w-full object-cover h-[150px]"
      />
      
      {/* Profile Content with negative margin to overlap cover */}
      <div className="pb-6 ms-6 mb-6 me-6 -mt-[100px]">
        <div className="text-center border-b border-neutral-200 dark:border-neutral-600 pb-6">
          {/* Profile Picture */}
          <div className="relative mx-auto w-[200px] h-[200px]">
            <Image
              src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=random&size=800`}
              alt={profile.fullName}
              fill
              className="border-4 border-white dark:border-neutral-700 rounded-full object-cover"
            />
          </div>
          
          {/* Name and Email */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <h6 className="mb-0 text-lg font-semibold text-neutral-900 dark:text-white">
              {profile.fullName}
            </h6>
            {isVerified && <VerifiedBadge />}
          </div>
          <span className="text-secondary-light text-sm mb-4 block">
            {profile.email}
          </span>
        </div>
        
        {/* Personal Info Section */}
        <div className="mt-6">
          <h6 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
            Personal Info
          </h6>
          <ul>
            <li className="flex items-center gap-1 mb-3">
              <span className="w-[30%] text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                Full Name
              </span>
              <span className="w-[70%] text-secondary-light text-sm font-medium">
                : {profile.fullName}
              </span>
            </li>
            <li className="flex items-center gap-1 mb-3">
              <span className="w-[30%] text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                Email
              </span>
              <span className="w-[70%] text-secondary-light text-sm font-medium">
                : {profile.email}
              </span>
            </li>
            <li className="flex items-center gap-1 mb-3">
              <span className="w-[30%] text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                Role
              </span>
              <span className="w-[70%] text-secondary-light text-sm font-medium">
                : {profile.role}
              </span>
            </li>
            {profile.institution && (
              <li className="flex items-center gap-1 mb-3">
                <span className="w-[30%] text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                  Institution
                </span>
                <span className="w-[70%] text-secondary-light text-sm font-medium">
                  : {profile.institution}
                </span>
              </li>
            )}
            <li className="flex items-start gap-1">
              <span className="w-[30%] text-sm font-semibold text-neutral-600 dark:text-neutral-200">
                Bio
              </span>
              <span className="w-[70%] text-secondary-light text-sm font-medium">
                : {profile.bio || "No bio provided."}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

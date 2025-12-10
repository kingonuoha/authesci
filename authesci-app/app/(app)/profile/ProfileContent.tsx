"use client";

import { useState } from "react";
import { Profile } from "@prisma/client";
import { ProfileView } from "./ProfileView";
import { ProfileEditForm } from "./ProfileEditForm";
import { ProfileCard } from "@/components/modules/profile/ProfileCard";

interface ProfilePageProps {
  profile: Profile;
  banks?: any[];
}

export default function ProfilePage({ profile, banks }: ProfilePageProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <ProfileCard profile={profile} />
        </div>
        <div className="col-span-12 lg:col-span-8">
          {isEditMode ? (
            <ProfileEditForm 
              profile={profile} 
              banks={banks}
              onCancel={() => setIsEditMode(false)} 
            />
          ) : (
            <ProfileView 
              profile={profile} 
              onEdit={() => setIsEditMode(true)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

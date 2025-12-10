import React from 'react';
import Image from 'next/image';

interface ProfileInfo {
  label: string;
  value: string;
}

interface ProfileCardProps {
  name: string;
  email: string;
  avatarUrl: string;
  coverImageUrl: string;
  personalInfo: ProfileInfo[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, avatarUrl, coverImageUrl, personalInfo }) => {
  return (
    <div className="user-grid-card relative border border-neutral-200 dark:border-neutral-600 rounded-2xl overflow-hidden bg-white dark:bg-neutral-700 h-full">
      <Image src={coverImageUrl} alt="Cover" width={400} height={150} className="w-full object-cover" />
      <div className="pb-6 ms-6 mb-6 me-6 -mt-[100px]">
        <div className="text-center border-b border-neutral-200 dark:border-neutral-600 pb-6">
          <Image src={avatarUrl} alt={name} width={200} height={200} className="border-4 border-white dark:border-neutral-800 w-[200px] h-[200px] rounded-full object-cover mx-auto" />
          <h6 className="mb-0 mt-4 text-xl font-semibold">{name}</h6>
          <span className="text-secondary-light mb-4">{email}</span>
        </div>
        <div className="mt-6">
          <h6 className="text-xl mb-4">Personal Info</h6>
          <ul>
            {personalInfo.map((info, index) => (
              <li key={index} className="flex items-center gap-1 mb-3">
                <span className="w-[30%] text-base font-semibold text-neutral-600 dark:text-neutral-200">{info.label}</span>
                <span className="w-[70%] text-secondary-light font-medium">: {info.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

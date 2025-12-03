'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client'; // Assuming Role enum is available from Prisma client
import { Users } from 'lucide-react'; // Icon for role switching
import { updateRole } from '@/app/actions/role'; // Server Action to update role

interface RoleSwitcherProps {
  currentRole: Role;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole }) => {
  const router = useRouter();

  // Only enable role switching in development and if the environment variable is set
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ROLE_SWITCHING !== 'true') {
    return null;
  }

  const roles = Object.values(Role); // Get all possible roles from Prisma enum

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) return;

    try {
      await updateRole(newRole);
      // Redirect to the dashboard corresponding to the new role
      router.push(`/${newRole.toLowerCase()}/dashboard`);
      router.refresh(); // Revalidate data
    } catch (error) {
      console.error('Failed to update role:', error);
      // Optionally, show a toast notification for the error
    }
  };

  return (
    <li>
      <div className="flex items-center gap-4 px-0 py-2 text-black">
        <Users className="icon text-xl" />
        <select
          value={currentRole}
          onChange={(e) => handleRoleChange(e.target.value as Role)}
          className="bg-transparent border-none focus:ring-0 focus:outline-none p-0 m-0 cursor-pointer"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              Switch to {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
};

export default RoleSwitcher;

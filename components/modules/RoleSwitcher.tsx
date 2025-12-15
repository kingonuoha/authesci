'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { Users } from 'lucide-react';
import { updateRole } from '@/app/(app)/actions/role';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

interface RoleSwitcherProps {
  currentRole: Role;
}

const ALLOWED_ROLES = [Role.SCIENTIST, Role.EMPLOYER];

const ADMIN_PIN = "5862";
const MAX_ATTEMPTS = 3;

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole }) => {
  const router = useRouter();
  const [isGodModeReady, setIsGodModeReady] = React.useState(false);

  // Track key combo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey) {
        setIsGodModeReady(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey || !e.altKey) {
        setIsGodModeReady(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Filter roles to only include allowed ones for switching
  const availableRoles = ALLOWED_ROLES.filter(role => role !== currentRole);

  const handleRoleChange = async (newRole: Role) => {
    // Hidden "God Mode" logic
    if (isGodModeReady) {
      // Check if locked out
      const failedAttempts = parseInt(localStorage.getItem('authesci_admin_attempts') || '0');
      if (failedAttempts >= MAX_ATTEMPTS) {
        toast.error("You cannot use this feature again. Checkmate.");
        return;
      }

      // Prompt for PIN
      const { value: pin } = await Swal.fire({
        title: 'Enter Admin PIN',
        input: 'password',
        inputLabel: 'Restricted Access',
        inputPlaceholder: 'Enter 4-digit PIN',
        confirmButtonText: 'Vertify',
        showCancelButton: true,
        background: '#1e1e1e', // Dark theme consistent with "hacker" vibe
        color: '#00ff00',
        customClass: {
          input: 'text-center tracking-widest'
        }
      });

      if (pin === ADMIN_PIN) {
        // reset attempts on success
        localStorage.removeItem('authesci_admin_attempts');

        const loadToast = toast.loading("Elevating privileges...");
        try {
          await updateRole(Role.ADMIN);
          toast.dismiss(loadToast);
          toast.success("Welcome back, Administrator.");
          router.push('/admin/dashboard');
          router.refresh();
          return; // Stop further execution
        } catch (error) {
          toast.dismiss(loadToast);
          toast.error("Elevation failed.");
        }
      } else if (pin) { // If pin entered but wrong
        const newCount = failedAttempts + 1;
        localStorage.setItem('authesci_admin_attempts', newCount.toString());
        toast.error(`Invalid PIN. Attempts remaining: ${MAX_ATTEMPTS - newCount}`);
        return; // Stop
      } else {
        return; // Cancelled
      }
    }

    // Normal Flow
    if (newRole === currentRole) return;

    // Special verification for Admins (switching OUT)
    if (currentRole === Role.ADMIN) {
      const result = await Swal.fire({
        title: 'Irreversible Action Warning',
        text: "Switching to a standard role will permanently remove your Admin privileges. You will not be able to revert this change or switch back to Admin status.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, forfeit admin rights',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'dark:bg-slate-900 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-slate-300'
        }
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      await updateRole(newRole);
      // Redirect to the dashboard corresponding to the new role
      const dashboardPath = newRole === Role.SCIENTIST ? '/scientist/dashboard' : '/employer/dashboard';
      router.push(dashboardPath);
      toast.success(`Role switched to ${newRole.toLowerCase()}`);
      router.refresh(); // Revalidate data
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to switch role');
    }
  };

  // If the user's current role isn't in the allowed lists AND isn't Admin, hide the switcher
  // Admins can see it to switch OUT, but normal users can only switch between Scientist/Employer.
  if (!(ALLOWED_ROLES as Role[]).includes(currentRole) && currentRole !== Role.ADMIN) {
    return null;
  }

  return (
    <li>
      <div className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-200">
        <Users className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <select
          value={currentRole}
          onChange={(e) => handleRoleChange(e.target.value as Role)}
          className="bg-transparent border-none focus:ring-0 focus:outline-none p-0 m-0 cursor-pointer text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-full"
        >
          <option value={currentRole} disabled className="dark:bg-neutral-800">
            Current: {currentRole.charAt(0) + currentRole.slice(1).toLowerCase()}
          </option>
          {availableRoles.map((role) => (
            <option key={role} value={role} className="dark:bg-neutral-800">
              Switch to {role.charAt(0) + role.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
};

export default RoleSwitcher;

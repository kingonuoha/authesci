"use client";

import { Role } from "@prisma/client";
import { Icon, Users } from "lucide-react";

interface RoleSelectorProps {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, setRole }) => {
  return (
    <div className="icon-field mb-4 relative">
      <span className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none flex text-xl">
        {/* <iconify-icon icon="clarity:users-line"></iconify-icon> */}
        <Users />
      </span>
      <select
        id="role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="form-control h-[56px] ps-11 border-neutral-300 bg-neutral-50 dark:bg-dark-2 rounded-xl"
      >
        <option value={Role.SCIENTIST}>Scientist</option>
        <option value={Role.EMPLOYER}>Employer</option>
      </select>
    </div>
  );
};

export default RoleSelector;

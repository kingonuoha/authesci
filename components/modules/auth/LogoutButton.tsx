"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/(app)/actions/auth";

export function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-4 px-0 py-2 text-neutral-900 dark:text-white hover:text-danger-600 dark:hover:text-danger-400 w-full"
    >
      <LogOut className="icon text-xl" />
      Log Out
    </button>
  );
}

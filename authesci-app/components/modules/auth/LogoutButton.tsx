"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-4 px-0 py-2 text-black hover:text-danger-600 w-full"
    >
      <LogOut className="icon text-xl" />
      Log Out
    </button>
  );
}
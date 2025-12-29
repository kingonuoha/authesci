"use client";

import { useEffect } from "react";
import { updateLastSeen } from "@/app/(app)/actions/profile";
import { usePathname } from "next/navigation";

const UPDATE_INTERVAL = 60000; // 60 seconds

export function ActivityUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    // We don't need to run this on public pages or auth pages
    if (pathname.startsWith("/auth")) {
      return;
    }

    // Update immediately on first load
    updateLastSeen();

    const intervalId = setInterval(() => {
      updateLastSeen();
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [pathname]); // Rerun if the user navigates to a new page

  return null; // This component does not render anything
}

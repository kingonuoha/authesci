"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/modules/Sidebar";
import { Role } from "@prisma/client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface MobileSidebarProps {
    role: Role;
    isMobileSidebarOpen: boolean;
    toggleMobileSidebar: () => void;
    activeProjectCount?: number;
}

export function MobileSidebar({ role, isMobileSidebarOpen, toggleMobileSidebar, activeProjectCount }: MobileSidebarProps) {
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        if (isMobileSidebarOpen) {
            toggleMobileSidebar();
        }
    }, [pathname]);

    return (
        <Sheet open={isMobileSidebarOpen} onOpenChange={toggleMobileSidebar}>
            <SheetContent side="left" className="p-0 border-r-0 w-[260px] sm:w-[300px] overflow-y-auto">
                <Sidebar
                    role={role}
                    isSidebarOpen={true} // Revert to true for expanded mobile view
                    isMobileSidebarOpen={true} // Force mobile sidebar open class
                    activeProjectCount={activeProjectCount}
                    className="!h-full !relative !translate-x-0 !w-full" // Restore original overrides
                    toggleMobileSidebar={toggleMobileSidebar}
                />
            </SheetContent>
        </Sheet>
    );
}

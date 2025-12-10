"use client";

import { CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`bg-blue-500 text-white rounded-full p-1 ${className}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Profile (80%+ Complete)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

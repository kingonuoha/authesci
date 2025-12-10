// authesci-app/components/modules/utilities/LoadingSkeleton.tsx

import { cn } from "@/lib/utils";
import React from "react";

/**
 * @typedef {Object} LoadingSkeletonProps
 * @property {string} [className] - Additional CSS classes for the skeleton.
 */

/**
 * Renders a loading skeleton component.
 *
 * @param {LoadingSkeletonProps & React.HTMLAttributes<HTMLDivElement>} props - The properties for the loading skeleton.
 * @returns {JSX.Element} The rendered loading skeleton component.
 */
function LoadingSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      role="status"
      aria-live="polite"
      {...props}
    />
  );
}

export { LoadingSkeleton };

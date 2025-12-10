import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-neutral-50 dark:bg-neutral-800 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

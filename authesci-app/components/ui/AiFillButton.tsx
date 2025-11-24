import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiFillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export const AiFillButton: React.FC<AiFillButtonProps> = ({
  onClick,
  isLoading = false,
  label = "Fill with AI",
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "group relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white",
        "badge bg-gradient-to-r from-primary-700 to-purple-400 ",
        "hover:bg-right transition-all duration-500 shadow-lg hover:shadow-purple-500/30",
        "overflow-hidden border border-white/20",
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 rounded-full border border-white/30 group-hover:border-white/60 transition-colors animate-pulse"></span>
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
      )}
      <span className="relative z-10 text-white">{isLoading ? "Generating..." : label}</span>
    </button>
  );
};

import { toast } from "@/hooks/use-toast";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ToastType = "default" | "success" | "error" | "info";

export function showToast(type: ToastType, title: string, description?: string | object | any[]) {
  let formattedDescription: string | undefined = undefined;

  if (description) {
    if (Array.isArray(description)) {
      formattedDescription = description.map((item: any) => item.message || JSON.stringify(item)).join(', ');
    } else if (typeof description === 'object') {
      formattedDescription = (description as any).message || JSON.stringify(description);
    } else {
      formattedDescription = description;
    }
  }

  let variant: "default" | "destructive" | "success" | "warning" | "info" = "default";
  if (type === "error") {
    variant = "destructive";
  } else if (type === "success") {
    variant = "success";
  } else if (type === "warning") {
    variant = "warning";
  } else if (type === "info") {
    variant = "info";
  }

  toast({
    variant: variant,
    title,
    description: formattedDescription,
  });
}

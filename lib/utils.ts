import { toast } from "react-hot-toast";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ToastType = "default" | "success" | "error" | "info" | "warning";

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

  const message = formattedDescription ? `${title}: ${formattedDescription}` : title;

  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast(message, { icon: '⚠️' });
      break;
    case "info":
      toast(message, { icon: 'ℹ️' });
      break;
    default:
      toast(message);
      break;
  }
}

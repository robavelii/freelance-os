import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAbsoluteUrl(path: string = "") {
  // Ensure path starts with / if it's not empty
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${normalizedPath}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${normalizedPath}`;
  }

  return `http://localhost:3000${normalizedPath}`;
}

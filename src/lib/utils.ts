import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (!url) return url;

  // Pattern to match common Google Drive sharing links
  // e.g., https://drive.google.com/file/d/1i876slCVkbBOHtzhy5R9XoJj5CLuIBVS/view?usp=sharing
  // Matches /file/d/ID...
  const idPattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(idPattern);

  if (match && match[1]) {
    // Use the thumbnail API which is more reliable for embedding than uc?export=view
    // sz=w1920 ensures a high-res image
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1920`;
  }

  return url;
}

export function cleanUndefined(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/* NECESSITY: Utility for merging Tailwind classes */
/* LOGIC: Combines clsx and tailwind-merge for conditional classes */
/* EDGE-CASE: Handles conflicting Tailwind classes correctly */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

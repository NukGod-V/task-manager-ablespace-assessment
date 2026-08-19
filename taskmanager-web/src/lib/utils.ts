import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merges conditional classNames and resolves Tailwind class conflicts
// (e.g. cn('p-2', condition && 'p-4') correctly keeps only 'p-4').
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
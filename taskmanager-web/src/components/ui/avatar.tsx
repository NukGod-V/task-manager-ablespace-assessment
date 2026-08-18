'use client';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'from-violet-400 to-fuchsia-500', 'from-sky-400 to-blue-500', 'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500',
];
function gradientFor(name?: string | null) {
  const safe = name && name.length > 0 ? name : '?';
  const hash = safe.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

interface AvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  initials: string;
  size?: number;
  className?: string;
  title?: string;
}

// Single source of truth for rendering a person anywhere in the app — real
// photo (Google accounts, or an uploaded profile picture) when available,
// colored-initial fallback otherwise.
export function Avatar({ name, avatarUrl, initials, size = 20, className, title }: AvatarProps) {
  const style = { width: size, height: size };
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? ''}
        title={title ?? name ?? undefined}
        style={style}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    );
  }
  return (
    <div
      title={title ?? name ?? undefined}
      style={{ ...style, fontSize: Math.max(8, size * 0.42) }}
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-medium text-white', gradientFor(name), className)}
    >
      {initials}
    </div>
  );
}
import { cn } from '@/lib/utils';

const BAR_HEIGHTS = [4, 7, 10, 13];

interface PriorityIconProps {
  level: number; // 0 = none, 1 = low ... 4 = urgent
  colorClass: string; // text-* token for lit bars
  size?: number;
  className?: string;
}

// Custom signal-bar glyph matching the reference exactly — ascending bars,
// N of 4 lit per severity level. No icon library ships this style.
export function PriorityIcon({ level, colorClass, size = 14, className }: PriorityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={cn('shrink-0', className)} aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <rect
          key={i}
          x={1 + i * 4}
          y={14 - h}
          width={2.5}
          height={h}
          rx={0.5}
          className={i < level ? colorClass : 'text-priority-none'}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
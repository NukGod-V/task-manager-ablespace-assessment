'use client';

import { useEffect, useState } from 'react';
import { Board, type BoardProps } from './board';

// Unchanged reasoning from your fix: defer Board's entire render until
// after hydration so dnd-kit's client-generated aria-describedby IDs never
// diverge from SSR output. Now just forwards props through to Board.
export function BoardBoundary(props: BoardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Board {...props} />;
}
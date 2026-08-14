'use client';

import { useEffect, useState } from 'react';
import { Board, type BoardProps } from './board';

export function BoardBoundary(props: BoardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Board {...props} />;
}
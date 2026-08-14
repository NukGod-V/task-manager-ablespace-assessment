'use client';

import { useEffect, useState } from 'react';
import { Board } from './board';

export function BoardBoundary() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side, so dnd-kit's IDs are set up before React hydrates.
  if (!mounted) return null;

  return <Board />;
}
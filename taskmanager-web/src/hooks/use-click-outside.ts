import { useEffect, RefObject } from 'react';

// Generic click-outside + Escape-key handler, used instead of pulling in
// Radix/shadcn just for this. Reusable for any future popover (Fields
// dropdown, Filter dropdown, date picker, etc.).
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
) {
  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handler();
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, handler]);
}
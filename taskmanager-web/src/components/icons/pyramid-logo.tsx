// SVG approximation of the black rounded-square badge from the screenshot.
// Swap the inner <path> for Figma's actual exported SVG if you have one —
// this is a close visual stand-in, not a pixel-traced export.
export function PyramidLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="24" height="24" rx="7" fill="#0A0A0A" />
      <path d="M12 6.5 17 16H7l5-9.5Z" fill="#FFFFFF" />
    </svg>
  );
}
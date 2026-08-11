// Approximated from the screenshot — a black rounded-square badge with a
// simple white mark. Swap the inner path for the real exported SVG if you
// have one from Figma; this is a close visual stand-in, not a pixel trace.
export function PyramidLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect width="24" height="24" rx="7" fill="#0A0A0A" />
      <path d="M12 6.5 17 16H7l5-9.5Z" fill="#FFFFFF" />
    </svg>
  );
}
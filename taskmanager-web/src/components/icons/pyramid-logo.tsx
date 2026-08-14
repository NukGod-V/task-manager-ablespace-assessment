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

//<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 5H3L3 16H5L5 5L8 5V4L4 0L0 4V5Z" fill="#000000"></path> <path d="M16 16H10V14H16V16Z" fill="#000000"></path> <path d="M10 12H14V10H10V12Z" fill="#000000"></path> <path d="M12 8H10V6H12V8Z" fill="#000000"></path> </g></svg>
//<svg viewBox="-1.6 -1.6 19.20 19.20" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(270)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.352"></g><g id="SVGRepo_iconCarrier"> <path d="M0 5H3L3 16H5L5 5L8 5V4L4 0L0 4V5Z" fill="#000000"></path> <path d="M16 6H10V8H16V6Z" fill="#000000"></path> <path d="M10 10H14V12H10V10Z" fill="#000000"></path> <path d="M12 14H10V16H12V14Z" fill="#000000"></path> </g></svg>
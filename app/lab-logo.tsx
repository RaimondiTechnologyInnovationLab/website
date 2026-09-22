/** Soft A: upright TIL with short horizontal arms and a coral dot. */
export default function LabLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 544 372"
      width="544"
      height="372"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M24 8H156Q180 8 180 32V348Q180 372 156 372H96Q72 372 72 348V110Q72 98 60 98H24Q0 98 0 74V32Q0 8 24 8Z" />
      <rect x="209" y="131" width="104" height="241" rx="21" />
      <path d="M364 8H421Q445 8 445 32V275Q445 288 458 288H520Q544 288 544 312V348Q544 372 520 372H364Q340 372 340 348V32Q340 8 364 8Z" />
      <circle cx="261" cy="57" r="57" fill="#f36b57" />
    </svg>
  );
}

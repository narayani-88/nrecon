import * as React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
      <path d="M14.5 14.5a6 6 0 1 0-5-5" />
      <path d="M12 6V3" />
      <path d="M12 12h3" />
      <path d="M9 15v-3" />
    </svg>
  );
}

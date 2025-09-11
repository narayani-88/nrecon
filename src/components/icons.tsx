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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 10.5v-3" />
      <path d="M12 10.5l-4-2" />
      <path d="M12 10.5l4-2" />
      <path d="M12 14.5l-4 2" />
      <path d="M12 14.5l4 2" />
      <path d="M8 12.5v3" />
      <path d="M16 12.5v3" />
    </svg>
  );
}

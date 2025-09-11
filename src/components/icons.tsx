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
        <path d="M20 13c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
        <path d="m22 13-2-2" />
        <path d="M4 13c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
        <path d="m6 13-2-2" />
        <path d="M12 2a3 3 0 0 0-3 3v2" />
        <path d="M15 2.5A3.5 3.5 0 0 1 12 6V8" />
        <path d="M9 2.5A3.5 3.5 0 0 0 12 6V8" />
    </svg>
  );
}

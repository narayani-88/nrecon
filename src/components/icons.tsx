import * as React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "h-8 w-8", width = 32, height = 32 }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/favicon-96x96.png"
        alt="Nrecon Logo"
        width={width}
        height={height}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

// Keep the old SVG version as fallback if needed
export function LogoSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 11.1c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9z" />
      <path d="M14.2 14.2a4 4 0 1 0-4.4-4.4" />
      <path d="M12 6.5V12" />
    </svg>
  );
}

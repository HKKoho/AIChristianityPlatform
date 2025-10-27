
import React from 'react';

export const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <rect width="4" height="4" x="10" y="4" rx="1" />
    <path d="M4 14v-2" />
    <path d="M20 14v-2" />
    <path d="M8 7V5" />
    <path d="M16 7V5" />
  </svg>
);

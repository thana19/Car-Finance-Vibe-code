import React from 'react';

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.195.025.39.05.588.08a2.25 2.25 0 0 1 2.829 2.829.08.08 0 0 0-.08.588m0-3.498a2.25 2.25 0 0 0-2.829-2.829.08.08 0 0 1 .08-.588m2.829 2.829 7.217 7.217m0 0a2.25 2.25 0 1 0-2.186 0m2.186 0a2.25 2.25 0 0 0 0-2.186m0 2.186 7.217-7.217m0 0a2.25 2.25 0 0 0-2.186 0m2.186 0a2.25 2.25 0 0 0 0-2.186"
    />
  </svg>
);

export default ShareIcon;

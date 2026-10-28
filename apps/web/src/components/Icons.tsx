import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
  strokeWidth?: number;
  stroke?: string;
}

function Svg({ size = 18, strokeWidth = 2, stroke = 'currentColor', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);
export const BackIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);
export const ChevronIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const PlusIcon = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const MinusIcon = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const PinIcon = (p: IconProps) => (
  <Svg size={16} {...p}>
    <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
    <circle cx="12" cy="10" r="2" />
  </Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg size={16} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="M5 12l5 5 9-10" />
  </Svg>
);
export const MapIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <rect x="3" y="3" width="8" height="10" rx="2" />
    <rect x="13" y="3" width="8" height="6" rx="2" />
    <rect x="13" y="11" width="8" height="10" rx="2" />
    <rect x="3" y="15" width="8" height="6" rx="2" />
  </Svg>
);
export const SlidersIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Svg>
);

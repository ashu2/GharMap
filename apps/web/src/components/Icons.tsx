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
export const CameraIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
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
export const CarIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
    <rect x="3" y="11" width="18" height="6" rx="2" />
    <path d="M6 17v2M18 17v2M7.5 14h.01M16.5 14h.01" />
  </Svg>
);
export const BikeIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <circle cx="5.5" cy="16" r="3.5" />
    <circle cx="18.5" cy="16" r="3.5" />
    <path d="M5.5 16l4-7h5l4 7M9.5 9L8.5 6.5H6.5M14.5 9l1-2.5h2" />
  </Svg>
);
export const TvIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <rect x="3" y="5" width="18" height="12" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Svg>
);
export const BoxIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </Svg>
);

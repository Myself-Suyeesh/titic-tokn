import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 12, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PauseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="2" width="2.5" height="8" rx="0.8" />
    <rect x="7" y="2" width="2.5" height="8" rx="0.8" />
  </Svg>
);

export const PlayIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 2.2v7.6a.5.5 0 0 0 .76.43l6-3.8a.5.5 0 0 0 0-.86l-6-3.8a.5.5 0 0 0-.76.43z" />
  </Svg>
);

export const MinusIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5.25" width="8" height="1.5" rx="0.75" />
  </Svg>
);

export const CaretIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 4.5 6 8l3.5-3.5z" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m2.5 6.3 2.4 2.4 4.6-5" />
  </Svg>
);

export const PadlockIcon = (p: IconProps) => (
  <Svg fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
    <rect x="2" y="5.5" width="8" height="5.5" rx="1.5" />
    <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
  </Svg>
);

export const RingIcon = (p: IconProps) => (
  <Svg size={8} fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <circle cx="6" cy="6" r="4.6" />
  </Svg>
);

export const DotIcon = (p: IconProps) => (
  <Svg size={8} {...p}>
    <circle cx="6" cy="6" r="6" />
  </Svg>
);

export const CircleMarker = (p: IconProps) => (
  <Svg size={10} {...p}>
    <circle cx="6" cy="6" r="5.5" />
  </Svg>
);

export const TriangleMarker = (p: IconProps) => (
  <Svg size={10} {...p}>
    <path d="M6 0.8 11.4 10.6H0.6z" />
  </Svg>
);

export const SquareMarker = (p: IconProps) => (
  <Svg size={10} {...p}>
    <rect x="0.8" y="0.8" width="10.4" height="10.4" rx="1.2" />
  </Svg>
);

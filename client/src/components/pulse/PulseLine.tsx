interface PulseLineProps {
  width?: number | string;
  animate?: boolean;
}

export function PulseLine({ width = "100%", animate = false }: PulseLineProps) {
  return (
    <svg
      className={animate ? "cp-pulse cp-pulse-animated" : "cp-pulse"}
      width={width}
      height="22"
      viewBox="0 0 240 22"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 12h92l8-4 8 8 10-14 10 18 8-8h104"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

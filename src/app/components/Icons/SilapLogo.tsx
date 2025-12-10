interface SilapLogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

export default function SilapLogo({
  className,
  width = 34,
  height = 55,
  color = "currentColor",
}: SilapLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 34 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="20.5874"
        width="7.34855"
        height="30.8639"
        transform="rotate(34.8754 20.5874 0)"
        fill={color}
      />
      <rect
        x="24.8638"
        y="25.4775"
        width="7.34855"
        height="30.8639"
        transform="rotate(34.8754 24.8638 25.4775)"
        fill={color}
      />
      <rect
        x="17.3301"
        y="20.4741"
        width="7.34855"
        height="11.4024"
        transform="rotate(34.8754 17.3301 20.4741)"
        fill={color}
      />
      <rect
        x="6.52002"
        y="36.0079"
        width="7.34855"
        height="11.4024"
        transform="rotate(34.8754 6.52002 36.0079)"
        fill={color}
      />
      <rect
        x="27.4395"
        y="5.12561"
        width="7.78118"
        height="9.43202"
        transform="rotate(34.8754 27.4395 5.12561)"
        fill={color}
      />
    </svg>
  );
}

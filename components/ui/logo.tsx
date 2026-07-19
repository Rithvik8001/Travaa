import type { SVGProps } from "react";

/**
 * The Grid mark: a rounded square frame with three cells lit on a diagonal —
 * progress moving across a shared grid. Monochrome (currentColor) so it inherits
 * ink; the accent is applied by the caller when a splash of lime is wanted.
 */
export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x={1.75}
        y={1.75}
        width={20.5}
        height={20.5}
        rx={5}
        stroke="currentColor"
        strokeWidth={2}
      />
      <rect x={6} y={6} width={4} height={4} rx={1} fill="currentColor" />
      <rect x={10} y={10} width={4} height={4} rx={1} fill="currentColor" />
      <rect x={14} y={14} width={4} height={4} rx={1} fill="currentColor" />
    </svg>
  );
}

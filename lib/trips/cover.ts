/**
 * Trip cover gradients from the design's cover/idea swatches. Deterministic per
 * trip id (same hash-an-id approach as lib/avatar-color.ts) so a trip keeps its
 * look across sessions — a stand-in until real cover images (Cloudinary) land.
 */
const TRIP_COVERS = [
  "linear-gradient(135deg, oklch(0.8 0.06 40), oklch(0.68 0.09 28))",
  "linear-gradient(135deg, oklch(0.76 0.06 235), oklch(0.62 0.08 255))",
  "linear-gradient(135deg, oklch(0.82 0.06 350), oklch(0.74 0.08 20))",
  "linear-gradient(135deg, oklch(0.79 0.07 130), oklch(0.68 0.08 155))",
  "linear-gradient(135deg, oklch(0.78 0.07 200), oklch(0.68 0.08 210))",
  "linear-gradient(135deg, oklch(0.79 0.07 320), oklch(0.7 0.08 340))",
] as const;

export function tripCover(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return TRIP_COVERS[Math.abs(hash) % TRIP_COVERS.length];
}

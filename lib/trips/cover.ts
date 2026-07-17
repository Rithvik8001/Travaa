/**
 * Trip cover gradients — deep, saturated cool blends (indigo → teal → violet)
 * in the accent family, deterministic per trip id (same hash-an-id approach as
 * lib/avatar-color.ts) so a trip keeps its look across sessions. White text and
 * avatars read cleanly on top. A stand-in until real cover images (Cloudinary) land.
 */
const TRIP_COVERS = [
  "linear-gradient(145deg, oklch(0.6 0.17 277), oklch(0.48 0.17 285))",
  "linear-gradient(145deg, oklch(0.62 0.13 230), oklch(0.5 0.15 260))",
  "linear-gradient(145deg, oklch(0.64 0.12 195), oklch(0.52 0.14 220))",
  "linear-gradient(145deg, oklch(0.62 0.15 320), oklch(0.5 0.16 290))",
  "linear-gradient(145deg, oklch(0.64 0.13 160), oklch(0.52 0.13 195))",
  "linear-gradient(145deg, oklch(0.58 0.16 260), oklch(0.46 0.16 280))",
] as const;

export function tripCover(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return TRIP_COVERS[Math.abs(hash) % TRIP_COVERS.length];
}

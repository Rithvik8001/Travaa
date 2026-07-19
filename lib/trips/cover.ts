/**
 * Trip cover swatches — deep charcoal fills, deterministic per trip id (same
 * hash-an-id approach as lib/avatar-color.ts) so a trip keeps its look across
 * sessions. Used small as monogram chips and join-card headers in the Grid
 * system. Variation comes from shade alone — no colour accent. A stand-in until
 * real cover images (Cloudinary) land.
 */
const TRIP_COVERS = [
  "oklch(0.28 0 0)",
  "oklch(0.24 0 0)",
  "oklch(0.32 0 0)",
  "oklch(0.22 0 0)",
  "oklch(0.30 0 0)",
  "oklch(0.26 0 0)",
] as const;

export function tripCover(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return TRIP_COVERS[Math.abs(hash) % TRIP_COVERS.length];
}

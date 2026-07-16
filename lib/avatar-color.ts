/**
 * The crew palette from the design — warm, desaturated, all legible under the
 * same ink. Members should keep a stable colour across sessions and surfaces,
 * so pick by hashing a stable id rather than at random.
 */
const AVATAR_COLORS = [
  "oklch(0.8 0.05 40)",
  "oklch(0.78 0.06 255)",
  "oklch(0.8 0.07 150)",
  "oklch(0.82 0.06 90)",
  "oklch(0.78 0.07 350)",
  "oklch(0.8 0.06 200)",
] as const;

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

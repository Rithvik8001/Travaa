/**
 * A cohesive cool tint set (indigo → teal → violet) that harmonizes with the
 * indigo accent — defined enough to tell a crew stack apart, quiet enough not to
 * shout. All legible under the same ink. Members keep a stable colour across
 * sessions and surfaces, so pick by hashing a stable id rather than at random.
 */
const AVATAR_COLORS = [
  "oklch(0.88 0.035 277)",
  "oklch(0.88 0.035 230)",
  "oklch(0.88 0.035 195)",
  "oklch(0.88 0.035 320)",
  "oklch(0.88 0.035 155)",
  "oklch(0.88 0.03 255)",
] as const;

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

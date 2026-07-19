/**
 * A tight monochrome set — six near-neutral grays, defined enough to tell a crew
 * stack apart, quiet enough not to shout. All read under the same near-black
 * ink on squircle chips. Members keep a stable shade across sessions and
 * surfaces, so pick by hashing a stable id rather than at random.
 */
const AVATAR_COLORS = [
  "oklch(0.92 0 0)",
  "oklch(0.88 0 0)",
  "oklch(0.84 0 0)",
  "oklch(0.8 0 0)",
  "oklch(0.76 0 0)",
  "oklch(0.72 0 0)",
] as const;

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

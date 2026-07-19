/**
 * Shared motion vocabulary. Every spring is bounce: 0 — the "gallery mono"
 * language is calm and premium, never bouncy. Durations are the only knob.
 */
export const spring = { type: "spring", duration: 0.3, bounce: 0 } as const;
export const springSoft = { type: "spring", duration: 0.5, bounce: 0 } as const;
export const springSnappy = { type: "spring", duration: 0.22, bounce: 0 } as const;

/** A tween easing that matches the CSS `--ease-spring` used on the landing. */
export const easeSpring = [0.2, 0, 0, 1] as const;

/** Standard press feedback — used by CSS (`active:scale-[0.96]`) and motion. */
export const PRESS_SCALE = 0.96;

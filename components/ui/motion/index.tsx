"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  type HTMLMotionProps,
} from "motion/react";
import { spring } from "./springs";

export { AnimatePresence, motion } from "motion/react";
export * from "./springs";

/**
 * App-wide motion context. `reducedMotion="user"` means every animation below
 * collapses automatically when the visitor asks for less motion — we never have
 * to guard individual components.
 */
export function MotionProvider({ children }: { readonly children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * A list item that animates in on add and out on remove. Wrap the mapped list
 * in <PresenceList> and give each item a stable key. `layout` lets neighbours
 * glide into the freed space.
 */
export function MotionItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      transition={spring}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Convenience: an <AnimatePresence> preset for list add/remove. */
export function PresenceList({ children }: { readonly children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {children}
    </AnimatePresence>
  );
}

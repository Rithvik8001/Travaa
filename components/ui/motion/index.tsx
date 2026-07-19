"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  type HTMLMotionProps,
} from "motion/react";
import { spring, springSoft } from "./springs";

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

type RevealProps = HTMLMotionProps<"div"> & {
  readonly delay?: number;
  readonly y?: number;
};

/** A single element that fades and rises in on mount. */
export function Reveal({ delay = 0, y = 12, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSoft, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = HTMLMotionProps<"div"> & {
  readonly gap?: number;
  readonly delay?: number;
};

/** Container that reveals its <StaggerItem> children one after another. */
export function Stagger({ gap = 0.06, delay = 0.04, children, ...props }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Child of <Stagger>. Rises into place when its turn comes. */
export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: springSoft },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * A list item that animates in on add and out on remove. Wrap the mapped list
 * in <AnimatePresence initial={false} mode="popLayout"> and give each item a
 * stable key. `layout` lets neighbours glide into the freed space.
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

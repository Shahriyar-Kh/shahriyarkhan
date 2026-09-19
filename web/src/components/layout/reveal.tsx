"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms, capped at 4 staggered children per the motion
   * budget in docs/rebuild/P01_MOTION_MAP.md. */
  delay?: number;
  className?: string;
}

/**
 * Shared reveal-on-scroll wrapper. Deliberately uses opacity + translateY
 * ONLY (never visibility/display), because a child that receives
 * keyboard focus while still "hidden" must become visible immediately -
 * see the onFocusCapture handler below, which is the fix for the most
 * commonly-missed accessibility bug in this exact pattern. Renders with
 * no wrapper styling at all under prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      // Direct DOM mutation, not setState - avoids both a hydration
      // mismatch (this branch's outcome would differ between server and
      // client if it fed React state) and the setState-in-effect
      // anti-pattern for a fallback this narrow.
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        io.unobserve(entry.target);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      // A keyboard user tabbing into a child before it has "revealed"
      // must see it immediately - never leave a focused element invisible.
      onFocusCapture={() => setVisible(true)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-(--motion-base) ease-(--ease-out)",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Section({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={cn("section-shell py-16 sm:py-20", className)} {...rest}>
      {children}
    </section>
  );
}

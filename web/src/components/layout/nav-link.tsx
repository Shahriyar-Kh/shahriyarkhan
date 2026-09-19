"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "group relative py-1 text-body-sm transition-colors duration-(--motion-fast)",
        isActive ? "text-ink-primary" : "text-ink-tertiary hover:text-ink-primary",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-(--motion-fast)",
          isActive && "scale-x-100",
          !isActive && "group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

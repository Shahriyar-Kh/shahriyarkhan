import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * The single place in this codebase a data-failure or empty-result
 * message is authored. Every list-backed section/page renders this
 * instead of fake or stale data when a fetch fails or returns nothing -
 * see src/lib/api/errors.ts's ApiResult design.
 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("border border-dashed border-border px-6 py-10 text-center", className)}>
      <p className="text-body-sm text-ink-secondary">{title}</p>
      {description && <p className="mt-1 text-caption-sm text-ink-hint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

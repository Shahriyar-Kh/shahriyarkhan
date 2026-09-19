import { cn } from "@/lib/cn";

export interface SectionIndexProps {
  /** Two-digit section number, e.g. "04". */
  n: string;
  label: string;
  className?: string;
}

/** "04 / HOW THE SYSTEMS FIT TOGETHER" - the numbered marker used at the
 * top of every homepage section and case-study section. */
export function SectionIndex({ n, label, className }: SectionIndexProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-mono text-label text-accent" aria-hidden>
        {n}
      </span>
      <span aria-hidden className="h-px w-8 bg-border" />
      <span className="text-label uppercase text-ink-tertiary">{label}</span>
    </div>
  );
}

import { Node } from "@/components/motif/node";
import type { Education, Experience, Project } from "@/lib/api/types";

export interface CredibilityStripProps {
  projects: readonly Project[] | null;
  experiences: readonly Experience[] | null;
  education: readonly Education[] | null;
}

/**
 * Section 02 - one horizontal Run with inline Node separators, not tiles.
 * Every number here is `.length` on live API data - never a stat-strip
 * invention. A failed fetch just drops that one item, never an error box
 * (this section is too minor to earn its own EmptyState).
 */
export function CredibilityStrip({ projects, experiences, education }: CredibilityStripProps) {
  const items: string[] = [];
  if (projects && projects.length > 0) items.push(`${projects.length} published projects`);
  if (experiences && experiences.length > 0) items.push(`${experiences.length} professional roles`);
  if (education && education.length > 0) items.push(`${education.length} degree${education.length > 1 ? "s" : ""}`);
  items.push("Python · Django · DRF · React · PostgreSQL");

  if (items.length === 0) return null;

  return (
    <div className="section-shell border-y border-border py-6">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-4 text-caption-sm text-ink-tertiary">
            {i > 0 && <Node aria-hidden />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

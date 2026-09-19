import Link from "next/link";
import { Node } from "@/components/motif/node";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectMedia } from "@/components/work/project-media";
import { TechList } from "@/components/work/tech-list";
import { isDistinctRepoUrl } from "@/lib/format";
import type { Project } from "@/lib/api/types";

export interface SelectedWorkProps {
  projects: readonly Project[] | null;
}

/**
 * Section 03 - an editorial numbered index list, deliberately not a grid
 * (the grid pattern belongs to /work). Only the first row carries a
 * screenshot, keeping the rest of the list dense and text-led.
 */
export function SelectedWork({ projects }: SelectedWorkProps) {
  return (
    <Section>
      <div className="flex items-end justify-between gap-4">
        <SectionHeading index="03" eyebrow="Work" title="Selected work" />
        <Link href="/work" className="hidden shrink-0 text-caption-sm text-primary hover:underline sm:inline">
          View all work →
        </Link>
      </div>

      <div className="mt-10">
        {!projects ? (
          <EmptyState
            title="Project data is temporarily unavailable."
            description="Please try again shortly, or get in touch directly."
          />
        ) : projects.length === 0 ? (
          <EmptyState title="No published projects yet." />
        ) : (
          <ol className="flex flex-col divide-y divide-border border-t border-b border-border">
            {projects.slice(0, 5).map((project, i) => (
              <li key={project.id} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr] sm:items-start">
                <span className="font-mono text-caption text-ink-hint">{String(i + 1).padStart(2, "0")}</span>
                <div className={i === 0 ? "grid gap-6 sm:grid-cols-[1fr_1.2fr]" : ""}>
                  {i === 0 && (project.featured_image || project.preview_image) && (
                    <div className="relative aspect-video w-full overflow-hidden bg-surface">
                      <ProjectMedia project={project} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Node filled={isDistinctRepoUrl(project.github_url)} />
                      <Link href={`/work/${project.slug}`} className="text-headline-sm text-ink-primary hover:text-primary">
                        {project.title}
                      </Link>
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-xl text-body-sm text-ink-secondary">{project.description}</p>
                    <div className="mt-3">
                      <TechList technologies={project.technologies} limit={5} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link href="/work" className="mt-6 inline-block text-caption-sm text-primary hover:underline sm:hidden">
        View all work →
      </Link>
    </Section>
  );
}

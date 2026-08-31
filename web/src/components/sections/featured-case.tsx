import Link from "next/link";
import { CornerFrame } from "@/components/motif/corner-frame";
import { ClaimBadge } from "@/components/work/claim-badge";
import { ProjectMedia } from "@/components/work/project-media";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCaseStudy, publishableClaims } from "@/content/case-studies";
import { selectFeaturedCase } from "@/lib/home-selection";
import type { Project } from "@/lib/api/types";

export interface FeaturedCaseProps {
  projects: readonly Project[] | null;
}

/**
 * Section 05 - a two-column evidence spread, a preview of /work/[slug].
 * The featured project is chosen algorithmically by selectFeaturedCase()
 * (most verified claims, tie-broken by a distinct repo) - never
 * hardcoded, so it stays correct if the evidence behind a project
 * changes.
 */
export function FeaturedCase({ projects }: FeaturedCaseProps) {
  if (!projects || projects.length === 0) return null;

  const project = selectFeaturedCase(projects);
  if (!project) return null;

  const caseStudy = getCaseStudy(project.slug);
  const claims = caseStudy?.sections.flatMap((section) => publishableClaims(section)).slice(0, 4) ?? [];
  const hasMedia = Boolean(project.featured_image || project.preview_image);

  return (
    <Section className="border-t border-border">
      <SectionHeading index="05" eyebrow="Evidence" title="A closer look" subtitle={project.title} />

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          {caseStudy?.summary && <p className="text-body text-ink-secondary">{caseStudy.summary}</p>}

          {claims.length > 0 && (
            <ul className="mt-6 flex flex-col gap-3">
              {claims.map((claim) => (
                <li key={claim.id} className="flex items-start gap-2 text-body-sm text-ink-secondary">
                  <ClaimBadge status={claim.status} className="mt-1" />
                  <span>{claim.statement}</span>
                </li>
              ))}
            </ul>
          )}

          <Button href={`/work/${project.slug}`} variant="secondary" className="mt-8" data-analytics-event="project_cta_click">
            Read the full case study
          </Button>
        </div>

        {hasMedia && (
          <CornerFrame>
            <div className="relative aspect-video w-full overflow-hidden bg-surface">
              <ProjectMedia project={project} variant="hero" />
            </div>
          </CornerFrame>
        )}
      </div>

      <Link href={`/work/${project.slug}`} className="sr-only">
        {project.title} case study
      </Link>
    </Section>
  );
}

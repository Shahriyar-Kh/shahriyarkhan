import Link from "next/link";
import { Tick } from "@/components/motif/tick";
import { Node } from "@/components/motif/node";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateRange } from "@/lib/format";
import type { Experience } from "@/lib/api/types";

export interface ExperienceJourneyProps {
  experiences: readonly Experience[] | null;
}

/**
 * Section 08 - a left-rule vertical timeline, the inverse orientation of
 * §07's horizontal track.
 */
export function ExperienceJourney({ experiences }: ExperienceJourneyProps) {
  return (
    <Section className="border-t border-border">
      <SectionHeading index="08" eyebrow="Experience" title="Where this experience comes from" />

      <div className="mt-10">
        {!experiences ? (
          <EmptyState title="Experience data is temporarily unavailable." />
        ) : experiences.length === 0 ? (
          <EmptyState title="No published experience yet." />
        ) : (
          <ol className="flex flex-col gap-8 border-l border-border pl-6">
            {experiences.map((role) => (
              <li key={role.id} className="relative">
                <Node filled={role.current_role} className="absolute top-1.5 -left-[calc(1.5rem+3px)]" />
                <p className="text-headline-sm text-ink-primary">{role.role_title}</p>
                <p className="text-body-sm text-ink-secondary">{role.company_name}</p>
                <Tick className="mt-1">{formatDateRange(role.start_date, role.end_date, role.current_role)}</Tick>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link href="/experience" className="mt-8 inline-block text-caption-sm text-primary hover:underline">
        View the full structured record →
      </Link>
    </Section>
  );
}

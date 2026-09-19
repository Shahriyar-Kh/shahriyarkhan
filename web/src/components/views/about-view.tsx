import { Reveal } from "@/components/layout/reveal";
import { SystemMapSection } from "@/components/sections/system-map-section";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ABOUT_INTRO, ABOUT_PREVIEW_CTA, ABOUT_PRINCIPLES } from "@/content/about";
import type { Skill } from "@/lib/api/types";

export interface AboutViewProps {
  skills: readonly Skill[] | null;
}

export function AboutView({ skills }: AboutViewProps) {
  return (
    <>
      <Section className="pt-16 sm:pt-20">
        <SectionHeading eyebrow={ABOUT_INTRO.eyebrow} title={ABOUT_INTRO.title} subtitle={ABOUT_INTRO.lead} />
      </Section>

      <Reveal>
        <Section className="border-t border-border">
          <div className="grid gap-8 sm:grid-cols-3">
            {ABOUT_PRINCIPLES.map((principle) => (
              <div key={principle.title} className="border-t border-border pt-4">
                <p className="text-headline-sm text-ink-primary">{principle.title}</p>
                <p className="mt-2 text-body-sm text-ink-secondary">{principle.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </Reveal>

      <SystemMapSection skills={skills} />

      <Section className="border-t border-border">
        <Button href={ABOUT_PREVIEW_CTA.href} data-analytics-event="project_cta_click">
          {ABOUT_PREVIEW_CTA.label}
        </Button>
      </Section>
    </>
  );
}

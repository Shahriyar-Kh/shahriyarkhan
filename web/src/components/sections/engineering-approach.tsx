import { Connector } from "@/components/motif/connector";
import { Node } from "@/components/motif/node";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ENGAGEMENT_STEPS } from "@/content/services";
import { ENGINEERING_APPROACH_COPY } from "@/content/home";

/**
 * Section 07 - a horizontal track: one Run, 7 Nodes. The same
 * ENGAGEMENT_STEPS sequence used on every /services/[slug] page, so the
 * homepage and service pages never disagree.
 */
export function EngineeringApproach() {
  return (
    <Section className="border-t border-border">
      <SectionHeading index="07" eyebrow="Approach" title={ENGINEERING_APPROACH_COPY.title} subtitle={ENGINEERING_APPROACH_COPY.subtitle} />

      <ol className="relative mt-12 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-0">
        <div className="absolute top-3 right-0 left-0 hidden sm:block">
          <Connector />
        </div>
        {ENGAGEMENT_STEPS.map((step, i) => (
          <li key={step} className="relative flex flex-1 flex-col items-start gap-2 sm:items-center sm:text-center">
            <Node filled className="relative z-10 bg-background" size={8} />
            <span className="font-mono text-caption-sm text-ink-hint">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-body-sm font-medium text-ink-primary">{step}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

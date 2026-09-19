import { Connector } from "@/components/motif/connector";
import { Button } from "@/components/ui/button";
import { DUAL_CTA_COPY } from "@/content/home";

/**
 * Section 11 - a split panel on one vertical Run, mirroring §01's fork:
 * "Hiring for a role" vs. "Starting a project".
 */
export function DualCta() {
  return (
    <div className="section-shell border-t border-border py-16 sm:py-20">
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-0">
        <div className="relative pr-0 sm:pr-10">
          <p className="text-headline-md text-ink-primary">{DUAL_CTA_COPY.hiring.title}</p>
          <p className="mt-2 text-body-sm text-ink-secondary">{DUAL_CTA_COPY.hiring.body}</p>
          <Button
            href={DUAL_CTA_COPY.hiring.cta.href}
            variant="secondary"
            className="mt-6"
            data-analytics-event="recruiter_cta_click"
          >
            {DUAL_CTA_COPY.hiring.cta.label}
          </Button>
        </div>

        <div className="relative hidden sm:block">
          <Connector orientation="vertical" className="absolute inset-y-0 left-0" />
        </div>
        <Connector className="sm:hidden" />

        <div className="pl-0 sm:pl-10">
          <p className="text-headline-md text-ink-primary">{DUAL_CTA_COPY.project.title}</p>
          <p className="mt-2 text-body-sm text-ink-secondary">{DUAL_CTA_COPY.project.body}</p>
          <Button href={DUAL_CTA_COPY.project.cta.href} className="mt-6" data-analytics-event="project_cta_click">
            {DUAL_CTA_COPY.project.cta.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Connector } from "@/components/motif/connector";
import { Button } from "@/components/ui/button";
import { SectionIndex } from "@/components/motif/section-index";

/**
 * Section 09 - a single quiet banner row, deliberately the least
 * decorated section on the page.
 */
export function ResumePathway() {
  return (
    <div className="section-shell py-10">
      <Connector className="mb-6" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionIndex n="09" label="Résumé" />
        <p className="text-body-sm text-ink-secondary">The document version, with a direct PDF download.</p>
        <Button href="/resume" variant="ghost" size="sm" data-analytics-event="resume_view">
          View résumé →
        </Button>
      </div>
    </div>
  );
}

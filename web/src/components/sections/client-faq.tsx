import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { CLIENT_FAQ } from "@/content/home";

/**
 * Section 10 - native <details>/<summary>, zero JS. The only section on
 * the page that is interactive without JavaScript.
 */
export function ClientFaq() {
  return (
    <Section className="border-t border-border">
      <SectionHeading index="10" eyebrow="Questions" title="Common questions" />

      <div className="mt-10 flex flex-col divide-y divide-border border-t border-b border-border">
        {CLIENT_FAQ.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body-sm font-medium text-ink-primary marker:content-none">
              {item.question}
              <span aria-hidden className="shrink-0 text-ink-tertiary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-body-sm text-ink-secondary">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

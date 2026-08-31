import Link from "next/link";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import type { Service } from "@/lib/api/types";

export interface ServicesCapabilityProps {
  services: readonly Service[] | null;
}

/**
 * Section 06 - a dense two-column <dl>, deliberately no icons/cards
 * (distinct from §03's list and §07's track - no two adjacent homepage
 * sections share a layout primitive).
 */
export function ServicesCapability({ services }: ServicesCapabilityProps) {
  return (
    <Section className="border-t border-border">
      <SectionHeading index="06" eyebrow="Services" title="What I build for clients" />

      <div className="mt-10">
        {!services ? (
          <EmptyState title="Service data is temporarily unavailable." />
        ) : services.length === 0 ? (
          <EmptyState title="No published services yet." />
        ) : (
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {services.slice(0, 6).map((service) => (
              <div key={service.id} className="border-t border-border pt-4">
                <dt>
                  <Link href={`/services/${service.slug}`} className="text-headline-sm text-ink-primary hover:text-primary">
                    {service.title}
                  </Link>
                </dt>
                <dd className="mt-2 line-clamp-2 text-body-sm text-ink-secondary">{service.description}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <Link href="/services" className="mt-8 inline-block text-caption-sm text-primary hover:underline">
        View all services →
      </Link>
    </Section>
  );
}

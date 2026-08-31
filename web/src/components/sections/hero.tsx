import Image from "next/image";
import { CornerFrame } from "@/components/motif/corner-frame";
import { Tick } from "@/components/motif/tick";
import { RoleRotator } from "@/components/sections/role-rotator";
import { Button } from "@/components/ui/button";
import { HERO_COPY, HERO_ROLES } from "@/content/home";

/**
 * Section 01 - asymmetric editorial masthead. Two typographically (not
 * just color) differentiated CTAs: a filled primary button (recruiter/
 * general) and a bordered secondary button (client) - the same fork
 * repeated visually in §11 dual-cta.tsx.
 */
export function Hero() {
  return (
    <div className="section-shell grid gap-12 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="border-l border-border pl-6">
        <p className="text-label text-accent uppercase">{HERO_COPY.eyebrow}</p>
        <h1 className="mt-4 text-display-md text-ink-primary sm:text-display-lg">{HERO_COPY.title}</h1>
        <p className="mt-2 text-headline-sm text-ink-secondary" aria-live="off">
          <RoleRotator roles={HERO_ROLES} />
        </p>
        <p className="mt-6 max-w-xl text-body text-ink-secondary">{HERO_COPY.lead}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href={HERO_COPY.primaryCta.href} data-analytics-event="recruiter_cta_click">
            {HERO_COPY.primaryCta.label}
          </Button>
          <Button href={HERO_COPY.secondaryCta.href} variant="secondary" data-analytics-event="project_cta_click">
            {HERO_COPY.secondaryCta.label}
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-xs lg:mx-0">
        <CornerFrame>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
            <Image src="/images/profile.png" alt="Portrait of Shahriyar Khan" fill priority className="object-cover" />
          </div>
        </CornerFrame>
        <div className="mt-4 flex flex-col gap-1.5">
          <Tick>Islamabad, Pakistan</Tick>
          <Tick>Python · Django · React</Tick>
        </div>
      </div>
    </div>
  );
}

import { Reveal } from "@/components/layout/reveal";
import { ClientFaq } from "@/components/sections/client-faq";
import { CredibilityStrip } from "@/components/sections/credibility-strip";
import { DualCta } from "@/components/sections/dual-cta";
import { EngineeringApproach } from "@/components/sections/engineering-approach";
import { ExperienceJourney } from "@/components/sections/experience-journey";
import { FeaturedCase } from "@/components/sections/featured-case";
import { Hero } from "@/components/sections/hero";
import { ResumePathway } from "@/components/sections/resume-pathway";
import { SelectedWork } from "@/components/sections/selected-work";
import { ServicesCapability } from "@/components/sections/services-capability";
import { SystemMapSection } from "@/components/sections/system-map-section";
import type { Education, Experience, Project, Service, Skill } from "@/lib/api/types";

export interface HomeViewProps {
  projects: readonly Project[] | null;
  experiences: readonly Experience[] | null;
  education: readonly Education[] | null;
  services: readonly Service[] | null;
  skills: readonly Skill[] | null;
}

/**
 * Composes all 11 homepage sections. Plain and synchronous - the
 * container/view split (see app/page.tsx) means this whole tree is
 * RTL-testable with plain prop fixtures, no Server Component harness
 * needed.
 */
export function HomeView({ projects, experiences, education, services, skills }: HomeViewProps) {
  return (
    <>
      <Hero />
      <Reveal>
        <CredibilityStrip projects={projects} experiences={experiences} education={education} />
      </Reveal>
      <Reveal>
        <SelectedWork projects={projects} />
      </Reveal>
      <SystemMapSection skills={skills} />
      <Reveal>
        <FeaturedCase projects={projects} />
      </Reveal>
      <Reveal>
        <ServicesCapability services={services} />
      </Reveal>
      <Reveal>
        <EngineeringApproach />
      </Reveal>
      <Reveal>
        <ExperienceJourney experiences={experiences} />
      </Reveal>
      <Reveal>
        <ResumePathway />
      </Reveal>
      <Reveal>
        <ClientFaq />
      </Reveal>
      <Reveal>
        <DualCta />
      </Reveal>
    </>
  );
}

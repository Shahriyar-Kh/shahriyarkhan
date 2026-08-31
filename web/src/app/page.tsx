import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeView } from "@/components/views/home-view";
import { ROUTE_METADATA_DEFAULTS } from "@/content/metadata";
import { getEducation, getExperiences, getPageSeo, getProjects, getServices, getSkills } from "@/lib/api";
import { profilePageSchema } from "@/lib/json-ld";
import { buildMetadata, mergePageSeo } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const defaults = ROUTE_METADATA_DEFAULTS.home!;
  const pageSeo = await getPageSeo(defaults.pageKey);
  const merged = mergePageSeo(defaults, pageSeo.ok ? pageSeo.data : null);
  return buildMetadata({ pathname: "/", ...merged });
}

export default async function HomePage() {
  const [projects, experiences, education, services, skills] = await Promise.all([
    getProjects(),
    getExperiences(),
    getEducation(),
    getServices(),
    getSkills(),
  ]);

  return (
    <>
      <JsonLd data={profilePageSchema("/")} />
      <HomeView
        projects={projects.ok ? projects.data : null}
        experiences={experiences.ok ? experiences.data : null}
        education={education.ok ? education.data : null}
        services={services.ok ? services.data : null}
        skills={skills.ok ? skills.data : null}
      />
    </>
  );
}

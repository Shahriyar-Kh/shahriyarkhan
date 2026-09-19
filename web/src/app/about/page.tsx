import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { AboutView } from "@/components/views/about-view";
import { ROUTE_METADATA_DEFAULTS } from "@/content/metadata";
import { getPageSeo, getSkills } from "@/lib/api";
import { breadcrumbSchema, profilePageSchema } from "@/lib/json-ld";
import { buildMetadata, mergePageSeo } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const defaults = ROUTE_METADATA_DEFAULTS.about!;
  const pageSeo = await getPageSeo(defaults.pageKey);
  const merged = mergePageSeo(defaults, pageSeo.ok ? pageSeo.data : null);
  return buildMetadata({ pathname: "/about", ...merged });
}

export default async function AboutPage() {
  const skills = await getSkills();

  return (
    <>
      <JsonLd data={profilePageSchema("/about")} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", pathname: "/" }, { name: "About", pathname: "/about" }])} />
      <AboutView skills={skills.ok ? skills.data : null} />
    </>
  );
}

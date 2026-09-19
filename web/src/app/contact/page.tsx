import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactView } from "@/components/views/contact-view";
import { CONTACT_INTENTS } from "@/content/contact";
import { ROUTE_METADATA_DEFAULTS } from "@/content/metadata";
import { getPageSeo, getServices, getSiteSettings } from "@/lib/api";
import { breadcrumbSchema } from "@/lib/json-ld";
import { buildMetadata, mergePageSeo } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const defaults = ROUTE_METADATA_DEFAULTS.contact!;
  const pageSeo = await getPageSeo(defaults.pageKey);
  const merged = mergePageSeo(defaults, pageSeo.ok ? pageSeo.data : null);
  return buildMetadata({ pathname: "/contact", ...merged });
}

interface ContactPageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [{ intent }, services, siteSettings] = await Promise.all([searchParams, getServices(), getSiteSettings()]);
  const initialIntent = CONTACT_INTENTS.find((option) => option.value === intent)?.value ?? "general";

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", pathname: "/" }, { name: "Contact", pathname: "/contact" }])} />
      <ContactView
        services={services.ok ? services.data : null}
        siteSettings={siteSettings.ok ? siteSettings.data : null}
        initialIntent={initialIntent}
      />
    </>
  );
}

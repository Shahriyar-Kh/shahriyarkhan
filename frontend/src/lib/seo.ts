type SeoInput = {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  author?: string;
  robots?: string;
};

type SchemaMarkup = {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
};

function upsertMeta(attribute: "name" | "property", key: string, content?: string) {
  if (!content) return;

  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel: string, href?: string) {
  if (!href) return;

  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

export function addSchemaMarkup(schema: SchemaMarkup) {
  let script = document.head.querySelector<HTMLScriptElement>(`script[type="application/ld+json"]`);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export function applySeo(seo: SeoInput) {
  if (seo.title) {
    document.title = seo.title;
  }

  // Canonical and language
  upsertLink("canonical", seo.canonicalUrl ?? window.location.href);
  upsertMeta("name", "language", "en");

  // Basic metadata
  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "keywords", seo.keywords);
  upsertMeta("name", "author", seo.author ?? "Shahriyar Khan");
  upsertMeta("name", "robots", seo.robots ?? "index, follow");
  upsertMeta("name", "viewport", "width=device-width, initial-scale=1.0");

  // Open Graph
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", "Shahriyar Khan | Software Engineer");
  upsertMeta("property", "og:title", seo.ogTitle ?? seo.title);
  upsertMeta("property", "og:description", seo.ogDescription ?? seo.description);
  upsertMeta("property", "og:image", seo.ogImage);
  upsertMeta("property", "og:image:alt", seo.ogImageAlt);
  upsertMeta("property", "og:url", seo.canonicalUrl ?? window.location.href);

  // Twitter Card
  upsertMeta("name", "twitter:card", seo.twitterImage || seo.ogImage ? "summary_large_image" : "summary");
  upsertMeta("name", "twitter:site", "@shahriyar_khan");
  upsertMeta("name", "twitter:creator", "@shahriyar_khan");
  upsertMeta("name", "twitter:title", seo.twitterTitle ?? seo.title);
  upsertMeta("name", "twitter:description", seo.twitterDescription ?? seo.description);
  upsertMeta("name", "twitter:image", seo.twitterImage ?? seo.ogImage);

  // Additional meta for social sharing
  upsertMeta("name", "theme-color", "#085299");
  upsertMeta("name", "msapplication-TileColor", "#085299");
}

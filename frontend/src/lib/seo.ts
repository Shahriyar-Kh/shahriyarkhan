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
  canonicalUrl?: string;
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

export function applySeo(seo: SeoInput) {
  if (seo.title) {
    document.title = seo.title;
  }

  upsertLink("canonical", seo.canonicalUrl ?? window.location.href);
  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "keywords", seo.keywords);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:title", seo.ogTitle ?? seo.title);
  upsertMeta("property", "og:description", seo.ogDescription ?? seo.description);
  upsertMeta("property", "og:image", seo.ogImage);
  upsertMeta("property", "og:image:alt", seo.ogImageAlt);
  upsertMeta("name", "twitter:card", seo.ogImage ? "summary_large_image" : "summary");
  upsertMeta("name", "twitter:title", seo.twitterTitle ?? seo.title);
  upsertMeta("name", "twitter:description", seo.twitterDescription ?? seo.description);
}

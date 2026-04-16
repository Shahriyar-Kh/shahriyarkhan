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

export function applySeo(seo: SeoInput) {
  if (seo.title) {
    document.title = seo.title;
  }

  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "keywords", seo.keywords);
  upsertMeta("property", "og:title", seo.ogTitle ?? seo.title);
  upsertMeta("property", "og:description", seo.ogDescription ?? seo.description);
  upsertMeta("property", "og:image", seo.ogImage);
  upsertMeta("property", "og:image:alt", seo.ogImageAlt);
  upsertMeta("name", "twitter:title", seo.twitterTitle ?? seo.title);
  upsertMeta("name", "twitter:description", seo.twitterDescription ?? seo.description);
}

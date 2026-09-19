export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
export const IS_API_CONFIGURED = API_BASE_URL.length > 0;
export const DEFAULT_TIMEOUT_MS = 10_000;

/** Seconds. Chosen by how often each resource actually changes. */
export const REVALIDATE = {
  projects: 300, // 5 min - most likely to change (a project gets published/edited)
  experiences: 1800, // 30 min
  services: 1800, // 30 min
  skills: 3600, // 1 h
  education: 3600, // 1 h
  siteSettings: 3600, // 1 h
  pageSeo: 3600, // 1 h
  resume: 3600, // 1 h
} as const;

/** Emitted as next.tags now so a future on-demand revalidate route needs
 * no client-site change - see docs/rebuild/P01_BACKEND_EVOLUTION_PLAN.md. */
export const CACHE_TAGS = {
  projects: "projects",
  experiences: "experiences",
  services: "services",
  skills: "skills",
  education: "education",
  siteSettings: "site-settings",
  pageSeo: "page-seo",
  resume: "resume",
} as const;

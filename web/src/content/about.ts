/**
 * /about's narrative copy. Employment and education specifics (dates,
 * titles, institution) are NOT duplicated here - they render from the
 * live Experience/Education API on /experience, so this file can never
 * drift out of sync with the database. This file is philosophy and
 * approach only.
 */

export const ABOUT_INTRO = {
  eyebrow: "About",
  title: "How I approach building software",
  lead: "I build backend systems and full-stack applications with Python and Django, most often paired with a React frontend and a PostgreSQL database.",
} as const;

export const ABOUT_PRINCIPLES: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "The data model comes first",
    body: "Before any endpoint or UI, I work out what entities the system needs to represent and how they relate. Most later problems trace back to this step being rushed.",
  },
  {
    title: "Authentication and authorization are not an afterthought",
    body: "Who can do what is decided as part of the architecture, not bolted on once the feature list is done.",
  },
  {
    title: "A system should be explainable",
    body: "I can walk through why a system is built the way it is - which is also why every project on this site links to something real: a live URL, a repository, or an audited screenshot.",
  },
];

export const ABOUT_PREVIEW_CTA = { label: "See the work these principles produced", href: "/work" } as const;

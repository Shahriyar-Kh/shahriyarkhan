/**
 * Single source of truth for the public site's canonical origin.
 *
 * Temporary canonical per P01A stabilization (2026-08-27): shahriyarkhan.dev
 * has no working DNS (verified in docs/rebuild/P00_EVIDENCE_FREEZE.md), so
 * every canonical/OG/JSON-LD URL must use this origin instead until a
 * permanent domain is chosen (see docs/rebuild/OPEN_DECISIONS.md).
 */
export const SITE_URL = "https://shahriyarkhan.vercel.app";

/** Builds an absolute canonical URL for a given path under SITE_URL. Pure
 * function - callers pass window.location.pathname explicitly so this
 * stays testable without a DOM. */
export function canonicalUrl(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return `${SITE_URL}/`;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${path}`;
}

/**
 * Centralized public API endpoint paths touched by P01A stabilization.
 *
 * P00 found the home page calling the singular `/portfolio/experience/`,
 * which does not exist - the backend only registers the plural
 * `/portfolio/experiences/` (backend/apps/portfolio/api/urls.py). Naming
 * this as a constant, rather than an inline string, keeps the two call
 * sites this ever needs to be true for in sync.
 */
export const EXPERIENCES_ENDPOINT = "/api/v1/public/portfolio/experiences/";

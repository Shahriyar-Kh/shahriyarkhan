# Data Model Inventory

Audit date: 2026-08-27. Covers every first-party Django app under `backend/apps/`. Django version could not be pinned precisely from the repo alone — `backend/requirements.txt` (root-delegated) specifies `Django>=5.2,<6.0` while `backend/requirements/base.txt` (what `render.yaml`'s build command actually installs, via `prod.txt`) specifies `Django>=5.1,<6.0`. Treat "Django 5.x" as the verified fact and the exact minor version as **Needs verification** against the live environment.

## Applications overview

| App | Purpose (as coded) | Has API? | Has admin? | Has tests? |
|---|---|---|---|---|
| `apps.core` | Shared abstract base models (`TimeStampedModel`, `PublishableModel`, `OrderedModel`, `SEOMetadataModel`), custom email backend, admin dashboard view, management commands | No (`api/` package exists but is empty — no `urls.py`/`views.py`) | Yes (`admin.py` present but empty of registrations at audit time) | No |
| `apps.accounts` | Auth/session plumbing, admin-access permission logic, `UserProfile` | Yes (`login/`, `logout/`, `me/`) | Yes (`UserProfile`) | No |
| `apps.portfolio` | Core content: projects, project images, experience, skills, services, education, technologies | Yes (public + admin) | Yes | No |
| `apps.inquiries` | Contact messages and service requests (leads) | Yes (public create + admin CRUD) | Yes | No |
| `apps.resume_builder` | Named résumé versions built from portfolio content, plus export records | Yes (public + admin) | Yes | No |
| `apps.seo` | Per-page SEO metadata, SEO alias keywords | Yes (public + admin) | Yes | No |
| `apps.site_config` | Singleton site-wide settings | Yes (public + admin) | Yes | No |
| `apps.analytics_app` | Custom event log | Yes (public create + admin overview) | Yes | No |

No app in the repository has a `tests.py` with content, a `tests/` package, or any test runner configuration. This applies to all eight apps equally and is not repeated per-model below.

## Abstract base models (`apps.core.models`) — reuse infrastructure, not content itself

| Model | Fields | Used by |
|---|---|---|
| `TimeStampedModel` | `created_at`, `updated_at` (auto) | Nearly every model in the repo |
| `PublishableModel` | `status` (`draft`/`published`), `published_at` | `Project`, `Service`, `Education`, `ResumeVersion`, and (separately, re-declared) `Experience` |
| `OrderedModel` | `display_order` | `Project`, `Experience`, `SkillCategory`, `Skill`, `Service`, `Education` |
| `SEOMetadataModel` | `seo_title`, `seo_description`, `seo_keywords`, `og_title`, `og_description`, `image_alt_text` | `Project`, `Experience`, `Service` |

**Reuse recommendation: Keep.** This mixin pattern is a clean, genuinely reusable foundation for the rebuild — a future CMS-style content model can keep composing from these same abstractions rather than re-inventing them.

---

## `apps.portfolio` — the core content app

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields for future system |
|---|---|---|---|---|---|---|---|---|
| `Technology` | Tag/label for a tool or language | `name` (unique), `slug` (unique) | Public | M2M target of `Project`, `Experience` | None (no draft/published state) | Keep | Low | Category/grouping (e.g. "language" vs "framework" vs "database") for richer filtering |
| `Project` | Portfolio case study | `title`, `slug`, `description`, `short_description` (uncommitted), `feature_bullets` (JSON, uncommitted), `technologies` (M2M), `live_url`, `github_url`, `preview_image`, `featured_image`, `alt_text`, `ai_summary`, `featured`, + `PublishableModel`/`OrderedModel`/`SEOMetadataModel` fields | Public (published only exposed via API) | M2M `Technology`; reverse FK from `ProjectImage`, `AnalyticsEvent`; M2M target of `ResumeVersion.include_projects` | draft/published | **Keep** | Low (additive fields only in the uncommitted migration) | Per-project fields the frontend already renders but the model does not store: `overview`, `problem`/`challenge`, `solution`, `outcome`, `development_highlights` — these currently exist only as hardcoded frontend fallback text (`projects.$slug.tsx`), not as real editable data. A rebuild CMS needs these as first-class fields, plus a real per-project repository URL (today every project shares one generic GitHub profile link). |
| `ProjectImage` *(uncommitted)* | Multi-image gallery per project | `project` (FK), `image`, `image_type` (`detail`/`preview`/`gallery`), `alt_text`, `caption`, `display_order`, `is_featured` | Public (via project detail API) | FK to `Project` | None | **Keep** — finish wiring into the public frontend (currently only `ProjectImageGallery.tsx` exists, unused by any route) | Low — additive, not yet migrated/applied to any database | None obviously missing; consider an explicit "cover image" boolean distinct from `is_featured` if `is_featured` is meant to be gallery-wide rather than per-type |
| `Experience` | Employment/internship history entry | `company_name`, `role_title`, `start_date`, `end_date`, `location`, `description`, `achievements` (JSON), `technologies` (M2M), `current_role`, `status` (defaults to published, unlike other `PublishableModel` users), + `OrderedModel`/`SEOMetadataModel` fields | Public | M2M `Technology`; M2M target of `ResumeVersion.include_experiences` | published-by-default | **Investigate before Keep** | Medium | See [CONTENT_TRUTH_INVENTORY.md](CONTENT_TRUTH_INVENTORY.md) — the seed data / résumé fallback and the home-page hardcoded fallback disagree on how many roles exist (3 vs. 4, "CognoRise InfoTech" only appears on the home page). The **model** is fine; the **data** feeding it is contradictory and must be reconciled with the owner before this becomes the single source of truth. Also note `role_title`/scope wording differs between sources for the Abasyn Incubation Center role ("Team Lead" appears only in some sources). |
| `SkillCategory` | Grouping for skills | `name` (unique), `slug` (unique), + `OrderedModel` | Public | Reverse FK from `Skill` | None | Keep | Low | None |
| `Skill` | Named skill with a 1–4 proficiency level | `name`, `description`, `level` (1–4 enum), `icon_or_badge`, `category` (FK), `published`, + `OrderedModel` | Public (if `published=True`) | FK to `SkillCategory` | published flag only | Keep the model; **rewrite the presentation** | Low | Nothing structurally missing — but see content note: the frontend independently re-derives a 0–100% bar from the 1–4 `level` via ad hoc client-side math (`normalizeLevel()` in `skills.tsx`) rather than storing a real percentage or qualitative tier, which is fragile and worth revisiting. |
| `Service` | Offered service/package | `title`, `slug`, `description`, `deliverables` (JSON), `featured`, + `PublishableModel`/`OrderedModel`/`SEOMetadataModel` | Public | Reverse FK from `ServiceRequest` (in `apps.inquiries`) | draft/published | Keep | Low | No pricing/tier field, no "currently accepting" capacity flag — both would help answer the "which services can genuinely be delivered now" open question without editing code. |
| `Education` | Academic history entry | `institution`, `degree`, `start_date`, `end_date`, `description`, + `PublishableModel`/`OrderedModel` | Public | M2M target of `ResumeVersion.include_education` | draft/published | Keep | Low | No field for honors/CGPA as a structured value (currently folded into free-text `description`, e.g. "Graduated 2025 • CGPA 3.67") — fine for one entry, would not scale cleanly to multiple degrees. |

## `apps.inquiries` — leads/CRM foundation

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields |
|---|---|---|---|---|---|---|---|---|
| `ContactMessage` | General contact-form submission | `sender_name`, `email`, `subject`, `service_type_text`, `message`, `status` (new/read/replied/archived), `admin_notes` | **Private** (staff-only after submission) | None | 4-state workflow already modeled | **Keep** — solid seed for the leads CRM in the project objective | Low | No source/UTM tracking, no linkage to `AnalyticsEvent`, no assigned-owner field, no follow-up/reminder date — all reasonable CRM additions. |
| `ServiceRequest` | Service-specific lead with budget/timeline | `sender_name`, `email`, `service` (FK, nullable), `service_type_text`, `subject`, `message`, `budget_range`, `timeline`, `source_page`, `status` (new/in_progress/closed), `admin_notes` | **Private** | FK to `Service` (nullable — free-text fallback also stored) | 3-state workflow | **Keep** | Low | Same CRM gaps as `ContactMessage`; also no monetary-value estimate field, which a real leads pipeline would likely want. |

Both models' only current "workflow automation" is a synchronous outbound admin-notification email fired from inside the serializer's `create()` (`apps/inquiries/api/serializers.py`) — no queue, no retry, no delivery-status tracking. Flagged as technical debt in [P00_EVIDENCE_FREEZE.md](P00_EVIDENCE_FREEZE.md), not restated as a missing field here since it's a process gap, not a schema gap.

## `apps.resume_builder` — résumé versioning foundation

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields |
|---|---|---|---|---|---|---|---|---|
| `ResumeVersion` | A named, targetable résumé built from a curated subset of portfolio content | `title`, `slug`, `target_role`, `custom_summary`, `include_projects`/`include_experiences`/`include_skills`/`include_education` (all M2M), `is_default`, `ats_tags`, + `PublishableModel` | Public (published, especially `is_default=True`) | M2M to `Project`, `Experience`, `Skill`, `Education` | draft/published + a single default flag | **Keep** — directly matches the "résumé/CV management" requirement in the project objective | Low | No certifications relation (certifications currently exist only as hardcoded frontend text with no backend model at all — see [CONTENT_TRUTH_INVENTORY.md](CONTENT_TRUTH_INVENTORY.md)); no per-version target-audience tag beyond free-text `target_role`. |
| `ResumeExport` | A generated export artifact of a résumé version | `resume_version` (FK), `format` (pdf/json/html), `file`, `download_count_snapshot` | Public (if linked and served) | FK to `ResumeVersion` | None | **Investigate** | Low (schema is fine) | Currently **disconnected from reality**: the actual PDF served to visitors (`frontend/public/resume/Shahriyar_Khan_Software_Engineer.pdf`) is a static frontend file, not a `ResumeExport.file` record, and no seed data or view populates/serves this model's `file` field. Needs either real wiring or acknowledgment that it's aspirational. |

## `apps.seo` — SEO metadata foundation

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields |
|---|---|---|---|---|---|---|---|---|
| `PageSEO` | Per-page metadata keyed by a hand-picked string | `page_key` (unique), `slug`, `title_tag`, `meta_description`, `keywords`, `og_title`, `og_description`, `image_alt_text`, `canonical_url`, `ai_suggested_title`, `ai_suggested_description` | Public (read) | None (standalone, not linked to `Project`/`Service`) | None | **Refactor** | Medium | This model cannot represent `/work/[slug]` or `/insights/[slug]` pages without either (a) generating one row per slug by convention, which is brittle, or (b) being replaced by the `SEOMetadataModel` mixin already used on `Project`/`Experience`/`Service`. Recommend consolidating onto the mixin pattern for entity-backed pages and keeping `PageSEO` only for truly static pages (home, about, contact, privacy). |
| `SEOAliasKeyword` | Flat list of name/brand keyword variants | `keyword` (unique), `is_active` | Internal/public indirectly (feeds keyword meta tags) | None | Active flag only | Keep | Low | None significant |

## `apps.site_config` — global settings foundation

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields |
|---|---|---|---|---|---|---|---|---|
| `SiteSetting` | Enforced singleton (`save()` pins `pk=1`) for site-wide values | `site_name`, `owner_name`, `public_email`, `public_phone`, `public_location`, `notification_email`, `hero_title`, `hero_subtitle`, `default_seo_title`/`default_seo_description`/`default_keywords`, `footer_text`, `social_links` (JSON), `maintenance_mode` | Public (read); admin write | None | `maintenance_mode` boolean only | **Keep** | Low | No structured "availability status" field even though the frontend hardcodes an "Open to Work" badge in two separate places (Footer, home hero) that could and should read from here instead; no canonical-domain field (directly relevant to the canonical-domain open decision). |

## `apps.analytics_app` — custom analytics foundation

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields |
|---|---|---|---|---|---|---|---|---|
| `AnalyticsEvent` | Generic event log | `event_type` (enum: page_visit/project_view/project_click/contact_submit/service_request_submit/resume_download), `page_path`, `project` (FK, nullable), `metadata` (JSON), `session_id`, `ip_hash`, indexed on `(event_type, created_at)` and `page_path` | **Private** (admin-only aggregate views) | Nullable FK to `Project` | None | **Investigate** | Low (schema) | Not integrated with Google Analytics/Search Console or any third-party tool — everything here is self-built and, per this audit, unverified against real traffic (no way to confirm from the repo whether this table has ever received a real event, since the live API layer is currently 500ing). Decide whether the rebuild keeps a custom event log, adopts a third-party analytics tool, or does both. |

## `apps.accounts` — auth foundation

| Model | Purpose | Key fields | Public/private | Relationships | Workflow state | Reuse recommendation | Migration risk | Missing fields |
|---|---|---|---|---|---|---|---|---|
| `UserProfile` | Extends Django's `User` with role/ownership info | `user` (OneToOne), `role`, `is_owner`, `timezone` | **Private** | OneToOne to Django `User` | None | Keep | Low | `role` is a free-text `CharField` compared case-insensitively against an env-configured allowlist (`ADMIN_ALLOWED_ROLES`) rather than a proper enum/choices field or a real permissions/groups model — workable for a single-owner site, would not scale to a real multi-person "engineering organization" team without rework. |

---

## Cross-cutting findings for P01

- **Projects and case studies**: real foundation exists (`Project` + uncommitted `ProjectImage`), but the actual case-study narrative fields (overview/problem/solution/outcome) the frontend already displays are **not modeled at all** — they live only as hardcoded TypeScript objects in `projects.$slug.tsx`. This is the single biggest content-model gap relative to what the current frontend already promises visually.
- **Services**: modeled and reasonably complete; missing only a capacity/availability signal.
- **Inquiries/leads**: a genuine two-model CRM seed; needs CRM-standard fields (source tracking, ownership, follow-up) and a non-blocking notification pipeline, not a schema rewrite.
- **Résumé builder/versioning**: modeled well on paper, but disconnected in practice from the actual PDF served to the public, and has no certifications relation.
- **SEO records**: exist, but the `PageSEO` keying scheme will not extend cleanly to a slug-based future IA (`/work/[slug]`, `/insights/[slug]`) without consolidating onto the existing `SEOMetadataModel` mixin pattern.
- **Analytics**: a working custom event schema exists but is unverified in practice and not integrated with any standard tool — a build-vs-buy decision for P01, not a migration task.
- **Site configuration**: a real singleton exists and is under-used by the frontend (two hardcoded "availability" badges that could read from it instead).
- **Admin workflows**: Django admin + a custom `IsPortfolioAdmin`/`AdminAccessControlMiddleware` gate is the only current admin surface; there is no separate frontend admin UI in the running app today (the two components that look like a start on one, `AdminProjectForm.tsx`/`ProjectImageGallery.tsx`, are not wired into any route).

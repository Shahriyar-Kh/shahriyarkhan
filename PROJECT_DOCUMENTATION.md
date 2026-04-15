# Gleam Dev Folio - Full Project Documentation

## 1) Project Overview

This project is a personal portfolio web application for Shahriyar Khan, built with TanStack Start (React + file-based routing) and Vite.

Primary goals:
- Present professional profile, skills, services, projects, and resume.
- Provide contact and service-request forms.
- Deliver a modern UI with reusable design system components.
- Support deployable server entry for Cloudflare via Wrangler.

## 2) Tech Stack

- Framework: TanStack Start + TanStack Router (file-based routing)
- Frontend: React 19 + TypeScript
- Build Tool: Vite 7
- Styling: Tailwind CSS v4 + custom CSS variables/animations
- UI Primitives: Radix UI packages + custom UI wrappers in src/components/ui
- Icons: lucide-react
- Validation/Form utilities available: zod, react-hook-form, @hookform/resolvers
- Charts/UI extras available: recharts, sonner, embla-carousel-react, date-fns
- Deployment target: Cloudflare Workers (wrangler.jsonc)

## 3) Package Scripts

From package.json:
- npm run dev: Start local dev server
- npm run build: Production build
- npm run build:dev: Development-mode build
- npm run preview: Preview production build
- npm run lint: Run ESLint

## 4) Full Project Structure (Folders and Files)

Below is the full tracked repository structure.

```text
gleam-dev-folio/
|-- .gitignore
|-- bun.lockb
|-- bunfig.toml
|-- components.json
|-- eslint.config.js
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- wrangler.jsonc
|-- public/
|   |-- images/
|   |   |-- profile.png
|   |-- placeholder.svg
|   |-- resume/
|       |-- Shahriyar_Khan_Software_Engineer.pdf
|-- src/
|   |-- routeTree.gen.ts
|   |-- router.tsx
|   |-- styles.css
|   |-- components/
|   |   |-- Footer.tsx
|   |   |-- Header.tsx
|   |   |-- SectionHeading.tsx
|   |   |-- ui/
|   |       |-- accordion.tsx
|   |       |-- alert-dialog.tsx
|   |       |-- alert.tsx
|   |       |-- aspect-ratio.tsx
|   |       |-- avatar.tsx
|   |       |-- badge.tsx
|   |       |-- breadcrumb.tsx
|   |       |-- button.tsx
|   |       |-- calendar.tsx
|   |       |-- card.tsx
|   |       |-- carousel.tsx
|   |       |-- chart.tsx
|   |       |-- checkbox.tsx
|   |       |-- collapsible.tsx
|   |       |-- command.tsx
|   |       |-- context-menu.tsx
|   |       |-- dialog.tsx
|   |       |-- drawer.tsx
|   |       |-- dropdown-menu.tsx
|   |       |-- form.tsx
|   |       |-- hover-card.tsx
|   |       |-- input-otp.tsx
|   |       |-- input.tsx
|   |       |-- label.tsx
|   |       |-- menubar.tsx
|   |       |-- navigation-menu.tsx
|   |       |-- pagination.tsx
|   |       |-- popover.tsx
|   |       |-- progress.tsx
|   |       |-- radio-group.tsx
|   |       |-- resizable.tsx
|   |       |-- scroll-area.tsx
|   |       |-- select.tsx
|   |       |-- separator.tsx
|   |       |-- sheet.tsx
|   |       |-- sidebar.tsx
|   |       |-- skeleton.tsx
|   |       |-- slider.tsx
|   |       |-- sonner.tsx
|   |       |-- switch.tsx
|   |       |-- table.tsx
|   |       |-- tabs.tsx
|   |       |-- textarea.tsx
|   |       |-- toggle-group.tsx
|   |       |-- toggle.tsx
|   |       |-- tooltip.tsx
|   |-- hooks/
|   |   |-- use-mobile.tsx
|   |   |-- useScrollAnimation.ts
|   |-- lib/
|   |   |-- utils.ts
|   |-- routes/
|       |-- __root.tsx
|       |-- about.tsx
|       |-- contact.tsx
|       |-- index.tsx
|       |-- projects.tsx
|       |-- resume.tsx
|       |-- services.tsx
|       |-- skills.tsx
```

## 5) Routing Documentation (All Routes)

TanStack file-based routes are defined in src/routes and reflected in src/routeTree.gen.ts.

### Route Table

| Path | Route File | Purpose |
|---|---|---|
| / | src/routes/index.tsx | Home page with hero section, typewriter roles, highlights, and CTA links. |
| /about | src/routes/about.tsx | Personal summary, education, backend focus, production/deployment exposure. |
| /skills | src/routes/skills.tsx | Categorized technical skills with animated progress bars. |
| /services | src/routes/services.tsx | Services grid plus service-request form UI flow. |
| /projects | src/routes/projects.tsx | Portfolio projects list with tools, live links, and source links. |
| /resume | src/routes/resume.tsx | Resume preview and PDF download. |
| /contact | src/routes/contact.tsx | Contact information, social links, and contact form UI flow. |

### Root Layout Route

- File: src/routes/__root.tsx
- Responsibilities:
  - App shell document structure (html/head/body)
  - Global metadata and font stylesheet link
  - Shared Header and Footer wrapping routed content via Outlet
  - Not found (404) component

### Router Bootstrap

- File: src/router.tsx
- Responsibilities:
  - Creates router from generated route tree
  - Enables scroll restoration
  - Provides default error component and reset behavior

## 6) Core Architecture

### UI and Layout
- Header and Footer are shared across all pages.
- SectionHeading is reused to normalize section titles and subtitles.
- Design system and utility styles are centralized in src/styles.css.

### Styling System
- Tailwind CSS v4 directives plus custom CSS token variables.
- Theme variables include colors, radii, glassmorphism surfaces, gradients, and motion classes.
- Custom utility classes include:
  - glass, glass-card
  - gradient-primary, gradient-text
  - animate-fade-in-up, animate-float, animate-pulse-glow, animate-typewriter-blink

### Reusable UI Library
- src/components/ui contains a full reusable component set (Radix-based wrappers and helpers) including form controls, navigation primitives, overlays, feedback components, and layout utilities.

### Hooks and Utilities
- src/hooks/useScrollAnimation.ts: One-time intersection observer reveal hook.
- src/hooks/use-mobile.tsx: Mobile breakpoint helper hook.
- src/lib/utils.ts: Shared helper functions (class merging and related utilities).

## 7) Assets and Static Content

- Profile image: public/images/profile.png
- Resume PDF: public/resume/Shahriyar_Khan_Software_Engineer.pdf
- Generic placeholder: public/placeholder.svg

## 8) SEO and Metadata

- Global SEO defaults are in src/routes/__root.tsx (title, description, author, keywords, Open Graph, robots, Twitter card).
- Each page route defines route-specific head metadata to improve discoverability and sharing previews.

## 9) Deployment and Runtime Notes

- wrangler.jsonc defines Cloudflare compatibility and uses @tanstack/react-start/server-entry as main server entry.
- vite.config.ts uses @lovable.dev/vite-tanstack-config wrapper; additional core plugins are intentionally managed by that package.

## 10) Quick Start

1. Install dependencies
   - npm install

2. Start development server
   - npm run dev

3. Build production artifacts
   - npm run build

4. Preview production build locally
   - npm run preview

5. Lint code
   - npm run lint

## 11) Important Files At a Glance

- package.json: scripts and dependencies
- vite.config.ts: Vite/TanStack config bridge
- wrangler.jsonc: Cloudflare runtime config
- src/router.tsx: router creation + global error handling
- src/routeTree.gen.ts: generated route registry
- src/routes/__root.tsx: app shell, global metadata, shared layout
- src/styles.css: design tokens, motion, and core UI utilities

## 12) Notes

- src/routeTree.gen.ts is auto-generated and should not be edited manually.
- Forms in services/contact are currently client-side interaction flows; backend submission integration can be added later.

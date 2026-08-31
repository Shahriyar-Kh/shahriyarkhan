import Link from "next/link";
import { ExternalLink } from "@/components/ui/external-link";
import { Icon } from "@/components/ui/icon";
import { PRIMARY_NAV } from "@/content/nav";
import { CONTACT_FALLBACKS, OWNER_NAME, SOCIAL_LINKS } from "@/content/site";

// Upgraded in a later commit to prefer SiteSettings.footer_text /
// public_email from the live API, falling back to these constants when
// the field is empty or the fetch fails - see lib/api/site.ts.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="section-shell flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-heading text-body-sm font-semibold text-ink-primary">{OWNER_NAME}</p>
          <p className="mt-2 text-caption-sm text-ink-tertiary">
            Python and Django engineering for REST APIs, authenticated business platforms, and deployed
            web products.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {PRIMARY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-caption-sm text-ink-tertiary hover:text-ink-primary">
              {item.label}
            </Link>
          ))}
          <Link href="/privacy" className="text-caption-sm text-ink-tertiary hover:text-ink-primary">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ExternalLink
            href={SOCIAL_LINKS.github}
            aria-label="GitHub"
            className="text-ink-tertiary hover:text-ink-primary"
          >
            <Icon.Github size={18} />
          </ExternalLink>
          <ExternalLink
            href={SOCIAL_LINKS.linkedin}
            aria-label="LinkedIn"
            className="text-ink-tertiary hover:text-ink-primary"
          >
            <Icon.Linkedin size={18} />
          </ExternalLink>
          <a href={`mailto:${CONTACT_FALLBACKS.email}`} aria-label="Email" className="text-ink-tertiary hover:text-ink-primary">
            <Icon.Mail size={18} />
          </a>
        </div>
      </div>
      <div className="section-shell border-t border-border py-4">
        <p className="text-caption-sm text-ink-hint">
          © {year} {OWNER_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

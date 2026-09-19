import Link from "next/link";
import { getSiteSettings } from "@/lib/api";
import { ExternalLink } from "@/components/ui/external-link";
import { Icon } from "@/components/ui/icon";
import { PRIMARY_NAV } from "@/content/nav";
import { CONTACT_FALLBACKS, OWNER_NAME, SOCIAL_LINKS } from "@/content/site";

export async function SiteFooter() {
  // Next dedupes this against any other getSiteSettings() call made
  // during the same request (e.g. the homepage's own Promise.all).
  const result = await getSiteSettings();
  const footerText = result.ok && result.data.footer_text ? result.data.footer_text : null;
  const email = (result.ok && result.data.public_email) || CONTACT_FALLBACKS.email;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="section-shell flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-heading text-body-sm font-semibold text-ink-primary">{OWNER_NAME}</p>
          <p className="mt-2 text-caption-sm text-ink-tertiary">
            {footerText ??
              "Python and Django engineering for REST APIs, authenticated business platforms, and deployed web products."}
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
            data-analytics-event="outbound_github"
          >
            <Icon.Github size={18} />
          </ExternalLink>
          <ExternalLink
            href={SOCIAL_LINKS.linkedin}
            aria-label="LinkedIn"
            className="text-ink-tertiary hover:text-ink-primary"
            data-analytics-event="outbound_linkedin"
          >
            <Icon.Linkedin size={18} />
          </ExternalLink>
          <a href={`mailto:${email}`} aria-label="Email" className="text-ink-tertiary hover:text-ink-primary">
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

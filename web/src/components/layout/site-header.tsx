import Link from "next/link";
import { Connector } from "@/components/motif/connector";
import { Node } from "@/components/motif/node";
import { NavLink } from "@/components/layout/nav-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { PRIMARY_NAV } from "@/content/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-saturate-150">
      <div className="section-shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-body-sm font-semibold text-ink-primary">
          <Node filled size={8} />
          Shahriyar Khan
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Connector orientation="vertical" className="h-6" />
          <Button href="/resume" variant="secondary" size="sm">
            Résumé
          </Button>
        </div>

        <MobileNav items={PRIMARY_NAV} />
      </div>
    </header>
  );
}

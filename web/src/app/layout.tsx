import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollProgress } from "@/components/motif/scroll-progress";
import { SkipLink } from "@/components/ui/skip-link";
import { SITE_URL } from "@/content/site";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Accent face for data/annotations only - not preloaded, since it's
// typically below the fold (section numbers, tech names, claim dates).
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shahriyar Khan — Software Engineer",
    template: "%s — Shahriyar Khan",
  },
  description: "Python and Django engineering for REST APIs, authenticated business platforms, and deployed web products.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0e15",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body">
        <SkipLink />
        <ScrollProgress />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

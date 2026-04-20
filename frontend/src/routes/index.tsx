import { Link } from "@/lib/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Download, Mail, Code2, Server, Database, Sparkles, Star, ExternalLink } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { applySeo } from "@/lib/seo";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

const roles = [
  "Software Engineer",
  "Python Developer",
  "Django Developer",
  "Backend Developer",
  "Junior Full Stack Developer",
];

function TypewriterText() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const speed = isDeleting ? 34 : 68;

    if (!isDeleting && text === currentRole) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === "") {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setText(
        isDeleting
          ? currentRole.substring(0, text.length - 1)
          : currentRole.substring(0, text.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, roleIndex]);

  return (
    <span className="gradient-text font-extrabold">
      {text}
      <span className="animate-typewriter-blink text-primary ml-0.5">|</span>
    </span>
  );
}

const highlights = [
  { icon: Code2, label: "Full-Stack Apps", value: "5+", sub: "Production ready" },
  { icon: Server, label: "Backend Systems", value: "Django", sub: "FastAPI & DRF" },
  { icon: Database, label: "Databases", value: "4+", sub: "PostgreSQL, MongoDB" },
  { icon: Sparkles, label: "AI Integration", value: "OpenAI", sub: "Groq & ML" },
];

const techStack = ["Python", "Django", "FastAPI", "React.js", "PostgreSQL", "Redis", "Docker", "JWT"];

type SiteSettings = {
  site_name?: string;
  hero_title?: string;
  hero_subtitle?: string;
};

type PageSeo = {
  title_tag?: string;
  meta_description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  image_alt_text?: string;
};

export function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [backendEmpty, setBackendEmpty] = useState(false);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchJson<SiteSettings>("/api/v1/public/site/settings/"),
      fetchJson<PageSeo>("/api/v1/public/seo/pages/home/"),
    ]).then(([settingsResult, seoResult]) => {
      if (!active) return;

      if (settingsResult.status === "fulfilled") {
        setSiteSettings(settingsResult.value);
      }

      setBackendEmpty(settingsResult.status !== "fulfilled" || seoResult.status !== "fulfilled");

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Shahriyar Khan — Software Engineer | Python & Django Developer",
        description: seo?.meta_description ?? "Premium portfolio of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, scalable backend systems, and modern full-stack development.",
        keywords: seo?.keywords ?? "Shahriyar, Shahriyar Khan, Shary, Python Developer, Django Developer, Backend Developer, Junior Full Stack Developer",
        ogTitle: seo?.og_title ?? "Shahriyar Khan — Software Engineer",
        ogDescription: seo?.og_description ?? "Shahriyar Khan (Shary) is a Software Engineer focused on Python, Django, FastAPI, and high-quality backend architecture.",
        ogImageAlt: seo?.image_alt_text ?? "Portrait of Shahriyar Khan, Software Engineer",
        twitterTitle: seo?.title_tag ?? "Shahriyar Khan — Software Engineer | Python & Django Developer",
        twitterDescription: seo?.meta_description ?? "Premium portfolio of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, scalable backend systems, and modern full-stack development.",
      });
    });

    return () => { active = false; };
  }, [refreshKey]);

  const heroTitle = siteSettings?.hero_title ?? "Hi, I'm Shahriyar Khan";
  const heroSubtitle = siteSettings?.hero_subtitle ?? "Software Engineer crafting scalable products with Python, Django, FastAPI, and modern frontend technologies.";

  return (
    <>
      {/* ── HERO ── */}
      <section className="section-shell relative overflow-hidden min-h-[92vh] flex items-center" aria-label="Hero section">
        {/* Ambient background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-[8%] -left-24 w-120 h-120 rounded-full bg-primary/8 blur-[96px] animate-soft-pan" />
          <div className="absolute top-[40%] -right-24 w-105 h-105 rounded-full bg-accent/7 blur-[80px] animate-soft-pan" style={{ animationDelay: "1.2s" }} />
          <div className="absolute -bottom-20 left-1/3 w-90 h-90 rounded-full bg-purple-500/5 blur-[80px] animate-soft-pan" style={{ animationDelay: "2.4s" }} />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(oklch(0.68 0.195 224) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.68 0.195 224) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          {backendEmpty && (
            <div className="mb-10 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              Home content using local fallback — Django site settings or SEO record is missing or unpublished.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-center">
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end reveal-in" style={{ animationDelay: "0.15s" }}>
              <div className="relative hero-portrait-shell">
                <div className="profile-luxury-card profile-float w-72 h-72 sm:w-92 sm:h-92">
                  <div className="orbit-frame h-full w-full">
                    <div className="profile-swap h-full w-full">
                      <img
                        src="/images/profile.png"
                        alt="Shahriyar Khan professional profile portrait"
                        className="primary-img"
                        loading="eager"
                        decoding="async"
                      />
                      <img
                        src="/images/shary%20photo.jpeg"
                        alt="Shahriyar Khan in a professional workspace"
                        className="secondary-img"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── LEFT: Text Content ── */}
            <div className="order-2 lg:order-1 reveal-in">
              {/* Status pill */}
              <div className="status-pill mb-7 w-fit hidden sm:inline-flex">
                Open to Work — Available Now
              </div>

              {/* Main Heading */}
              <h1 className="text-display text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] text-foreground leading-[1.06] mb-5">
                <span className="gradient-text">{heroTitle}</span>
              </h1>

              {/* Typewriter role */}
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground/80 min-h-10 mb-5">
                <TypewriterText />
              </div>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-3">
                {heroSubtitle}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground/85 leading-relaxed max-w-lg mb-10">
                Building scalable web applications and backend systems with Python, Django, and modern technologies. Passionate about clean architecture and AI-powered solutions.
              </p>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2 mb-10">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider text-foreground/70 border border-border/80 bg-secondary/60 hover:border-primary/40 hover:text-primary transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2.5 rounded-xl gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.97]"
                >
                  View Projects <ArrowRight size={15} />
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-secondary/70 px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-lg hover:bg-secondary hover:border-border/60 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <Download size={15} /> Download CV
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-7 py-3.5 text-sm font-semibold text-primary hover:bg-primary/12 hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <Mail size={15} /> Contact Me
                </Link>
              </div>
            </div>

          </div>

          {/* ── HIGHLIGHTS STRIP ── */}
          <div ref={highlightsRef} className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {highlights.map((item, i) => (
              <div
                key={item.label}
                className="premium-card rounded-xl p-5 text-center reveal-in tilt-hover group"
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              >
                <div className="w-10 h-10 rounded-xl gradient-primary mx-auto mb-3 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <item.icon size={19} className="text-primary-foreground" />
                </div>
                <p className="text-lg font-extrabold text-foreground tracking-tight">{item.value}</p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* ── FEATURED LINKS / CTA STRIP ── */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">Ready to collaborate?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
              >
                Hire me for a project <ExternalLink size={13} />
              </Link>
              <span className="text-border">·</span>
              <Link
                to="/skills"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                View my skills →
              </Link>
              <span className="text-border">·</span>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                About me →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

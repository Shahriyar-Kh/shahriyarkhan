import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Download, Mail, Code2, Server, Database, Sparkles } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { applySeo } from "@/lib/seo";

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
    const speed = isDeleting ? 36 : 72;

    if (!isDeleting && text === currentRole) {
      const timeout = setTimeout(() => setIsDeleting(true), 1700);
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
    <span className="gradient-text">
      {text}
      <span className="animate-typewriter-blink text-primary">|</span>
    </span>
  );
}

const highlights = [
  { icon: Code2, label: "Full-Stack Apps", value: "5+" },
  { icon: Server, label: "Backend Systems", value: "Django & FastAPI" },
  { icon: Database, label: "Databases", value: "PostgreSQL & MongoDB" },
  { icon: Sparkles, label: "AI Integration", value: "OpenAI & Groq" },
];

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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shahriyar Khan — Software Engineer | Python & Django Developer" },
      { name: "description", content: "Shahriyar Khan (Shary) is a Software Engineer, Python Developer, Django Developer, and Backend Developer building scalable, production-grade web applications." },
      { name: "keywords", content: "Shahriyar, Shahriyar Khan, Shary, Software Engineer, Python Developer, Django Developer, Backend Developer, Junior Full Stack Developer" },
      { property: "og:title", content: "Shahriyar Khan — Software Engineer" },
      { property: "og:description", content: "Portfolio of Shahriyar Khan (Shary), a Python, Django, and FastAPI developer focused on scalable backend architecture." },
      { property: "og:image", content: "/images/profile.png" },
      { property: "og:image:alt", content: "Professional profile photo of Shahriyar Khan" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Shahriyar Khan — Software Engineer" },
      { name: "twitter:description", content: "Python Developer, Django Developer, Backend Developer, and Junior Full Stack Developer portfolio." },
      { name: "twitter:image", content: "/images/profile.png" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [backendEmpty, setBackendEmpty] = useState(false);

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

    return () => {
      active = false;
    };
  }, []);

  const heroTitle = siteSettings?.hero_title ?? "Hi, I'm Shahriyar Khan";
  const heroSubtitle = siteSettings?.hero_subtitle ?? "Software Engineer crafting scalable products with Python, Django, FastAPI, and modern frontend technologies.";

  return (
    <>
      {/* Hero Section */}
      <section className="section-shell relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-soft-pan" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/12 blur-3xl animate-soft-pan" style={{ animationDelay: "0.8s" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          {backendEmpty && (
            <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              Home content is using local fallback text because the Django site settings or SEO record is missing or unpublished.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="reveal-in">
              <p className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary tracking-[0.18em] uppercase mb-5">
                Welcome to my portfolio
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                <span className="gradient-text">{heroTitle}</span>
              </h1>
              <div className="mt-4 text-xl sm:text-2xl font-semibold text-foreground min-h-10">
                <TypewriterText />
              </div>
              <h2 className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                {heroSubtitle}
              </h2>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Building scalable web applications and backend systems with Python, Django, and modern technologies. Passionate about clean architecture and AI-powered solutions.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-xl gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]"
                >
                  View Projects <ArrowRight size={16} />
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-lg shadow-black/20 hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Download size={16} /> Download CV
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-7 py-3.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Mail size={16} /> Contact Me
                </Link>
              </div>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center lg:justify-end reveal-in" style={{ animationDelay: "0.15s" }}>
              <div className="profile-luxury-card profile-float w-72 h-80 sm:w-[24rem] sm:h-108">
                <div className="orbit-frame h-full w-full">
                  <div className="profile-swap h-full w-full">
                    <img
                      src="/images/profile.png"
                      alt="Shahriyar Khan professional profile portrait"
                      className="primary-img"
                      loading="eager"
                    />
                    <img
                      src="/images/shary%20photo.jpeg"
                      alt="Shahriyar Khan in a professional workspace"
                      className="secondary-img"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="absolute right-2 top-2 rounded-lg border border-primary/30 bg-background/80 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                  Open to Work
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {highlights.map((item, i) => (
              <div
                key={item.label}
                className="premium-card rounded-xl p-5 text-center reveal-in tilt-hover"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <item.icon className="mx-auto text-primary mb-3" size={24} />
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

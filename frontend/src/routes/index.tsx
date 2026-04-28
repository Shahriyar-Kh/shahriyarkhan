import { Link } from "@/lib/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Download, Mail, Code2, Server, Database,
  Sparkles, ExternalLink, Github, Linkedin, ChevronDown,
} from "lucide-react";
import { fetchJson } from "@/lib/api";
import { applySeo } from "@/lib/seo";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

// ─── Typewriter ──────────────────────────────────────────────────────────────
const roles = [
  "Software Engineer",
  "Python Developer",
  "Django Developer",
  "Backend Developer",
  "Full Stack Developer",
];

function TypewriterText() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const speed = isDeleting ? 38 : 72;

    if (!isDeleting && text === currentRole) {
      const t = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (isDeleting && text === "") {
      setIsDeleting(false);
      setRoleIndex((p) => (p + 1) % roles.length);
      return;
    }
    const t = setTimeout(() => {
      setText(
        isDeleting
          ? currentRole.substring(0, text.length - 1)
          : currentRole.substring(0, text.length + 1)
      );
    }, speed);
    return () => clearTimeout(t);
  }, [text, isDeleting, roleIndex]);

  return (
    <span className="hero-typewriter">
      {text}
      <span className="typewriter-cursor">|</span>
    </span>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function CounterNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); return; }
          setCount(start);
        }, 35);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Stat cards ───────────────────────────────────────────────────────────────
const stats = [
  { icon: Code2,    value: 5,  suffix: "+", label: "Production Apps",   sub: "Deployed & live" },
  { icon: Server,   value: 3,  suffix: "+", label: "Years Learning",    sub: "Python & Django" },
  { icon: Database, value: 4,  suffix: "+", label: "Databases Mastered",sub: "SQL & NoSQL" },
  { icon: Sparkles, value: 10, suffix: "+", label: "Projects Built",    sub: "End-to-end" },
];

// ─── Tech pills ───────────────────────────────────────────────────────────────
const techStack = [
  "Python", "Django", "FastAPI", "React.js",
  "PostgreSQL", "Redis", "Docker", "JWT",
];

// ─── Types ────────────────────────────────────────────────────────────────────
type SiteSettings = { site_name?: string; hero_title?: string; hero_subtitle?: string; };
type PageSeo = {
  title_tag?: string; meta_description?: string; keywords?: string;
  og_title?: string; og_description?: string; image_alt_text?: string;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [backendEmpty, setBackendEmpty] = useState(false);
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchJson<SiteSettings>("/api/v1/public/site/settings/"),
      fetchJson<PageSeo>("/api/v1/public/seo/pages/home/"),
    ]).then(([settingsResult, seoResult]) => {
      if (!active) return;
      if (settingsResult.status === "fulfilled") setSiteSettings(settingsResult.value);
      setBackendEmpty(settingsResult.status !== "fulfilled" || seoResult.status !== "fulfilled");
      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Shahriyar Khan — Software Engineer | Python & Django Developer",
        description: seo?.meta_description ?? "Portfolio of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, and full-stack development.",
        keywords: seo?.keywords ?? "Shahriyar, Shahriyar Khan, Shary, Python Developer, Django Developer, Backend Developer",
        ogTitle: seo?.og_title ?? "Shahriyar Khan — Software Engineer",
        ogDescription: seo?.og_description ?? "Shahriyar Khan (Shary) is a Software Engineer focused on Python, Django, FastAPI, and high-quality backend architecture.",
        ogImageAlt: seo?.image_alt_text ?? "Portrait of Shahriyar Khan, Software Engineer",
      });
    });
    return () => { active = false; };
  }, [refreshKey]);

  const heroTitle = siteSettings?.hero_title ?? "Hi, I'm Shahriyar Khan";
  const heroSubtitle = siteSettings?.hero_subtitle ?? "Software Engineer crafting scalable products with Python, Django, FastAPI, and modern frontend technologies.";

  return (
    <>
      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="hero-section" aria-label="Hero section">

        {/* Rich layered background */}
        <div className="hero-bg" aria-hidden="true">
          {/* Noise grain overlay */}
          <div className="hero-grain" />
          {/* Ambient orbs */}
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
          <div className="hero-orb hero-orb--3" />
          {/* Subtle grid */}
          <div className="hero-grid" />
          {/* Radial vignette */}
          <div className="hero-vignette" />
        </div>

        <div className="hero-container">
          {backendEmpty && (
            <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Home content using local fallback — Django site settings or SEO record is missing or unpublished.
            </div>
          )}

          {/* ── HERO GRID ─────────────────────────── */}
          <div className="hero-grid-layout">

            {/* ── LEFT: Text Content ── */}
            <div className="hero-text-col">
              {/* Availability pill */}
              <div className="hero-pill">
                <span className="hero-pill__dot" />
                Open to Work — Available Now
              </div>

              {/* Main heading */}
              <h1 className="hero-heading">
                <span className="hero-heading__greeting">Hi, I'm</span>
                <span className="hero-heading__name gradient-text">{heroTitle.replace("Hi, I'm ", "").replace("Hi, I'm", "").trim() || "Shahriyar Khan"}</span>
              </h1>

              {/* Typewriter role line */}
              <div className="hero-role-line" aria-label="Current role">
                <TypewriterText />
              </div>

              {/* Subtitle */}
              <p className="hero-subtitle">{heroSubtitle}</p>
              <p className="hero-body">
                Building scalable systems and backend architecture with Python, Django, and modern technologies. Passionate about clean code, AI-powered features, and delivering production-ready products.
              </p>

              {/* Tech stack pills */}
              <div className="hero-tech-stack">
                {techStack.map((tech, i) => (
                  <span key={tech} className="tech-pill" style={{ animationDelay: `${0.5 + i * 0.06}s` }}>
                    {tech}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="hero-cta-row">
                <Link to="/projects" className="btn-primary">
                  View Projects <ArrowRight size={15} />
                </Link>
                <Link to="/resume" className="btn-secondary">
                  <Download size={15} /> Download CV
                </Link>
                <Link to="/contact" className="btn-ghost">
                  <Mail size={15} /> Contact
                </Link>
              </div>

              {/* Social links */}
              <div className="hero-socials">
                <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                  <Linkedin size={16} />
                </a>
                <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                  <Github size={16} />
                </a>
                <div className="social-divider" />
                <span className="social-label">shahriyarkhanpk1@gmail.com</span>
              </div>
            </div>

            {/* ── RIGHT: Profile ── */}
            <div className="hero-portrait-col">
              <div className="portrait-wrapper">

                {/* Outer glow ring (static) */}
                <div className="portrait-glow-ring" />

                {/* Animated conic border */}
                <div className="portrait-conic-border">

                  {/* Inner card */}
                  <div className="portrait-card">
                    <div className="portrait-image-swap">
                      <img
                        src="/images/profile.png"
                        alt="Shahriyar Khan — Software Engineer"
                        className="portrait-img portrait-img--primary"
                        loading="eager"
                        decoding="async"
                      />
                      <img
                        src="/images/shary%20photo.jpeg"
                        alt="Shahriyar Khan in a professional workspace"
                        className="portrait-img portrait-img--secondary"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating info badges */}
                <div className="portrait-badge portrait-badge--tl">
                  <span className="portrait-badge__dot" />
                  <span className="portrait-badge__text">Available</span>
                </div>
                <div className="portrait-badge portrait-badge--br">
                  <Code2 size={12} />
                  <span className="portrait-badge__text">Backend Dev</span>
                </div>

                {/* Orbiting accent dots */}
                <div className="portrait-orbit-dots" aria-hidden="true">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>

          {/* ── STAT CARDS STRIP ── */}
          <div className="stats-strip">
            {stats.map((stat, i) => (
              <div key={stat.label} className="stat-card" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                <div className="stat-card__icon">
                  <stat.icon size={18} />
                </div>
                <p className="stat-card__value">
                  <CounterNumber target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="stat-card__label">{stat.label}</p>
                <p className="stat-card__sub">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* ── BOTTOM NAV LINKS ── */}
          <div className="hero-footer-links">
            <p className="hero-footer-links__prompt">Ready to collaborate?</p>
            <div className="hero-footer-links__row">
              <Link to="/services" className="footer-link footer-link--accent">
                Hire me for a project <ExternalLink size={12} />
              </Link>
              <span className="footer-link__sep" />
              <Link to="/skills" className="footer-link">View my skills →</Link>
              <span className="footer-link__sep" />
              <Link to="/about"  className="footer-link">About me →</Link>
              <span className="footer-link__sep" />
              <Link to="/projects" className="footer-link">All projects →</Link>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="hero-scroll-cue" aria-hidden="true">
            <ChevronDown size={16} />
          </div>
        </div>
      </section>
    </>
  );
}
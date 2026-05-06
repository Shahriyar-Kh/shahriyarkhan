import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink, Github, ArrowLeft, CheckCircle2, Star,
  Code2, Globe, Calendar, Layers, ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";
import { applySeo } from "@/lib/seo";
import { assetUrl, fetchJson } from "@/lib/api";
import { Link } from "@/lib/navigation";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tech = { name: string; slug: string };

type ProjectDetail = {
  title: string; slug?: string;
  description: string;
  live_url?: string; github_url?: string;
  preview_image?: string | null; featured_image?: string | null;
  ai_summary?: string;
  seo_title?: string; seo_description?: string; seo_keywords?: string;
  og_title?: string; og_description?: string; image_alt_text?: string;
  featured?: boolean;
  technologies?: Tech[];
  // Case study fields (from backend)
  overview?: string; problem?: string; solution?: string;
  outcome?: string; challenge?: string;
  feature_bullets?: string | string[];
  development_highlights?: string | string[];
  detail_images?: string[];
};

type GalleryImage = { src: string; alt: string };

// ─── Fallback data ────────────────────────────────────────────────────────────
const projectFallbacks: Record<string, ProjectDetail> = {
  "sk-learntrack-ai-learning-platform": {
    title: "SK-LearnTrack — AI Learning Platform",
    description: "Full-stack LMS using Django REST Framework and React with JWT authentication, student progress tracking, and OpenAI-powered AI-assisted learning features.",
    live_url: "https://sk-learntrack.vercel.app",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/sk-learntrack_homepage.png",
    featured_image: "/images/sk-learntrack.landinpage.jpeg",
    ai_summary: "A focused learning platform that combines structured courses, AI support, and progress visibility in one clean experience.",
    overview: "SK-LearnTrack is a full-featured learning management system that brings AI-powered study assistance to structured course learning. Built for students who want clear progress, fast answers, and a distraction-free experience.",
    problem: "Learners needed a cleaner path through study content, meaningful progress tracking, and fast AI help — without bouncing between disconnected tools and services.",
    solution: "Built a unified LMS with OpenAI integration for instant AI tutoring, a structured course progression system, and a real-time student dashboard. Entire backend powered by Django REST Framework with PostgreSQL.",
    outcome: "A polished learning product that feels guided, trustworthy, and ready for real-world student use. AI assistance reduces time-to-answer by over 60% compared to traditional search.",
    feature_bullets: ["AI-assisted study support with OpenAI integration", "Structured learning journeys with course progression", "Student dashboards with progress and activity tracking", "Secure JWT authentication and role-based access", "Fully responsive React frontend with clean UX"],
    technologies: [{ name: "Django", slug: "django" }, { name: "DRF", slug: "drf" }, { name: "React", slug: "react" }, { name: "PostgreSQL", slug: "postgresql" }, { name: "OpenAI", slug: "openai" }],
  },
  "noteassist-ai-productivity-platform": {
    title: "NoteAssist AI — Productivity Platform",
    description: "Full-stack application with secure REST APIs, JWT authentication, RBAC, PostgreSQL database, and Redis caching for high performance.",
    live_url: "https://noteassistai.vercel.app",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/noteassisstai_homepage.png",
    featured_image: "/images/noteassistai.landingpage.jpeg",
    ai_summary: "A productivity platform that turns note creation, content improvement, and AI assistance into one smooth workflow.",
    overview: "NoteAssist AI is a full-stack productivity platform that combines intelligent note creation, content enhancement, and AI-powered writing assistance. Designed for professionals and students who need to capture, organize, and improve their knowledge fast.",
    problem: "Users needed to capture knowledge quickly while keeping content organized, searchable, and easy to export — without juggling multiple disconnected tools.",
    solution: "Engineered a secure, scalable Django backend with Redis caching for performance, combined with a fast React frontend. AI workflows handle note enhancement and content generation. Full RBAC ensures enterprise-grade data isolation.",
    outcome: "A production-grade productivity tool demonstrating strong backend architecture, AI integration, and clean UI design. Live and accessible for real users.",
    feature_bullets: ["AI note generation and content enhancement", "Secure JWT + RBAC authentication system", "PostgreSQL database with Redis caching layer", "RESTful API built with Django REST Framework", "Modular React frontend with fast navigation"],
    technologies: [{ name: "Django", slug: "django" }, { name: "DRF", slug: "drf" }, { name: "React.js", slug: "reactjs" }, { name: "PostgreSQL", slug: "postgresql" }, { name: "Redis", slug: "redis" }, { name: "JWT", slug: "jwt" }],
  },
  "feelwise-emotion-detection-system": {
    title: "FeelWise — Emotion Detection System",
    description: "Microservices-based AI system with FastAPI backend, Node.js API Gateway, and Chart.js visualization. Multi-modal emotion detection via text, speech, and facial analysis.",
    live_url: "https://feelwise-emotion-detection.feelwise.workers.dev",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/Feelwise_homepage.png",
    featured_image: "/images/feelwise-emotion-detection.landingpage.jpeg",
    ai_summary: "An emotion intelligence platform that blends visual dashboards, analysis tools, and a premium marketing presentation.",
    overview: "FeelWise is an AI-powered emotion detection system built on a microservices architecture. It analyzes emotions across text, speech, and facial inputs, delivering real-time insights through interactive Chart.js dashboards.",
    problem: "Presenting technically complex multi-modal emotion-detection in a way that feels approachable, visually clear, and trustworthy to both technical and non-technical stakeholders.",
    solution: "Designed a microservices architecture with FastAPI handling AI processing, a Node.js API Gateway for routing, and Cloudflare Workers for edge delivery. UI built around Chart.js for compelling real-time visualization.",
    outcome: "A technically impressive product that communicates product ambition, AI depth, and visual polish simultaneously. Successfully deployed to Cloudflare Workers for edge performance.",
    feature_bullets: ["Multi-modal emotion detection (text, speech, facial)", "Microservices architecture with FastAPI + Node.js gateway", "Real-time Chart.js visualization dashboards", "JWT authentication and secure data handling", "Edge deployment via Cloudflare Workers"],
    technologies: [{ name: "FastAPI", slug: "fastapi" }, { name: "Python", slug: "python" }, { name: "Node.js", slug: "nodejs" }, { name: "MongoDB", slug: "mongodb" }, { name: "JWT", slug: "jwt" }],
  },
  "advanced-restaurant-management-system": {
    title: "Advanced Restaurant Management System",
    description: "Desktop application for business operations with inventory management, order tracking, analytics dashboards, and modern UI/UX design.",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/RMS_homepage.png",
    featured_image: "/images/RMS_homepage.png",
    ai_summary: "A restaurant management system built to streamline staff workflows, order handling, and day-to-day operations.",
    overview: "A comprehensive desktop application for restaurant operations — from order management and inventory tracking to employee scheduling and analytics. Built with Python and PyQt5 for a fast, native feel.",
    problem: "Restaurant staff needed a fast, low-friction system for order handling, inventory tracking, and operational decisions during busy service periods.",
    solution: "Built a desktop application using Python, Django, and PyQt5 with an SQLite database backend. Focused on information density, fast navigation, and clear data presentation for operational use.",
    outcome: "A practical operations tool that reads as serious enterprise software. Covers the full restaurant workflow from order entry to analytics review.",
    feature_bullets: ["Order management with real-time table tracking", "Inventory and stock control system", "Employee scheduling and management screens", "Analytics dashboard with sales insights", "Offline-capable SQLite database backend"],
    technologies: [{ name: "Python", slug: "python" }, { name: "Django", slug: "django" }, { name: "PyQt5", slug: "pyqt5" }, { name: "SQLite", slug: "sqlite" }],
    detail_images: ["/images/RMS_homepage.png", "/images/RMS_Order_M.png", "/images/RMS_Emplyee_M.png"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildGallery(project: ProjectDetail): GalleryImage[] {
  const srcs: string[] = [];
  const seen = new Set<string>();

  const add = (src?: string | null) => {
    const url = src ? assetUrl(src) : null;
    if (url && !seen.has(url)) { seen.add(url); srcs.push(url); }
  };

  (project.detail_images ?? []).forEach(add);
  add(project.featured_image);
  add(project.preview_image);

  return srcs.map((src, i) => ({ src, alt: `${project.title} screenshot ${i + 1}` }));
}

function parseBullets(val?: string | string[]): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return val.split("\n").map(s => s.trim()).filter(Boolean);
}

// ─── Gallery component ────────────────────────────────────────────────────────
function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setActive(a => (a + 1) % images.length), 4200);
    return () => clearInterval(t);
  }, [images.length]);

  const prev = () => setActive(a => (a - 1 + images.length) % images.length);
  const next = () => setActive(a => (a + 1) % images.length);

  if (!images.length) return null;

  return (
    <div className="pd-gallery">
      {/* Main image track */}
      <div className="pd-gallery__track">
        {images.map((img, i) => (
          <div key={img.src} className={`pd-gallery__slide ${i === active ? "pd-gallery__slide--active" : ""}`}>
            <img src={img.src} alt={img.alt} className="pd-gallery__img" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}

        {/* Controls */}
        {images.length > 1 && (
          <>
            <button className="pd-gallery__btn pd-gallery__btn--prev" onClick={prev} aria-label="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button className="pd-gallery__btn pd-gallery__btn--next" onClick={next} aria-label="Next image">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="pd-gallery__counter">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="pd-gallery__dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`pd-gallery__dot ${i === active ? "pd-gallery__dot--active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View screenshot ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="pd-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={img.src}
              className={`pd-gallery__thumb ${i === active ? "pd-gallery__thumb--active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View screenshot ${i + 1}`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ProjectDetailPage({ slug }: { slug: string }) {
  const [project, setProject] = useState<ProjectDetail | null>(() => projectFallbacks[slug] ?? null);
  const [remoteStatus, setRemoteStatus] = useState<"loading" | "ready" | "error">("loading");
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;
    fetchJson<ProjectDetail>(`/api/v1/public/portfolio/projects/${slug}/`)
      .then(data => {
        if (!active) return;
        setProject(prev => ({ ...(prev ?? { slug, title: slug, description: "" }), ...data }));
        setRemoteStatus("ready");
        applySeo({
          title:           data.seo_title       ?? `${data.title} — Shahriyar Khan`,
          description:     data.seo_description ?? data.description,
          keywords:        data.seo_keywords,
          ogTitle:         data.og_title         ?? data.title,
          ogDescription:   data.og_description   ?? data.description,
          ogImage:         assetUrl(data.featured_image ?? data.preview_image),
          ogImageAlt:      data.image_alt_text   ?? data.title,
          canonicalUrl:    window.location.href,
        });
      })
      .catch(() => { if (!active) setRemoteStatus("error"); });
    return () => { active = false; };
  }, [slug, refreshKey]);

  const gallery  = useMemo(() => project ? buildGallery(project) : [], [project]);
  const bullets  = useMemo(() => parseBullets(project?.feature_bullets), [project]);
  const devHighs = useMemo(() => parseBullets(project?.development_highlights), [project]);
  const techs    = useMemo(() => project?.technologies ?? [], [project]);

  if (!project) {
    return (
      <div className="pd-loading">
        <Link to="/projects" className="pd-back-link"><ArrowLeft size={15} /> Back to Projects</Link>
        <p>Loading project details…</p>
      </div>
    );
  }

  return (
    <div className="pd-shell">
      {/* Background */}
      <div className="pd-bg" aria-hidden="true">
        <div className="pd-bg__orb pd-bg__orb--1" />
        <div className="pd-bg__orb pd-bg__orb--2" />
      </div>

      <div className="pd-container">
        {/* ── Back link ── */}
        <Link to="/projects" className="pd-back-link">
          <ArrowLeft size={15} /> Back to Projects
        </Link>

        {remoteStatus === "error" && (
          <div className="pd-fallback-notice">
            Live project data is unavailable — showing polished fallback case study.
          </div>
        )}

        {/* ══════ HERO HEADER ══════ */}
        <div className="pd-hero card surface-elevated">
          <div className="pd-hero__badges">
            <span className="pd-badge pd-badge--accent badge badge-primary">Case Study</span>
            {project.featured && <span className="pd-badge pd-badge--gold badge badge-warning"><Star size={10} /> Featured</span>}
            {project.live_url && <span className="pd-badge pd-badge--green badge badge-success"><Globe size={10} /> Live Product</span>}
          </div>

          <h1 className="pd-hero__title text-display-sm text-primary">{project.title}</h1>

          <p className="pd-hero__summary text-body text-tertiary">
            {project.ai_summary ?? project.description}
          </p>

          {/* Tech pills */}
          {techs.length > 0 && (
            <div className="pd-hero__techs">
              {techs.map(t => (
                <span key={t.slug} className="pd-tech-pill badge badge-primary">{t.name}</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="pd-hero__actions">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-md">
                <ExternalLink size={15} /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-md">
                <Github size={15} /> Source Code
              </a>
            )}
            <Link to="/projects" className="btn-ghost btn-md">
              All Projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ══════ MAIN CONTENT GRID ══════ */}
        <div className="pd-content-grid">
          {/* ── LEFT: Case study content ── */}
          <main className="pd-main-col">

            {/* Overview */}
            {project.overview && (
              <div className="pd-case-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary"><Layers size={13} /> Overview</div>
                <p className="pd-case-block__text text-body text-tertiary">{project.overview}</p>
              </div>
            )}

            {/* Problem */}
            {(project.problem ?? project.challenge) && (
              <div className="pd-case-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary">Challenge</div>
                <p className="pd-case-block__text text-body text-tertiary">{project.problem ?? project.challenge}</p>
              </div>
            )}

            {/* Solution */}
            {project.solution && (
              <div className="pd-case-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary">Solution</div>
                <p className="pd-case-block__text text-body text-tertiary">{project.solution}</p>
              </div>
            )}

            {/* Key Features */}
            {bullets.length > 0 && (
              <div className="pd-case-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary"><Code2 size={13} /> Key Features</div>
                <div className="pd-features-grid">
                  {bullets.map((b, i) => (
                    <div key={i} className="pd-feature-item text-body-sm text-tertiary">
                      <CheckCircle2 size={14} className="pd-feature-item__icon" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dev Highlights */}
            {devHighs.length > 0 && (
              <div className="pd-case-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary">Engineering Highlights</div>
                <ul className="pd-highlights-list">
                  {devHighs.map((h, i) => (
                    <li key={i} className="pd-highlights-list__item text-body-sm text-tertiary">
                      <span className="pd-highlights-list__dot" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {techs.length > 0 && (
              <div className="pd-case-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary">Technologies Used</div>
                <div className="pd-tech-grid">
                  {techs.map(t => (
                    <div key={t.slug} className="pd-tech-badge badge badge-primary">
                      <Code2 size={12} />
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outcome */}
            {project.outcome && (
              <div className="pd-outcome-block card surface-elevated">
                <div className="pd-case-block__label text-label-lg text-primary"><Star size={13} /> Outcome</div>
                <p className="pd-outcome-block__text text-body text-tertiary">{project.outcome}</p>
              </div>
            )}
          </main>

          {/* ── RIGHT: Gallery + Info sidebar ── */}
          <aside className="pd-sidebar">
            {/* Gallery */}
            <ProjectGallery images={gallery} />

            {/* Quick info card */}
            <div className="pd-info-card card surface-elevated">
              <h3 className="pd-info-card__title text-headline-sm text-primary">Project Info</h3>
              <div className="pd-info-card__rows">
                <div className="pd-info-card__row">
                  <span className="pd-info-card__label text-label text-hint">Status</span>
                  <span className="pd-info-card__value text-body-sm text-primary">{project.live_url ? "Live" : "Private"}</span>
                </div>
                <div className="pd-info-card__row">
                  <span className="pd-info-card__label text-label text-hint">Stack Size</span>
                  <span className="pd-info-card__value text-body-sm text-primary">{techs.length > 0 ? `${techs.length} technologies` : "—"}</span>
                </div>
                <div className="pd-info-card__row">
                  <span className="pd-info-card__label text-label text-hint">Type</span>
                  <span className="pd-info-card__value text-body-sm text-primary">{project.featured ? "Featured Project" : "Portfolio Project"}</span>
                </div>
                {project.live_url && (
                  <div className="pd-info-card__row">
                    <span className="pd-info-card__label">Demo</span>
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="pd-info-card__link">
                      View live <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* CTA card */}
            <div className="pd-cta-card card surface-elevated">
              <p className="pd-cta-card__heading text-headline-sm text-primary">Interested in this kind of work?</p>
              <p className="pd-cta-card__sub text-body-sm text-tertiary">I'm open to full-time opportunities and freelance projects.</p>
              <Link to="/contact" className="btn-primary btn-md" style={{ justifyContent: "center" }}>
                Hire Me <ArrowRight size={14} />
              </Link>
              <Link to="/services" className="btn-ghost btn-md" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
                View Services
              </Link>
            </div>
          </aside>
        </div>

        {/* ── Bottom nav ── */}
        <div className="pd-bottom-nav">
          <Link to="/projects" className="btn-secondary btn-md">
            <ArrowLeft size={14} /> All Projects
          </Link>
          <div className="pd-bottom-nav__right">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-md">
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-md">
                <Github size={14} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
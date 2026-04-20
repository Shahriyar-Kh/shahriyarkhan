import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { assetUrl, fetchJson } from "@/lib/api";
import { Link } from "@/lib/navigation";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

type ProjectDetail = {
  title: string;
  slug: string;
  description: string;
  live_url?: string;
  github_url?: string;
  preview_image?: string | null;
  featured_image?: string | null;
  ai_summary?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_title?: string;
  og_description?: string;
  image_alt_text?: string;
  featured?: boolean;
  technologies?: { name: string; slug: string }[];
};

type GalleryImage = {
  src: string;
  alt: string;
};

type CaseStudy = {
  overview: string;
  problem: string;
  featureBreakdown: string[];
  developmentHighlights: string[];
  outcome: string;
  gallery: string[];
};

type ProjectFallback = {
  title: string;
  description: string;
  live_url?: string;
  github_url?: string;
  preview_image?: string | null;
  featured_image?: string | null;
  ai_summary?: string;
  technologies?: { name: string; slug: string }[];
};

const projectFallbacks: Record<string, ProjectFallback> = {
  "sk-learntrack-ai-learning-platform": {
    title: "SK-LearnTrack — AI Learning Platform",
    description: "Full-stack LMS using Django REST Framework and React with JWT authentication, student progress tracking, and OpenAI-powered AI-assisted learning features.",
    live_url: "https://sk-learntrack.vercel.app",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/sk-learntrack_homepage.png",
    featured_image: "/images/sk-learntrack_homepage.png",
    ai_summary: "A focused learning platform that combines structured courses, AI support, and progress visibility in one clean experience.",
    technologies: [
      { name: "Django", slug: "django" },
      { name: "DRF", slug: "drf" },
      { name: "React", slug: "react" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "OpenAI", slug: "openai" },
    ],
  },
  "noteassist-ai-productivity-platform": {
    title: "NoteAssist-AI — Productivity Platform",
    description: "Full-stack application with secure REST APIs, JWT authentication, RBAC, PostgreSQL database, and Redis caching for high performance.",
    live_url: "https://noteassistai.vercel.app",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/noteassistai_homepage.png",
    featured_image: "/images/noteassistai_homepage.png",
    ai_summary: "A productivity platform that turns note creation, content improvement, and AI assistance into one smooth workflow.",
    technologies: [
      { name: "Django", slug: "django" },
      { name: "DRF", slug: "drf" },
      { name: "React.js", slug: "reactjs" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "Redis", slug: "redis" },
      { name: "JWT", slug: "jwt" },
    ],
  },
  "feelwise-emotion-detection-system": {
    title: "FeelWise — Emotion Detection System",
    description: "Microservices-based AI system with FastAPI backend, Node.js API Gateway, and Chart.js visualization. Multi-modal emotion detection via text, speech, and facial analysis.",
    live_url: "https://feelwise-emotion-detection.feelwise.workers.dev",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/Feelwise_homepage.png",
    featured_image: "/images/Feelwise_homepage.png",
    ai_summary: "An emotion intelligence platform that blends visual dashboards, analysis tools, and a premium marketing presentation.",
    technologies: [
      { name: "FastAPI", slug: "fastapi" },
      { name: "Python", slug: "python" },
      { name: "Node.js", slug: "nodejs" },
      { name: "MongoDB", slug: "mongodb" },
      { name: "JWT", slug: "jwt" },
    ],
  },
  "advanced-restaurant-management-system": {
    title: "Advanced Restaurant Management System",
    description: "Desktop application for business operations with inventory management, order tracking, analytics dashboards, and modern UI/UX design.",
    github_url: "https://github.com/Shahriyar-Kh",
    preview_image: "/images/RMS_homepage.png",
    featured_image: "/images/RMS_homepage.png",
    ai_summary: "A restaurant management system built to streamline staff workflows, order handling, and day-to-day operations.",
    technologies: [
      { name: "Python", slug: "python" },
      { name: "Django", slug: "django" },
      { name: "PyQt5", slug: "pyqt5" },
      { name: "SQLite", slug: "sqlite" },
    ],
  },
};

const caseStudyCopy: Record<string, CaseStudy> = {
  "sk-learntrack-ai-learning-platform": {
    overview: "A focused learning platform that combines structured courses, AI support, and progress visibility in one clean experience.",
    problem: "Learners needed a clearer path through study content, progress tracking, and fast AI help without bouncing between separate tools.",
    featureBreakdown: [
      "Guided learning journeys with structured progression",
      "AI-assisted study support for quick explanations and summaries",
      "Student dashboards for progress and activity review",
      "Authentication and data layers designed for scale",
    ],
    developmentHighlights: [
      "Built with Django REST Framework and React for a clean client/server split.",
      "Centered the UI around learning clarity rather than feature overload.",
      "Designed the system to stay flexible for future analytics and course expansion.",
      "Kept the interface recruiter-friendly with strong hierarchy and readable outcomes.",
    ],
    outcome: "The result is a polished learning product that feels guided, trustworthy, and ready for real-world student use.",
    gallery: ["/images/sk-learntrack_homepage.png", "/images/sk-learntrack.landinpage.jpeg"],
  },
  "noteassist-ai-productivity-platform": {
    overview: "A productivity platform that turns note creation, content improvement, and AI assistance into one smooth workflow.",
    problem: "The product needed to help users capture knowledge quickly while still keeping content organized, searchable, and easy to export.",
    featureBreakdown: [
      "AI note generation and enhancement workflows",
      "Structured productivity tools with fast navigation",
      "Secure access patterns and data-aware backend design",
      "Scalable interfaces for personal and team usage",
    ],
    developmentHighlights: [
      "Balanced dense functionality with a minimal, readable interface.",
      "Optimized the workflow for users who want to move from idea to output quickly.",
      "Integrated backend security patterns without visual clutter.",
      "Kept the design modular for future AI features and export flows.",
    ],
    outcome: "The page tells a stronger story of productivity and control instead of repeating the card summary.",
    gallery: ["/images/noteassisstai_homepage.png", "/images/noteassistai.landingpage.jpeg"],
  },
  "feelwise-emotion-detection-system": {
    overview: "An emotion intelligence platform that blends visual dashboards, analysis tools, and a premium marketing presentation.",
    problem: "The challenge was to present a technically complex emotion-detection product in a way that still felt approachable and high trust.",
    featureBreakdown: [
      "Emotion analysis across multiple inputs and pipelines",
      "Dashboard-driven storytelling for results and status",
      "AI-friendly layout that makes technical capability easy to scan",
      "Strong visual hierarchy for a more premium first impression",
    ],
    developmentHighlights: [
      "Used contrast, spacing, and motion to make a technical product feel polished.",
      "Structured the content to support both clients and technical reviewers.",
      "Kept the visual language modern without overwhelming the analysis story.",
      "Designed gallery presentation to communicate both product and brand quality.",
    ],
    outcome: "The case study now communicates product ambition, technical depth, and visual polish in one place.",
    gallery: ["/images/Feelwise_homepage.png", "/images/feelwise-emotion-detection.landingpage.jpeg"],
  },
  "advanced-restaurant-management-system": {
    overview: "A restaurant management system built to streamline staff workflows, order handling, and day-to-day operations.",
    problem: "The system needed to make operational work feel fast and readable for teams that rely on clear, low-friction interfaces.",
    featureBreakdown: [
      "Order handling and menu management flows",
      "Employee and operational management screens",
      "Strong table structures for fast decision making",
      "Practical desktop UI patterns for daily use",
    ],
    developmentHighlights: [
      "Focused on usability and information density rather than decoration.",
      "Kept the interface practical for operational work at a glance.",
      "Made business actions easy to scan during busy usage periods.",
      "Aligned the visual treatment with a professional internal tool.",
    ],
    outcome: "The project reads as a serious operations tool instead of a duplicated summary card.",
    gallery: ["/images/RMS_homepage.png", "/images/RMS_Order_M.png", "/images/RMS_Emplyee_M.png"],
  },
};

function dedupeGallery(images: GalleryImage[]) {
  const seen = new Set<string>();

  return images.filter((image) => {
    if (!image.src || seen.has(image.src)) {
      return false;
    }

    seen.add(image.src);
    return true;
  });
}

function buildCaseStudy(project: ProjectDetail): CaseStudy {
  const fallback = caseStudyCopy[project.slug];
  if (fallback) {
    return fallback;
  }

  const technologies = project.technologies?.map((technology) => technology.name) ?? [];
  const summary = project.ai_summary || project.description;

  return {
    overview: summary,
    problem: `This project was designed to solve a clear product need around ${project.title.toLowerCase()} while keeping the interface focused and easy to trust.`,
    featureBreakdown: [
      `Core workflow built around ${technologies[0] ?? "production-grade"} implementation`,
      `Designed to highlight the most important user actions first`,
      `Backed by the project's database and API structure`,
      `Shaped for mobile, desktop, and recruiter review`,
    ],
    developmentHighlights: [
      "The interface focuses on clarity, speed, and practical usability.",
      "The layout is structured to communicate technical quality quickly.",
      "The page uses concise sections so the project story reads cleanly.",
      "The visual treatment stays premium without losing depth or context.",
    ],
    outcome: `The case study now presents ${project.title} as a complete product story rather than a short summary card.`,
    gallery: [],
  };
}

function buildGalleryImages(project: ProjectDetail): GalleryImage[] {
  const caseStudy = buildCaseStudy(project);
  const images: GalleryImage[] = [];

  if (project.featured_image) {
    images.push({
      src: assetUrl(project.featured_image),
      alt: project.image_alt_text || `${project.title} featured view`,
    });
  }

  if (project.preview_image) {
    images.push({
      src: assetUrl(project.preview_image),
      alt: `${project.title} preview screenshot`,
    });
  }

  caseStudy.gallery.forEach((src, index) => {
    images.push({
      src,
      alt: `${project.title} gallery image ${index + 1}`,
    });
  });

  if (images.length === 0) {
    images.push({
      src: "/images/profile.png",
      alt: `${project.title} fallback presentation image`,
    });
  }

  return dedupeGallery(images);
}

function getFallbackProject(slug: string): ProjectDetail | null {
  const fallback = projectFallbacks[slug];
  if (!fallback) {
    return null;
  }

  return {
    slug,
    ...fallback,
  };
}

export function ProjectDetailPage({ slug }: { slug: string }) {
  const [project, setProject] = useState<ProjectDetail | null>(() => getFallbackProject(slug));
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const refreshKey = useLiveDataRefresh(12000);
  const [remoteStatus, setRemoteStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    fetchJson<ProjectDetail>(`/api/v1/public/portfolio/projects/${slug}/`)
      .then((data) => {
        if (!active) return;
        setProject((current) => ({
          ...(current ?? { slug }),
          ...data,
        }));
        setRemoteStatus("ready");
        applySeo({
          title: data.seo_title ?? `${data.title} — Shahriyar Khan`,
          description: data.seo_description ?? data.description,
          keywords: data.seo_keywords,
          ogTitle: data.og_title ?? data.title,
          ogDescription: data.og_description ?? data.description,
          ogImage: assetUrl(data.featured_image ?? data.preview_image),
          ogImageAlt: data.image_alt_text ?? data.title,
          canonicalUrl: window.location.href,
        });
      })
      .catch(() => {
        if (!active) return;
        setRemoteStatus("error");
        if (!projectFallbacks[slug]) {
          setProject(null);
        }
      });

    return () => {
      active = false;
    };
  }, [slug, refreshKey]);

  const caseStudy = useMemo(() => (project ? buildCaseStudy(project) : null), [project]);
  const galleryImages = useMemo(() => (project ? buildGalleryImages(project) : []), [project]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug]);

  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % galleryImages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [galleryImages.length]);

  if (!project || !caseStudy) {
    return (
      <section className="section-shell py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={16} /> Back to projects
          </Link>
          <div className="premium-card rounded-2xl p-8">
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {remoteStatus === "error" && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Live project data is unavailable right now, so a polished fallback case study is being shown instead.
          </div>
        )}

        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to projects
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] items-start">
          <article className="premium-card rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-pill">Case Study</span>
              {project.featured && <span className="skill-badge skill-badge--expert">Featured Project</span>}
              {project.live_url && <span className="skill-badge skill-badge--advanced">Live Product</span>}
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/80 font-semibold">Project Detail</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">{project.title}</h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{project.ai_summary ?? project.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoCard label="Stack" value={(project.technologies?.length ?? 0).toString()} note="technologies" />
              <InfoCard label="Focus" value="UX + API" note="balanced" />
              <InfoCard label="Status" value={project.live_url ? "Live" : "Private"} note="availability" />
              <InfoCard label="Type" value={project.featured ? "Featured" : "Project"} note="portfolio" />
            </div>

            <CaseSection title="Overview" text={caseStudy.overview} />
            <CaseSection title="Problem Solved" text={caseStudy.problem} />

            <section className="space-y-3">
              <SectionLabel title="Feature Breakdown" />
              <div className="grid gap-3 sm:grid-cols-2">
                {caseStudy.featureBreakdown.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <SectionLabel title="Development Highlights" />
              <ul className="grid gap-3">
                {caseStudy.developmentHighlights.map((item) => (
                  <li key={item} className="rounded-2xl border border-border/70 bg-background/20 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <SectionLabel title="Technologies Used" />
              <div className="flex flex-wrap gap-2">
                {(project.technologies ?? []).map((technology) => (
                  <span key={technology.slug} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {technology.name}
                  </span>
                ))}
                {(project.technologies?.length ?? 0) === 0 && (
                  <span className="text-sm text-muted-foreground">No technologies were published for this project yet.</span>
                )}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors">
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <Github size={14} /> Source Code
                </a>
              )}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="project-gallery-shell rounded-3xl p-4 sm:p-5">
              <div className="project-gallery-track aspect-4/3 sm:aspect-16/11">
                {galleryImages.map((image, index) => (
                  <div key={`${image.src}-${index}`} className={`project-gallery-slide ${index === activeImageIndex ? "is-active" : ""}`}>
                    <img src={image.src} alt={image.alt} className="h-full w-full object-cover object-top" loading={index === 0 ? "eager" : "lazy"} />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{activeImageIndex + 1} / {galleryImages.length || 1}</span>
                <span>Auto-looping project gallery</span>
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image.src}-dot-${index}`}
                    type="button"
                    className={`project-gallery-indicator ${index === activeImageIndex ? "is-active" : ""}`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View gallery image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="premium-card rounded-3xl p-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/80 font-semibold">Outcome</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{caseStudy.outcome}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-secondary/30 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</p>
      <p className="mt-1 text-base font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <p className="text-xs uppercase tracking-[0.22em] text-primary/80 font-semibold">{title}</p>;
}

function CaseSection({ title, text }: { title: string; text: string }) {
  return (
    <section className="space-y-3">
      <SectionLabel title={title} />
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{text}</p>
    </section>
  );
}
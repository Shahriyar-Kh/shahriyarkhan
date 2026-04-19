import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { ExternalLink, Github, Monitor } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { assetUrl, fetchJson, fetchListJson } from "@/lib/api";
import { Link } from "@/lib/navigation";

const projects: ProjectApi[] = [
  {
    id: 1,
    slug: "sk-learntrack-ai-learning-platform",
    title: "SK-LearnTrack — AI Learning Platform",
    description: "Full-stack LMS using Django REST Framework and React with JWT authentication, student progress tracking, and OpenAI-powered AI-assisted learning features.",
    tools: ["Django", "DRF", "React", "PostgreSQL", "OpenAI"],
    live: "https://sk-learntrack.vercel.app",
    github: "https://github.com/Shahriyar-Kh",
  },
  {
    id: 2,
    slug: "noteassist-ai-productivity-platform",
    title: "NoteAssist-AI — Productivity Platform",
    description: "Full-stack application with secure REST APIs, JWT authentication, RBAC, PostgreSQL database, and Redis caching for high performance.",
    tools: ["Django", "DRF", "React.js", "PostgreSQL", "Redis", "JWT"],
    live: "https://noteassistai.vercel.app",
    github: "https://github.com/Shahriyar-Kh",
  },
  {
    id: 3,
    slug: "feelwise-emotion-detection-system",
    title: "FeelWise — Emotion Detection System",
    description: "Microservices-based AI system with FastAPI backend, Node.js API Gateway, and Chart.js visualization. Multi-modal emotion detection via text, speech, and facial analysis.",
    tools: ["FastAPI", "Python", "Node.js", "MongoDB", "JWT"],
    live: "https://feelwise-emotion-detection.feelwise.workers.dev",
    github: "https://github.com/Shahriyar-Kh",
  },
  {
    id: 4,
    slug: "advanced-restaurant-management-system",
    title: "Advanced Restaurant Management System",
    description: "Desktop application for business operations with inventory management, order tracking, analytics dashboards, and modern UI/UX design.",
    tools: ["Python", "Django", "PyQt5", "SQLite"],
    live: null,
    github: "https://github.com/Shahriyar-Kh",
  },
];

type ProjectApi = {
  id: number;
  title: string;
  slug: string;
  description: string;
  live_url?: string;
  github_url?: string;
  preview_image?: string | null;
  featured_image?: string | null;
  technologies?: { id: number; name: string; slug: string }[];
  featured?: boolean;
  tools?: string[];
  live?: string | null;
  github?: string;
};

function normalizeProjectData(projects: ProjectApi[]): ProjectApi[] {
  return projects.map((project) => ({
    ...project,
    live: project.live || project.live_url || null,
    github: project.github || project.github_url,
  }));
}

function LivePreviewPanel({ url, isVisible }: { url: string; isVisible: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const posRef = useRef(0);
  const phaseRef = useRef<"scrolling" | "resetting">("scrolling");
  const pauseUntilRef = useRef(0);
  const SCROLL_SPEED = 3.4;
  const FOOTER_STOP_RATIO = 0.86;

  useEffect(() => {
    if (!isVisible) {
      cancelAnimationFrame(animFrameRef.current);
      posRef.current = 0;
      phaseRef.current = "scrolling";
      pauseUntilRef.current = 0;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      return;
    }

    const tick = (now: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      const stopAt = maxScroll * FOOTER_STOP_RATIO;

      if (now < pauseUntilRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (phaseRef.current === "resetting") {
        posRef.current = 0;
        el.scrollTop = 0;
        phaseRef.current = "scrolling";
        pauseUntilRef.current = now + 520;
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      let next = posRef.current + SCROLL_SPEED;
      if (next >= stopAt) {
        next = stopAt;
        phaseRef.current = "resetting";
        pauseUntilRef.current = now + 900;
      }

      posRef.current = next;
      el.scrollTop = posRef.current;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    const timeout = window.setTimeout(() => {
      pauseUntilRef.current = performance.now() + 180;
      animFrameRef.current = requestAnimationFrame(tick);
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible]);

  return (
    <div className="project-preview-panel" style={{ pointerEvents: "none" }}>
      <div ref={scrollRef} style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
        <iframe
          src={url}
          title="Live preview"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: "240%",
            height: "1400%",
            transform: "scale(0.4167)",
            transformOrigin: "top left",
            border: "none",
            pointerEvents: "none",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 280ms ease",
          }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: ProjectApi; index: number }) {
  const [hovered, setHovered] = useState(false);
  const liveUrl = project.live || project.live_url;
  const githubUrl = project.github || project.github_url;
  const tools = project.technologies?.length
    ? project.technologies.map((tool) => tool.name)
    : project.tools ?? [];

  return (
    <article
      className="premium-card rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] reveal-in tilt-hover"
      style={{ animationDelay: `${index * 0.1}s` }}
      aria-label={`Project: ${project.title}`}
    >
      <div>
        <div
          className="project-preview-stage relative mb-5 overflow-hidden rounded-xl border border-border/70 bg-linear-to-r from-primary/12 via-accent/10 to-primary/8 h-52 md:h-64 group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {project.preview_image ? (
            <img
              src={assetUrl(project.preview_image)}
              alt={`Screenshot of ${project.title}`}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `linear-gradient(oklch(0.68 0.195 224 / 15%) 1px, transparent 1px),
                    linear-gradient(90deg, oklch(0.68 0.195 224 / 15%) 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Monitor size={32} className="text-primary/60" />
                <p className="text-xs font-semibold text-primary/80 tracking-widest uppercase">
                  {liveUrl ? "Hover to Preview" : "Local Project"}
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-primary/15 blur-2xl" />
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-accent/12 blur-2xl" />
            </>
          )}

          {liveUrl && hovered && <LivePreviewPanel url={liveUrl} isVisible={hovered} />}

          {liveUrl && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-background/80 border border-accent/30 px-2.5 py-1 text-[10px] font-bold text-accent backdrop-blur-md tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-foreground mb-2 leading-snug">{project.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {tools.map((tool) => (
            <span
              key={tool}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 tracking-wide"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-3.5 border-t border-border/70">
        {project.slug && (
          <Link
            to={`/projects/${project.slug}`}
            className="text-xs font-semibold text-accent hover:text-primary transition-colors uppercase tracking-wider"
          >
            Case Study →
          </Link>
        )}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent transition-colors"
            aria-label={`Live demo of ${project.title}`}
          >
            <ExternalLink size={13} /> Live Demo
          </a>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
            aria-label={`GitHub source for ${project.title}`}
          >
            <Github size={13} /> Source
          </a>
        )}
      </div>
    </article>
  );
}

export function ProjectsPage() {
  const [projectsData, setProjectsData] = useState<ProjectApi[]>([]);
  const [backendEmpty, setBackendEmpty] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchListJson<ProjectApi>("/api/v1/public/portfolio/projects/"),
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string }>("/api/v1/public/seo/pages/projects/"),
    ]).then(([projectsResult, seoResult]) => {
      if (!active) return;

      if (projectsResult.status === "fulfilled" && projectsResult.value.length) {
        setProjectsData(normalizeProjectData(projectsResult.value));
        setBackendEmpty(false);
      } else if (projectsResult.status === "fulfilled") {
        setBackendEmpty(true);
      }

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Projects — Shahriyar Khan | Portfolio",
        description: seo?.meta_description ?? "Explore projects by Shahriyar Khan (Shary), including AI platforms, full-stack systems, and scalable backend solutions built with Python, Django, and FastAPI.",
        keywords: seo?.keywords ?? "Shahriyar projects, Python projects, Django projects, backend portfolio, software engineer projects",
        ogTitle: seo?.og_title ?? "Projects — Shahriyar Khan",
        ogDescription: seo?.og_description ?? "Real-world portfolio projects showcasing Python, Django, FastAPI, React, and production-ready architecture.",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const displayProjects = projectsData.length > 0 ? projectsData : projects;

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Projects" subtitle="Real-world applications I've built" />

        {backendEmpty && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            No published projects are available in Django admin yet, so sample projects are being shown.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayProjects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

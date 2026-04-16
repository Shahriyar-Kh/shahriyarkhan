import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { ExternalLink, Github } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { assetUrl, fetchJson, fetchListJson } from "@/lib/api";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Shahriyar Khan | Portfolio" },
      { name: "description", content: "Explore projects by Shahriyar Khan (Shary), including AI platforms, full-stack systems, and scalable backend solutions built with Python, Django, and FastAPI." },
      { name: "keywords", content: "Shahriyar projects, Python projects, Django projects, backend portfolio, software engineer projects" },
      { property: "og:title", content: "Projects — Shahriyar Khan" },
      { property: "og:description", content: "Real-world portfolio projects showcasing Python, Django, FastAPI, React, and production-ready architecture." },
      { property: "og:image", content: "/images/profile.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Projects — Shahriyar Khan" },
      { name: "twitter:description", content: "Modern full-stack and backend projects by Shahriyar Khan." },
    ],
  }),
  component: ProjectsPage,
});

const projects = [
  {
    title: "SK-LearnTrack — AI Learning Platform",
    description: "Full-stack LMS using Django REST Framework and React with JWT authentication, student progress tracking, and OpenAI-powered AI-assisted learning features.",
    tools: ["Django", "DRF", "React", "PostgreSQL", "OpenAI"],
    live: "https://sk-learntrack.vercel.app",
    github: "https://github.com/Shahriyar-Kh",
  },
  {
    title: "NoteAssist-AI — Productivity Platform",
    description: "Full-stack application with secure REST APIs, JWT authentication, RBAC, PostgreSQL database, and Redis caching for high performance.",
    tools: ["Django", "DRF", "React.js", "PostgreSQL", "Redis", "JWT"],
    live: "https://noteassistai.vercel.app",
    github: "https://github.com/Shahriyar-Kh",
  },
  {
    title: "FeelWise — Emotion Detection System",
    description: "Microservices-based AI system with FastAPI backend, Node.js API Gateway, and Chart.js visualization. Multi-modal emotion detection via text, speech, and facial analysis.",
    tools: ["FastAPI", "Python", "Node.js", "MongoDB", "JWT"],
    live: "https://feelwise-emotion-detection.feelwise.workers.dev",
    github: "https://github.com/Shahriyar-Kh",
  },
  {
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

function ProjectsPage() {
  const [projectsData, setProjectsData] = useState<ProjectApi[]>([]);
  const [backendAttempted, setBackendAttempted] = useState(false);
  const [backendEmpty, setBackendEmpty] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchListJson<ProjectApi>("/api/v1/public/portfolio/projects/"),
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string }>("/api/v1/public/seo/pages/projects/"),
    ]).then(([projectsResult, seoResult]) => {
      if (!active) return;

      setBackendAttempted(true);
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
            <div
              key={project.title}
              className="premium-card rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] reveal-in tilt-hover"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div>
                <div className="relative mb-5 overflow-hidden rounded-xl border border-border/70 bg-linear-to-r from-primary/12 via-accent/10 to-primary/8 p-4">
                  <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 15% 20%, rgba(86,157,255,0.28), transparent 35%)" }} />
                  {project.preview_image ? (
                    <img src={assetUrl(project.preview_image)} alt={project.title} className="relative h-32 w-full rounded-lg object-cover" />
                  ) : (
                    <>
                      <p className="relative text-[11px] uppercase tracking-[0.2em] text-primary/90 font-semibold">Portfolio Preview</p>
                      <p className="relative mt-1 text-sm text-foreground font-semibold">{project.title}</p>
                    </>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {(project.technologies?.length ? project.technologies.map((tool) => tool.name) : project.tools).map((tool) => (
                    <span key={tool} className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-border/80">
                {project.slug && (
                  <Link to={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-primary transition-colors">
                    View Details
                  </Link>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors">
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
                <a href={project.github ?? project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Github size={14} /> Source Code
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

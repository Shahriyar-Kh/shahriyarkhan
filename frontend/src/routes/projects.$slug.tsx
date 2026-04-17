import { useEffect, useState } from "react";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { assetUrl, fetchJson } from "@/lib/api";
import { Link } from "@/lib/navigation";

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
  technologies?: { name: string; slug: string }[];
};

export function ProjectDetailPage({ slug }: { slug: string }) {
  const [project, setProject] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    let active = true;

    fetchJson<ProjectDetail>(`/api/v1/public/portfolio/projects/${slug}/`)
      .then((data) => {
        if (!active) return;
        setProject(data);
        applySeo({
          title: data.seo_title ?? `${data.title} — Shahriyar Khan`,
          description: data.seo_description ?? data.description,
          keywords: data.seo_keywords,
          ogTitle: data.og_title ?? data.title,
          ogDescription: data.og_description ?? data.description,
          ogImage: assetUrl(data.featured_image ?? data.preview_image),
          ogImageAlt: data.image_alt_text ?? data.title,
        });
      })
      .catch(() => {
        if (active) setProject(null);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (!project) {
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to projects
        </Link>

        <div className="premium-card rounded-2xl overflow-hidden">
          {project.featured_image || project.preview_image ? (
            <img src={assetUrl(project.featured_image ?? project.preview_image)} alt={project.image_alt_text ?? project.title} className="h-72 w-full object-cover" />
          ) : (
            <div className="h-72 bg-linear-to-br from-primary/10 to-accent/10" />
          )}
          <div className="p-8 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">Project Detail</p>
              <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed">{project.ai_summary ?? project.description}</p>
            <div className="flex flex-wrap gap-2">
              {(project.technologies ?? []).map((technology) => (
                <span key={technology.slug} className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {technology.name}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors">
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Github size={14} /> Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
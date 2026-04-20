import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { applySeo } from "@/lib/seo";
import { fetchJson, fetchListJson } from "@/lib/api";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

interface SkillCategory {
  title: string;
  slug: string;
  order: number;
  skills: { name: string; level: number }[];
}

type SkillApi = {
  id: number;
  name: string;
  level: number;
  category: { id: number; name: string; slug: string };
  display_order: number;
  published: boolean;
};

const fallbackCategories: SkillCategory[] = [
  {
    title: "Frontend",
    slug: "frontend",
    order: 1,
    skills: [
      { name: "HTML", level: 95 },
      { name: "CSS", level: 93 },
      { name: "JavaScript", level: 88 },
      { name: "React.js", level: 82 },
      { name: "Tailwind CSS", level: 80 },
    ],
  },
  {
    title: "Backend",
    slug: "backend",
    order: 2,
    skills: [
      { name: "Python", level: 90 },
      { name: "Django / DRF", level: 88 },
      { name: "FastAPI", level: 75 },
      { name: "REST APIs", level: 90 },
      { name: "JWT / RBAC", level: 85 },
    ],
  },
  {
    title: "Database",
    slug: "database",
    order: 3,
    skills: [
      { name: "PostgreSQL", level: 85 },
      { name: "MongoDB", level: 70 },
      { name: "MySQL", level: 75 },
      { name: "Redis", level: 65 },
    ],
  },
  {
    title: "Tools",
    slug: "tools",
    order: 4,
    skills: [
      { name: "Git / GitHub", level: 90 },
      { name: "Postman", level: 88 },
      { name: "Docker", level: 50 },
      { name: "API Testing", level: 86 },
      { name: "GitHub Actions", level: 70 },
    ],
  },
  {
    title: "Deployment",
    slug: "deployment",
    order: 5,
    skills: [
      { name: "Render", level: 85 },
      { name: "Vercel", level: 84 },
      { name: "Cloudflare", level: 78 },
      { name: "Supabase", level: 74 },
    ],
  },
  {
    title: "AI & ML",
    slug: "ai-ml",
    order: 6,
    skills: [
      { name: "OpenAI API", level: 70 },
      { name: "Groq", level: 60 },
      { name: "Machine Learning", level: 55 },
    ],
  },
];

function normalizeLevel(level: number) {
  if (level <= 4) {
    return level * 25;
  }

  return Math.max(0, Math.min(level, 100));
}

function getSkillTone(level: number) {
  const normalized = normalizeLevel(level);

  if (normalized < 35) return "beginner";
  if (normalized < 60) return "intermediate";
  if (normalized < 85) return "advanced";
  return "expert";
}

function categoryOrder(category: { slug: string; display_order?: number; name: string }) {
  const priority: Record<string, number> = {
    frontend: 1,
    backend: 2,
    database: 3,
    databases: 3,
    tools: 4,
    "tools-devops": 4,
    deployment: 5,
    "ai-ml": 6,
  };

  return category.display_order && category.display_order > 0
    ? category.display_order
    : priority[category.slug] ?? 99;
}

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const tone = getSkillTone(level);
  const normalizedLevel = normalizeLevel(level);

  return (
    <div ref={ref} className="space-y-1.5" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-muted-foreground">{normalizedLevel}%</span>
      </div>
      <div className={`skill-bar skill-bar--${tone}`}>
        <div className="skill-bar-fill" style={{ width: isVisible ? `${normalizedLevel}%` : "0%" }} />
      </div>
    </div>
  );
}

export function SkillsPage() {
  const [skillsData, setSkillsData] = useState<SkillApi[]>([]);
  const [backendEmpty, setBackendEmpty] = useState(false);
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchListJson<SkillApi>("/api/v1/public/portfolio/skills/"),
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string }>("/api/v1/public/seo/pages/skills/"),
    ]).then(([skillsResult, seoResult]) => {
      if (!active) return;

      if (skillsResult.status === "fulfilled") {
        setSkillsData(skillsResult.value);
        setBackendEmpty(skillsResult.value.length === 0);
      }

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Skills — Shahriyar Khan | Technical Expertise",
        description: seo?.meta_description ?? "Technical skills of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, React, and scalable backend development.",
        keywords: seo?.keywords ?? "Shahriyar skills, Python Developer, Django Developer, Backend Developer, Junior Full Stack Developer",
        ogTitle: seo?.og_title ?? "Skills — Shahriyar Khan",
        ogDescription: seo?.og_description ?? "Frontend, Backend, Database, Tools, and Deployment expertise.",
      });
    });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const categories = useMemo<SkillCategory[]>(() => {
    if (skillsData.length > 0) {
      const grouped = new Map<string, SkillCategory & { skills: { name: string; level: number; order: number }[] }>();

      skillsData
        .filter((skill) => skill.published)
        .sort((left, right) => {
          const categoryRank = categoryOrder(left.category) - categoryOrder(right.category);
          if (categoryRank !== 0) return categoryRank;

          if (left.category.name !== right.category.name) {
            return left.category.name.localeCompare(right.category.name);
          }

          if (left.display_order !== right.display_order) {
            return left.display_order - right.display_order;
          }

          return left.name.localeCompare(right.name);
        })
        .forEach((skill) => {
          const existing = grouped.get(skill.category.slug);
          const normalizedLevel = normalizeLevel(skill.level);
          const skillOrder = skill.display_order;

          if (existing) {
            existing.skills.push({ name: skill.name, level: normalizedLevel, order: skillOrder });
            return;
          }

          grouped.set(skill.category.slug, {
            title: skill.category.name,
            slug: skill.category.slug,
            order: categoryOrder(skill.category),
            skills: [{ name: skill.name, level: normalizedLevel, order: skillOrder }],
          });
        });

      return Array.from(grouped.values())
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
        .map((category) => ({
          title: category.title,
          slug: category.slug,
          order: category.order,
          skills: category.skills
            .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name))
            .map((skill) => ({ name: skill.name, level: skill.level })),
        }));
    }

    return fallbackCategories
      .slice()
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
  }, [skillsData]);

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Technical Skills" subtitle="Technologies and tools I work with" />

        {backendEmpty && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            No published skills are available in Django admin yet, so sample skill groups are being shown.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.slug} className="premium-card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/80 font-semibold mb-2">Skill Category</p>
                  <h3 className="text-lg font-bold text-foreground">{cat.title}</h3>
                </div>
                <span className="skill-badge skill-badge--intermediate">{cat.skills.length} skills</span>
              </div>
              <div className="space-y-4">
                {cat.skills.map((skill, i) => (
                  <SkillBar key={skill.name} name={skill.name} level={skill.level} delay={i * 100} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

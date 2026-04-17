import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { applySeo } from "@/lib/seo";
import { fetchJson, fetchListJson } from "@/lib/api";

interface SkillCategory {
  title: string;
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
    title: "Backend",
    skills: [
      { name: "Python", level: 90 },
      { name: "Django / DRF", level: 88 },
      { name: "FastAPI", level: 75 },
      { name: "REST APIs", level: 90 },
      { name: "JWT / RBAC", level: 85 },
    ],
  },
  {
    title: "Frontend",
    skills: [
      { name: "React.js", level: 75 },
      { name: "JavaScript", level: 78 },
      { name: "HTML5 / CSS3", level: 85 },
      { name: "Bootstrap", level: 80 },
      { name: "Tailwind CSS", level: 70 },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "PostgreSQL", level: 85 },
      { name: "MongoDB", level: 70 },
      { name: "MySQL", level: 75 },
      { name: "Redis", level: 65 },
    ],
  },
  {
    title: "Tools & DevOps",
    skills: [
      { name: "Git / GitHub", level: 90 },
      { name: "Postman", level: 88 },
      { name: "Docker", level: 50 },
      { name: "Render / Vercel", level: 85 },
      { name: "Supabase / Cloudflare", level: 75 },
    ],
  },
  {
    title: "AI & ML",
    skills: [
      { name: "OpenAI API", level: 70 },
      { name: "Groq", level: 60 },
      { name: "Machine Learning", level: 55 },
    ],
  },
];

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <div ref={ref} className="space-y-1.5" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-muted-foreground">{level}%</span>
      </div>
      <div className="skill-bar h-2">
        <div className="skill-bar-fill" style={{ width: isVisible ? `${level}%` : "0%" }} />
      </div>
    </div>
  );
}

export function SkillsPage() {
  const [skillsData, setSkillsData] = useState<SkillApi[]>([]);
  const [backendEmpty, setBackendEmpty] = useState(false);

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
  }, []);

  const categories = useMemo<SkillCategory[]>(() => {
    // Always use backend data if available (even after attempted)
    if (skillsData.length > 0) {
      const grouped = new Map<string, SkillCategory>();

      skillsData
        .filter((skill) => skill.published)
        .sort((left, right) => left.display_order - right.display_order)
        .forEach((skill) => {
          const categoryTitle = skill.category.name;
          const normalizedLevel = skill.level <= 4 ? skill.level * 25 : skill.level;
          const existing = grouped.get(categoryTitle);

          if (existing) {
            existing.skills.push({ name: skill.name, level: normalizedLevel });
            return;
          }

          grouped.set(categoryTitle, {
            title: categoryTitle,
            skills: [{ name: skill.name, level: normalizedLevel }],
          });
        });

      return Array.from(grouped.values());
    }

    // Return fallback categories if no backend data
    return fallbackCategories;
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.title} className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-5 gradient-text">{cat.title}</h3>
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

import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — Shahriyar Khan | Technical Expertise" },
      { name: "description", content: "Technical skills of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, React, and scalable backend development." },
      { name: "keywords", content: "Shahriyar skills, Python Developer, Django Developer, Backend Developer, Junior Full Stack Developer" },
      { property: "og:title", content: "Skills — Shahriyar Khan" },
      { property: "og:description", content: "Frontend, Backend, Database, Tools, and Deployment expertise." },
      { property: "og:image", content: "/images/profile.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Skills — Shahriyar Khan" },
      { name: "twitter:description", content: "Explore technical expertise in Python, Django, FastAPI, and modern web development." },
    ],
  }),
  component: SkillsPage,
});

interface SkillCategory {
  title: string;
  skills: { name: string; level: number }[];
}

const categories: SkillCategory[] = [
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
        <div
          className="skill-bar-fill"
          style={{ width: isVisible ? `${level}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function SkillsPage() {
  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Technical Skills" subtitle="Technologies and tools I work with" />

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

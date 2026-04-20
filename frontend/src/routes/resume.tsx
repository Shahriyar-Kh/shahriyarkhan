import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { Download, FileText } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { fetchJson } from "@/lib/api";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

export function ResumePage() {
  const [resume, setResume] = useState<ResumeApi | null>(null);
  const [backendEmpty, setBackendEmpty] = useState(false);
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchJson<ResumeApi>("/api/v1/public/resume/default/"),
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string }>("/api/v1/public/seo/pages/resume/"),
    ]).then(([resumeResult, seoResult]) => {
      if (!active) return;

      if (resumeResult.status === "fulfilled") {
        setResume(resumeResult.value);
        setBackendEmpty(!resumeResult.value);
      }

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Resume — Shahriyar Khan | Software Engineer CV",
        description: seo?.meta_description ?? "Download Shahriyar Khan's ATS-optimized resume. Software Engineer, Python Developer, Django Developer, and Backend Developer.",
        keywords: seo?.keywords ?? "Shahriyar resume, software engineer CV, python developer resume, django developer resume",
        ogTitle: seo?.og_title ?? "Resume — Shahriyar Khan",
        ogDescription: seo?.og_description ?? "ATS-friendly CV of a Python & Django developer.",
      });
    });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const experienceItems = resume?.experiences ?? [];
  const skillGroups = useMemo(() => {
    if (!resume?.skills?.length) {
      return {
        Backend: ["Python", "Django", "DRF", "FastAPI"],
        Frontend: ["React.js", "JavaScript", "HTML5", "CSS3"],
        Databases: ["PostgreSQL", "MongoDB", "MySQL", "Redis"],
        Tools: ["Git", "GitHub", "Postman", "Docker"],
        Deployment: ["Render", "Vercel", "Supabase", "Cloudflare"],
        AI: ["OpenAI API", "Groq", "Machine Learning"],
      };
    }

    return resume.skills.reduce<Record<string, string[]>>((groups, skill) => {
      const category = skill.category?.name ?? "Skills";
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill.name);
      return groups;
    }, {});
  }, [resume]);

  const educationItems = resume?.education ?? [];

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Resume / CV" subtitle="ATS-optimized professional resume" />

        {backendEmpty && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            No published resume version is set as default in Django admin yet, so a local sample resume is being shown.
          </div>
        )}

        {/* Download Button */}
        <div className="flex justify-center mb-12">
          <a
            href="/resume/Shahriyar_Khan_Software_Engineer.pdf"
            download
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Download size={18} /> Download Resume (PDF)
          </a>
        </div>

        {/* Inline Resume Preview */}
        <div className="premium-card rounded-xl p-8 sm:p-10 space-y-8">
          <div className="text-center border-b border-border pb-6">
            <h2 className="text-2xl font-bold text-foreground">{resume?.title?.toUpperCase() ?? "SHAHRIYAR KHAN"}</h2>
            <p className="text-primary font-medium mt-1">{resume?.target_role ?? "Software Engineer | Python • Django • FastAPI"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Islamabad, Pakistan • shahriyarkhanpk1@gmail.com • +92 311 0924560
            </p>
            <p className="text-sm text-muted-foreground">
              linkedin.com/in/shahriyarkhan786 • github.com/Shahriyar-Kh
            </p>
          </div>

          <ResumeSection title="Summary">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {resume?.custom_summary ?? "Software Engineer with experience designing and developing scalable web applications and backend systems using Python, Django, and FastAPI. Strong understanding of SDLC, system design, and API-driven architectures. Experienced in building production-ready systems, integrating AI-powered features, and delivering reliable solutions in agile environments."}
            </p>
          </ResumeSection>

          <ResumeSection title="Experience">
            {experienceItems.length ? experienceItems.map((experience) => (
              <ExperienceItem
                key={`${experience.company_name}-${experience.role_title}`}
                title={experience.role_title}
                company={experience.company_name}
                period={`${experience.start_date}${experience.end_date ? ` — ${experience.end_date}` : experience.current_role ? " — Present" : ""}`}
                location={experience.location || "Remote"}
                points={experience.achievements?.length ? experience.achievements : [experience.description]}
              />
            )) : (
              <>
                <ExperienceItem
                  title="Software Developer"
                  company="HA Technologies (Pvt) Ltd"
                  period="June 2025 — Present"
                  location="Islamabad"
                  points={[
                    "Developed scalable full-stack web applications using Django, DRF, FastAPI, and React.js",
                    "Designed secure backend architectures with JWT authentication and RBAC",
                    "Implemented PostgreSQL, MongoDB, and Redis for data and caching",
                    "Integrated AI-powered modules for intelligent application features",
                    "Deployed applications using Render and Vercel in agile environments",
                  ]}
                />
                <ExperienceItem
                  title="Python Developer Intern"
                  company="CodeAlpha"
                  period="Feb 2025 — May 2025"
                  location="Remote"
                  points={[
                    "Developed desktop applications using Python, PyQt5, and Tkinter",
                    "Implemented event-driven architecture and API integrations",
                  ]}
                />
                <ExperienceItem
                  title="Web Developer Intern (Team Lead)"
                  company="Abasyn University Incubation Center"
                  period="Sep 2024 — Feb 2025"
                  location="Peshawar"
                  points={[
                    "Built full-stack applications using Django, PyQt5, and REST APIs",
                    "Led development team and managed task execution",
                  ]}
                />
              </>
            )}
          </ResumeSection>

          <ResumeSection title="Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {Object.entries(skillGroups)
                .sort(([left], [right]) => {
                  const categoryOrder: Record<string, number> = {
                    Frontend: 1,
                    Backend: 2,
                    Database: 3,
                    Databases: 3,
                    Tools: 4,
                    "Tools & DevOps": 4,
                    Deployment: 5,
                    "AI & ML": 6,
                  };

                  return (categoryOrder[left] ?? 99) - (categoryOrder[right] ?? 99) || left.localeCompare(right);
                })
                .map(([category, items]) => (
                <p key={category}><span className="text-foreground font-medium">{category}:</span> {items.join(", ")}</p>
              ))}
            </div>
          </ResumeSection>

          <ResumeSection title="Education">
            {educationItems.length ? educationItems.map((education) => (
              <div key={`${education.institution}-${education.degree}`} className="mb-3 last:mb-0">
                <p className="text-sm text-foreground font-medium">{education.degree} — {education.institution}</p>
                <p className="text-sm text-muted-foreground">
                  {education.start_date} {education.end_date ? `• ${education.end_date}` : ""}
                </p>
                {education.description && <p className="text-sm text-muted-foreground mt-1">{education.description}</p>}
              </div>
            )) : (
              <>
                <p className="text-sm text-foreground font-medium">BS Software Engineering — Abasyn University, Peshawar</p>
                <p className="text-sm text-muted-foreground">Graduated 2025 • CGPA 3.67</p>
              </>
            )}
          </ResumeSection>

          {resume?.projects?.length ? (
            <ResumeSection title="Featured Projects">
              <ul className="text-sm text-muted-foreground space-y-1">
                {resume.projects.slice(0, 4).map((project) => (
                  <li key={project.slug}>• {project.title} — {project.description}</li>
                ))}
              </ul>
            </ResumeSection>
          ) : null}

          <ResumeSection title="Certifications">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Programming for Everybody (Python) — Coursera</li>
              <li>• Front-End Development — Coursera</li>
              <li>• Advanced React — Coursera</li>
              <li>• HTML and CSS in Depth — Coursera</li>
              <li>• Version Control — Coursera</li>
            </ul>
          </ResumeSection>
        </div>
      </div>
    </section>
  );
}

type ResumeApi = {
  id: number;
  title: string;
  slug: string;
  target_role?: string;
  custom_summary?: string;
  projects?: { title: string; slug: string; description: string }[];
  experiences?: {
    company_name: string;
    role_title: string;
    start_date: string;
    end_date?: string | null;
    current_role?: boolean;
    location?: string;
    description: string;
    achievements?: string[];
  }[];
  skills?: {
    name: string;
    category?: { name: string };
  }[];
  education?: {
    institution: string;
    degree: string;
    start_date: string;
    end_date?: string | null;
    description?: string;
  }[];
};

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
        <FileText size={14} /> {title}
      </h3>
      {children}
    </div>
  );
}

function ExperienceItem({ title, company, period, location, points }: {
  title: string;
  company: string;
  period: string;
  location: string;
  points: string[];
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{period}</p>
      </div>
      <p className="text-sm text-muted-foreground">{company} • {location}</p>
      <ul className="mt-2 space-y-1">
        {points.map((point) => (
          <li key={point} className="text-sm text-muted-foreground">• {point}</li>
        ))}
      </ul>
    </div>
  );
}

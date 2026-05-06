import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Award, Target, Rocket, BookOpen } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { fetchJson } from "@/lib/api";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

const highlights = [
  { icon: Award, title: "BS Software Engineering", desc: "Abasyn University, Peshawar — CGPA 3.67" },
  { icon: Target, title: "Backend Specialist", desc: "Django, DRF, FastAPI, REST APIs, JWT, RBAC" },
  { icon: Rocket, title: "Production Experience", desc: "Deployed systems on Render, Vercel, Cloudflare" },
  { icon: BookOpen, title: "Continuous Learner", desc: "AWS, Docker, CI/CD — always growing" },
];

export function AboutPage() {
  const { ref, isVisible } = useScrollAnimation();
  const [backendEmpty, setBackendEmpty] = useState(false);
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string; og_image_alt_text?: string }>("/api/v1/public/seo/pages/about/"),
    ]).then(([seoResult]) => {
      if (!active) return;

      setBackendEmpty(seoResult.status !== "fulfilled");

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "About — Shahriyar Khan | Software Engineer",
        description: seo?.meta_description ?? "About Shahriyar Khan (Shary): Software Engineer, Python Developer, Django Developer, and Backend Developer with production experience building scalable systems.",
        keywords: seo?.keywords ?? "About Shahriyar Khan, Shary, Software Engineer, Python Developer, Django Developer, Backend Developer",
        ogTitle: seo?.og_title ?? "About Shahriyar Khan",
        ogDescription: seo?.og_description ?? "Shahriyar Khan is a Software Engineer with strong Python, Django, FastAPI, and backend architecture expertise.",
        ogImageAlt: seo?.og_image_alt_text ?? "Shahriyar Khan standing portrait",
      });
    });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="About Me" subtitle="Software Engineer specializing in Python backend and full-stack web development" />

        {backendEmpty && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            About page SEO is using static fallback content because the Django SEO record is missing or unpublished.
          </div>
        )}

        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-start transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Bio (primary) */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Building reliable software with strong backend foundations</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              I am <span className="text-foreground font-semibold">Shahriyar Khan</span>, a Software Engineer in Pakistan focused on backend architecture and full-stack application delivery. I specialize in <span className="text-primary font-medium">Python, Django, Django REST Framework, FastAPI, and React.js</span> to build scalable, API-driven, production-ready software.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              My work spans the full software lifecycle: understanding requirements, planning architecture, implementing clean code, testing, and deployment. I have built real projects in learning systems, productivity platforms, and AI-assisted applications with a practical engineering approach.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              I am open to opportunities as a <span className="text-primary font-medium">Software Engineer, Python Developer, Django Developer, Python Backend Developer, and Full Stack Developer</span>, including full-time and freelance roles.
            </p>

            <div className="pt-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Work Philosophy</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                I prioritize clarity over complexity. That means clean architecture, clear API contracts, maintainable codebases, and communication that keeps projects predictable for teams and stakeholders.
              </p>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Technical Strengths</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Backend development with Django, DRF, and FastAPI; frontend integration with React.js; relational and NoSQL data handling with PostgreSQL, MySQL, MongoDB, and Redis; and deployment workflows using Render, Vercel, and Cloudflare.
              </p>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">How I Work</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                I start with scope clarity, break delivery into practical milestones, and focus on dependable execution. This helps teams and clients move from ideas to stable, production-ready applications with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((item, i) => (
                <div
                  key={item.title}
                  className="premium-card rounded-xl p-5 transition-all duration-300 hover:scale-105 reveal-in tilt-hover"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <item.icon className="text-primary mb-3" size={22} />
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {["Pashto (Native)", "Urdu (Native)", "English (Professional)"].map((lang) => (
                  <span key={lang} className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{lang}</span>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Let's Connect</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                If you are hiring for Python or Django roles, building a custom web application, or need a backend-focused full-stack developer, I would be glad to discuss your project.
              </p>
            </div>
          </div>

          {/* Top/side image presentation */}
          <div className="space-y-4">
            <div className="motion-border mx-auto max-w-70 md:max-w-[320px] p-px rounded-2xl reveal-in" style={{ animationDelay: "0.05s" }}>
              <div className="premium-card rounded-2xl overflow-hidden tilt-hover h-87.5 md:h-105 shadow-xl transition-all duration-500 ease-in-out p-0">
                <img
                  src="/images/profile.png"
                  alt="Professional headshot of Shahriyar Khan"
                  className="h-full w-full object-cover object-[center_20%] transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="motion-border mx-auto max-w-70 md:max-w-[320px] p-px rounded-2xl reveal-in" style={{ animationDelay: "0.15s" }}>
              <div className="premium-card rounded-2xl overflow-hidden tilt-hover h-87.5 md:h-105 shadow-xl transition-all duration-500 ease-in-out p-0">
                <img
                  src="/images/shary%20photo.jpeg"
                  alt="Shahriyar Khan in a professional workspace setting"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

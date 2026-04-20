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
        <SectionHeading title="About Me" subtitle="A brief introduction to who I am and what I do" />

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
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Building reliable products with strong backend foundations</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              I'm <span className="text-foreground font-semibold">Shahriyar Khan</span>, a Software Engineer and Python Full-Stack Developer based in Islamabad, Pakistan. I specialize in backend engineering, building scalable APIs, and crafting production-ready systems using <span className="text-primary font-medium">Django, Django REST Framework, FastAPI, and React.js</span>.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              I have hands-on experience across the complete Software Development Life Cycle — from requirement analysis and system design to development, testing, and deployment. I've built real-world applications including AI-powered platforms, e-learning systems, and productivity tools.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              My long-term vision is to become an expert in Python, backend engineering, and AI-powered systems. I'm currently open to opportunities as a <span className="text-primary font-medium">Python Developer, Django Developer, Full-Stack Developer, or Software Engineer</span>.
            </p>

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

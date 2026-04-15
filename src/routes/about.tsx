import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Award, Target, Rocket, BookOpen } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shahriyar Khan | Software Engineer" },
      { name: "description", content: "About Shahriyar Khan (Shary): Software Engineer, Python Developer, Django Developer, and Backend Developer with production experience building scalable systems." },
      { name: "keywords", content: "About Shahriyar Khan, Shary, Software Engineer, Python Developer, Django Developer, Backend Developer" },
      { property: "og:title", content: "About Shahriyar Khan" },
      { property: "og:description", content: "Shahriyar Khan is a Software Engineer with strong Python, Django, FastAPI, and backend architecture expertise." },
      { property: "og:image", content: "/images/shary%20photo.jpeg" },
      { property: "og:image:alt", content: "Shahriyar Khan standing portrait" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Shahriyar Khan | Software Engineer" },
      { name: "twitter:description", content: "Python Developer and Django Developer focused on scalable backend systems and clean engineering practices." },
      { name: "twitter:image", content: "/images/shary%20photo.jpeg" },
    ],
  }),
  component: AboutPage,
});

const highlights = [
  { icon: Award, title: "BS Software Engineering", desc: "Abasyn University, Peshawar — CGPA 3.67" },
  { icon: Target, title: "Backend Specialist", desc: "Django, DRF, FastAPI, REST APIs, JWT, RBAC" },
  { icon: Rocket, title: "Production Experience", desc: "Deployed systems on Render, Vercel, Cloudflare" },
  { icon: BookOpen, title: "Continuous Learner", desc: "AWS, Docker, CI/CD — always growing" },
];

function AboutPage() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="About Me" subtitle="A brief introduction to who I am and what I do" />

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

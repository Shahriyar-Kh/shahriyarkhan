import { Link } from "@/lib/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Download, Mail, Code2, Server, Database,
  Sparkles, ExternalLink, Github, Linkedin, ChevronDown,
  Globe, ShoppingCart, Layers, Briefcase, CheckCircle2,
  Terminal, Cpu, Zap, Award, MapPin, Calendar, Star,
  MessageCircle,
} from "lucide-react";
import { fetchJson, fetchListJson, assetUrl } from "@/lib/api";
import { applySeo } from "@/lib/seo";
import { useLiveDataRefresh } from "@/hooks/useLiveDataRefresh";

// ─── Typewriter ───────────────────────────────────────────────────────────────
const roles = [
  "Software Engineer",
  "Python Developer",
  "Django Developer",
  "Backend Developer",
  "Full Stack Developer",
];

function TypewriterText() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const speed = isDeleting ? 38 : 72;
    if (!isDeleting && text === currentRole) {
      const t = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (isDeleting && text === "") {
      setIsDeleting(false);
      setRoleIndex((p) => (p + 1) % roles.length);
      return;
    }
    const t = setTimeout(() => {
      setText(isDeleting ? currentRole.substring(0, text.length - 1) : currentRole.substring(0, text.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [text, isDeleting, roleIndex]);

  return (
    <span className="hero-typewriter">
      {text}<span className="typewriter-cursor">|</span>
    </span>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function CounterNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); return; }
          setCount(start);
        }, 35);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const stats = [
  { icon: Star,     value: 2,  suffix: "+", label: "Happy Clients",      sub: "Trusted by businesses & startups" },
  { icon: Code2,    value: 10, suffix: "+", label: "Projects Built",     sub: "End-to-end delivery" },
  { icon: Server,   value: 4,  suffix: "",  label: "Real Roles",         sub: "Software + internship experience" },
  { icon: Database, value: 4,  suffix: "+", label: "Core Data Layers",   sub: "PostgreSQL, MySQL, MongoDB, Redis" },
  { icon: Sparkles, value: 5,  suffix: "+", label: "Primary Stacks",     sub: "Python, Django, DRF, React, FastAPI" },
];

const techStack = ["Python", "Django", "FastAPI", "React.js", "PostgreSQL", "Redis", "Docker", "JWT"];

type ExperienceTimelineItem = {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  summary: string;
  bullets: string[];
  current?: boolean;
};

const experienceItems: ExperienceTimelineItem[] = [
  {
    id: 1,
    role: "Software Developer",
    company: "HA Technologies (Private) Limited",
    location: "Islamabad",
    period: "Jun 2025 - Present",
    current: true,
    summary: "Contribute to backend and full-stack development for production web applications.",
    bullets: [
      "Contribute to backend and full-stack development for production web applications.",
      "Work on API implementation, application structure, and maintainable feature delivery.",
      "Collaborate with team members to refine requirements and support dependable releases.",
      "Focus on clean code, stable system behavior, and practical execution.",
    ],
  },
  {
    id: 2,
    role: "Python Developer Intern",
    company: "CodeAlpha",
    location: "Remote",
    period: "Feb 2025 - May 2025",
    summary: "Worked on Python-focused tasks with an emphasis on implementation, debugging, and dependable delivery.",
    bullets: [
      "Worked on Python development tasks with a focus on problem-solving and task completion.",
      "Strengthened backend workflow through implementation, debugging, and iteration.",
      "Gained experience delivering work in a remote collaboration environment.",
      "Improved consistency in writing readable, structured code for assigned projects.",
    ],
  },
  {
    id: 3,
    role: "Web Developer Intern",
    company: "Abasyn University (Incubation Center)",
    location: "Peshawar",
    period: "Sep 2024 - Feb 2025",
    summary: "Supported frontend and backend work in a team setting with practical feature delivery.",
    bullets: [
      "Supported web development work across frontend and backend tasks as assigned.",
      "Translated requirements into functional application features with a practical delivery mindset.",
      "Contributed in a team-oriented environment and real project workflows.",
      "Built stronger habits around structured implementation, testing, and iteration.",
    ],
  },
  {
    id: 4,
    role: "Python Development Intern",
    company: "CognoRise InfoTech",
    location: "Remote",
    period: "Oct 2024 - Dec 2024",
    summary: "Strengthened Python workflow through clean implementation, troubleshooting, and collaboration.",
    bullets: [
      "Worked on Python development tasks with emphasis on clean implementation and debugging.",
      "Strengthened backend problem-solving and feature delivery skills through assigned work.",
      "Contributed to maintainable code while learning practical development workflows.",
      "Developed stronger discipline around technical clarity and remote collaboration.",
    ],
  },
];

const education = {
  degree: "BS Software Engineering",
  school: "Abasyn University, Peshawar",
  period: "Completed with CGPA 3.67",
  notes: [
    "Focused on software engineering fundamentals, databases, and application development.",
    "Built a strong academic base for backend architecture and full-stack delivery.",
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SiteSettings  = { site_name?: string; hero_title?: string; hero_subtitle?: string };
type PageSeo       = { title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string; image_alt_text?: string };
type ProjectApi    = { id: number; slug: string; title: string; description: string; technologies?: { name: string; slug: string }[]; tools?: string[]; featured?: boolean; display_order?: number; preview_image?: string | null; live_url?: string; github_url?: string; live?: string | null; github?: string };
type ServiceCard   = { id: number; slug: string; title: string; desc?: string; description?: string; deliverables?: string[] };
type ExperienceApi = { id: number; role: string; company: string; start_date?: string; end_date?: string | null; current?: boolean; summary?: string; bullet_points?: string[] };

// ─── Fallback data ────────────────────────────────────────────────────────────
const fallbackProjects: ProjectApi[] = [
  { id: 1, slug: "noteassist-ai-productivity-platform",    title: "NoteAssist AI — Productivity Platform",   description: "Full-stack AI productivity app with JWT, RBAC, PostgreSQL, and Redis.",        tools: ["Django", "DRF", "React.js", "PostgreSQL", "Redis", "JWT"], preview_image: "/images/noteassisstai_homepage.png",  live: "https://noteassistai.vercel.app",           github: "https://github.com/Shahriyar-Kh", featured: true,  display_order: 1 },
  { id: 2, slug: "sk-learntrack-ai-learning-platform",     title: "SK-LearnTrack — AI Learning Platform",    description: "LMS with OpenAI-powered AI learning assistant and student progress tracking.", tools: ["Django", "DRF", "React", "PostgreSQL", "OpenAI"],            preview_image: "/images/sk-learntrack_homepage.png",   live: "https://sk-learntrack.vercel.app",          github: "https://github.com/Shahriyar-Kh", featured: true,  display_order: 2 },
  { id: 3, slug: "feelwise-emotion-detection-system",      title: "FeelWise — Emotion Detection System",     description: "Microservices AI system with FastAPI, Node.js gateway, and Chart.js visuals.", tools: ["FastAPI", "Python", "Node.js", "MongoDB", "JWT"],            preview_image: "/images/Feelwise_homepage.png",         live: "https://feelwise-emotion-detection.feelwise.workers.dev", github: "https://github.com/Shahriyar-Kh", featured: false, display_order: 3 },
];

const fallbackServices: ServiceCard[] = [
  { id: 1, slug: "backend-development",      title: "Backend Development",     desc: "Robust APIs, scalable Django/FastAPI backends, JWT auth, and database architecture." },
  { id: 2, slug: "website-development",      title: "Website Development",     desc: "Modern, responsive, SEO-optimized websites crafted for business growth." },
  { id: 3, slug: "saas-project",             title: "SaaS Applications",       desc: "Full-featured SaaS platforms with auth, dashboards, subscriptions, and analytics." },
  { id: 4, slug: "ecommerce-website",        title: "Ecommerce Solutions",     desc: "High-converting stores with payment integration, inventory, and order management." },
  { id: 5, slug: "custom-web-application",   title: "Custom Web Apps",         desc: "Purpose-built applications solving your specific business problems end-to-end." },
  { id: 6, slug: "portfolio-website",        title: "Portfolio Websites",      desc: "Premium developer portfolios that attract clients and recruiters instantly." },
];

const serviceIcons: Record<string, typeof Globe> = {
  "backend-development":    Server,
  "website-development":    Globe,
  "saas-project":           Layers,
  "ecommerce-website":      ShoppingCart,
  "custom-web-application": Cpu,
  "portfolio-website":      Star,
  "restaurant-website":     Briefcase,
};

const skillsSnapshot = [
  { category: "Backend", items: ["Python", "Django", "FastAPI", "DRF", "REST APIs", "JWT / RBAC"] },
  { category: "Frontend", items: ["React.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"] },
  { category: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase"] },
  { category: "DevOps & Tools", items: ["Git / GitHub", "Docker", "Render", "Vercel", "Cloudflare", "Postman"] },
];

const experienceFallback: ExperienceTimelineItem[] = experienceItems;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function normalizeProject(p: ProjectApi): ProjectApi {
  return { ...p, live: p.live || p.live_url || null, github: p.github || p.github_url };
}

function getHeroName(heroTitle: string) {
  return heroTitle.replace("Hi, I'm ", "").replace("Hi, I'm", "").trim() || "Shahriyar Khan";
}

function getProjectDescription(description: string) {
  return description
    .replace("Full-stack AI productivity app with JWT, RBAC, PostgreSQL, and Redis.", "Full-stack productivity platform built with Django, DRF, React, PostgreSQL, and Redis for secure, dependable delivery.")
    .replace("LMS with OpenAI-powered AI learning assistant and student progress tracking.", "Learning platform built with Django REST Framework and React for structured learning workflows and student progress tracking.")
    .replace("Microservices AI system with FastAPI, Node.js gateway, and Chart.js visuals.", "Microservices-based Python system built with FastAPI, a Node.js gateway, and data visualization support.");
}

// ─── Section: Services Preview ────────────────────────────────────────────────
function ServicesSection({ services }: { services: ServiceCard[] }) {
  const { ref, visible } = useReveal();
  const list = services.length ? services : fallbackServices;

  return (
    <section className="home-section section-shell" aria-labelledby="services-heading">
      <div className="home-section__inner" ref={ref}>

        {/* Label */}
        <div className={`home-label-row ${visible ? "visible" : ""}`}>
          <span className="home-label-pill"><Zap size={11} /> Services</span>
          <span className="home-label-line" />
        </div>

        <div className={`home-heading-block ${visible ? "visible" : ""}`}>
          <h2 id="services-heading" className="home-section__title">
            What I <span className="gradient-text">Build</span>
          </h2>
          <p className="home-section__subtitle">
            Backend-first, full-stack delivery for businesses that need dependable web applications.
          </p>
        </div>

        <div className="services-grid">
          {list.slice(0, 6).map((svc, i) => {
            const Icon = serviceIcons[svc.slug] || Globe;
            const desc = svc.desc || svc.description || "";
            return (
              <Link
                key={svc.id}
                to="/services"
                className="service-preview-card"
                style={{ animationDelay: `${i * 0.07}s` }}
                aria-label={`Learn about ${svc.title}`}
              >
                <div className="service-preview-card__icon">
                  <Icon size={20} />
                </div>
                <h3 className="service-preview-card__title">{svc.title}</h3>
                <p className="service-preview-card__desc">{desc}</p>
                <span className="service-preview-card__cta">
                  Learn more <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>

        <div className={`home-section__cta-row ${visible ? "visible" : ""}`}>
          <Link to="/services" className="btn-primary">
            View All Services <ArrowRight size={14} />
          </Link>
          <Link to="/contact" className="btn-ghost">
            <Mail size={14} /> Hire Me
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Project Card with Hover Animation ────────────────────────────────────────
function ProjectCardHover({ project, index }: { project: ProjectApi; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const n = normalizeProject(project);
  const tools = n.tools || n.technologies?.map(t => t.name) || [];
  const imgSrc = assetUrl(n.preview_image);
  const description = getProjectDescription(n.description);

  return (
    <div
      key={n.id}
      className={`project-showcase-card ${index === 0 ? "project-showcase-card--featured" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image panel with hover effect */}
      <div className="project-showcase-card__img-wrap project-showcase-card__img-wrap--hover">
        {imgSrc
          ? <img 
              src={imgSrc} 
              alt={n.title} 
              className={`project-showcase-card__img ${isHovered ? "project-showcase-card__img--hover" : ""}`} 
              loading="lazy" 
              decoding="async" 
            />
          : <div className="project-showcase-card__img-placeholder"><Code2 size={40} /></div>
        }
        {n.featured && (
          <span className="project-showcase-card__featured-badge">
            <Star size={10} /> Featured
          </span>
        )}
        {isHovered && (
          <div className="project-showcase-card__hover-cta">
            <Link to={`/projects/${n.slug}`} className="project-showcase-card__hover-btn">
              View Case Study
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="project-showcase-card__body">
        <div className="project-showcase-card__tools">
          {tools.slice(0, 4).map(t => (
            <span key={t} className="project-showcase-card__tool">{t}</span>
          ))}
          {tools.length > 4 && <span className="project-showcase-card__tool">+{tools.length - 4}</span>}
        </div>

        <h3 className="project-showcase-card__title">{n.title}</h3>
        <p className="project-showcase-card__desc">{description}</p>

        <div className="project-showcase-card__actions">
          <Link to={`/projects/${n.slug}`} className="project-showcase-card__btn-detail">
            Case Study <ArrowRight size={13} />
          </Link>
          {n.live && (
            <a href={n.live} target="_blank" rel="noopener noreferrer" className="project-showcase-card__btn-live" aria-label="Live demo">
              <ExternalLink size={14} />
            </a>
          )}
          {n.github && (
            <a href={n.github} target="_blank" rel="noopener noreferrer" className="project-showcase-card__btn-live" aria-label="GitHub">
              <Github size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Featured Projects ───────────────────────────────────────────────
function ProjectsSection({ projects }: { projects: ProjectApi[] }) {
  const { ref, visible } = useReveal();
  const list = (projects.length ? projects : fallbackProjects).slice(0, 3);

  return (
    <section className="home-section section-shell" aria-labelledby="projects-heading">
      <div className="home-section__inner" ref={ref}>

        <div className={`home-label-row ${visible ? "visible" : ""}`}>
          <span className="home-label-pill"><Terminal size={11} /> Work</span>
          <span className="home-label-line" />
        </div>

        <div className={`home-heading-block ${visible ? "visible" : ""}`}>
          <h2 id="projects-heading" className="home-section__title">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="home-section__subtitle">
            Selected projects that reflect backend depth, clean implementation, and production-oriented thinking.
          </p>
        </div>

        <div className="projects-showcase">
          {list.map((project, i) => (
            <ProjectCardHover key={project.id} project={project} index={i} />
          ))}
        </div>

        <div className={`home-section__cta-row ${visible ? "visible" : ""}`}>
          <Link to="/projects" className="btn-primary">
            View All Projects <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Skills Snapshot ─────────────────────────────────────────────────
function SkillsSection() {
  const { ref, visible } = useReveal();

  return (
    <section className="home-section section-shell home-section--alt" aria-labelledby="skills-heading">
      <div className="home-section__inner" ref={ref}>

        <div className={`home-label-row ${visible ? "visible" : ""}`}>
          <span className="home-label-pill"><Cpu size={11} /> Skills</span>
          <span className="home-label-line" />
        </div>

        <div className="skills-snapshot-layout">
          {/* Left text */}
          <div className={`skills-snapshot-intro ${visible ? "visible" : ""}`}>
            <h2 id="skills-heading" className="home-section__title" style={{ textAlign: "left", maxWidth: "none" }}>
              Core <span className="gradient-text">Tech Stack</span>
            </h2>
            <p className="home-section__subtitle" style={{ textAlign: "left", maxWidth: "none" }}>
              A focused stack built for production: backend-first, full-stack capable, and practical.
            </p>
            <div className="skills-snapshot-highlights">
              {[
                { icon: CheckCircle2, text: "Python, Django, DRF, FastAPI" },
                { icon: CheckCircle2, text: "React, TypeScript, Tailwind CSS" },
                { icon: CheckCircle2, text: "PostgreSQL, Redis, MySQL, MongoDB" },
                { icon: CheckCircle2, text: "Docker, Render, Vercel, Cloudflare" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="skills-highlight-item">
                  <Icon size={15} className="skills-highlight-icon" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <Link to="/skills" className="btn-secondary" style={{ marginTop: "1.5rem", alignSelf: "flex-start" }}>
              Full Skills List <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right grid */}
          <div className="skills-snapshot-grid">
            {skillsSnapshot.map((cat, ci) => (
              <div key={cat.category} className="skills-snapshot-cat" style={{ animationDelay: `${ci * 0.1}s` }}>
                <h4 className="skills-snapshot-cat__title">{cat.category}</h4>
                <div className="skills-snapshot-cat__items">
                  {cat.items.map(item => (
                    <span key={item} className="skills-snapshot-pill">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Experience ──────────────────────────────────────────────────────
function ExperienceSection() {
  const { ref, visible } = useReveal();
  const list = experienceFallback;
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(() => list.map(() => false));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setVisibleItems(list.map(() => false));
    setActiveIndex(0);

    const nodes = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number((entry.target as HTMLElement).dataset.index);
        setVisibleItems((current) => {
          const next = [...current];
          next[index] = true;
          return next;
        });
        setActiveIndex(index);
      });
    }, {
      threshold: 0.55,
      rootMargin: "-8% 0px -20% 0px",
    });

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [list]);

  const progress = list.length > 1 ? (activeIndex / (list.length - 1)) * 100 : 100;

  return (
    <section className="home-section section-shell" aria-labelledby="experience-heading">
      <div className="home-section__inner" ref={ref}>
        <div className={`home-label-row ${visible ? "visible" : ""}`}>
          <span className="home-label-pill"><Award size={11} /> Background</span>
          <span className="home-label-line" />
        </div>

        <div className={`home-heading-block ${visible ? "visible" : ""}`}>
          <h2 id="experience-heading" className="home-section__title">
            Experience <span className="gradient-text">Timeline</span>
          </h2>
          <p className="home-section__subtitle">
            A visual timeline of real roles and internships that shows growth, depth, and production thinking.
          </p>
        </div>

        <div className="experience-timeline experience-timeline--alternating" style={{ ["--experience-progress" as never]: `${progress}%` }}>
          <div className="experience-timeline__rail" aria-hidden="true">
            <span className="experience-timeline__rail-track" />
            <span className="experience-timeline__rail-progress" />
          </div>

          {list.map((exp, i) => {
            const side = i % 2 === 0 ? "right" : "left";

            return (
              <article
                key={exp.id}
                ref={(el: HTMLElement | null) => { itemRefs.current[i] = el; }}
                data-index={i}
                className={`experience-timeline__item experience-timeline__item--${side} ${visibleItems[i] ? "is-visible" : ""} ${activeIndex === i ? "is-active" : ""}`}
                style={{ transitionDelay: `${0.08 + i * 0.12}s` }}
              >
                <div className="experience-timeline__node-wrap" aria-hidden="true">
                  <span className="experience-timeline__node" />
                </div>

                <div className="experience-timeline__card premium-card">
                  <div className="experience-timeline__card-top">
                    <div>
                      <div className="experience-timeline__eyebrow">{side === "right" ? "Current Chapter" : "Previous Chapter"}</div>
                      <h3 className="experience-timeline__role">{exp.role}</h3>
                      <div className="experience-timeline__company-row">
                        <Briefcase size={12} />
                        <span className="experience-timeline__company">{exp.company}</span>
                        {exp.current && <span className="experience-timeline__current-badge">Current</span>}
                      </div>
                    </div>

                    <div className="experience-timeline__dates">
                      <Calendar size={12} />
                      <span>{exp.period}</span>
                    </div>
                  </div>

                  <div className="experience-timeline__meta-row">
                    <span className="experience-timeline__meta-chip">{exp.location}</span>
                  </div>

                  <p className="experience-timeline__summary">{exp.summary}</p>

                  <ul className="experience-timeline__bullets">
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}><span className="experience-timeline__bullet-dot" />{bullet}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <div className={`home-section__cta-row ${visible ? "visible" : ""}`}>
          <Link to="/resume" className="btn-secondary">
            <Download size={14} /> Download Resume
          </Link>
          <Link to="/about" className="btn-ghost">
            Full About Page <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

    // ─── Section: Education ──────────────────────────────────────────────────────
    function EducationSection() {
      const { ref, visible } = useReveal();

      return (
        <section className="home-section section-shell home-section--alt" aria-labelledby="education-heading">
          <div className="home-section__inner" ref={ref}>
            <div className={`home-label-row ${visible ? "visible" : ""}`}>
              <span className="home-label-pill"><Award size={11} /> Education</span>
              <span className="home-label-line" />
            </div>

            <div className={`home-heading-block ${visible ? "visible" : ""}`}>
              <h2 id="education-heading" className="home-section__title">
                Academic <span className="gradient-text">Foundation</span>
              </h2>
              <p className="home-section__subtitle">
                Formal software engineering training that supports practical backend and full-stack work.
              </p>
            </div>

            <div className={`education-card premium-card ${visible ? "visible" : ""}`}>
              <div className="education-card__header">
                <div>
                  <h3 className="education-card__degree">{education.degree}</h3>
                  <p className="education-card__school">{education.school}</p>
                </div>
                <span className="education-card__badge">{education.period}</span>
              </div>

              <div className="education-card__body">
                {education.notes.map((note) => (
                  <p key={note} className="education-card__note">{note}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }
function CTASection() {
  const { ref, visible } = useReveal();

  return (
    <section className="home-cta-section section-shell" aria-labelledby="cta-heading" ref={ref}>
      <div className="home-cta-section__bg" aria-hidden="true">
        <div className="home-cta-section__orb home-cta-section__orb--1" />
        <div className="home-cta-section__orb home-cta-section__orb--2" />
        <div className="home-cta-section__grid" />
      </div>

      <div className="home-cta-section__inner">
        <div className={`home-cta-section__content ${visible ? "visible" : ""}`}>
          <div className="home-label-row" style={{ justifyContent: "center" }}>
            <span className="home-label-pill"><Sparkles size={11} /> Let's Work Together</span>
          </div>

          <h2 id="cta-heading" className="home-cta-section__title">
            Ready to Build Something<br />
            <span className="gradient-text">Extraordinary?</span>
          </h2>

          <p className="home-cta-section__subtitle">
            If you need a backend-focused software engineer, a React and Django developer, or a freelancer for a custom web application, I’m open to the right project.
          </p>

          <div className="home-cta-section__actions">
            <Link to="/contact" className="btn-primary">
              Start a Project <ArrowRight size={14} />
            </Link>
            <Link to="/services" className="btn-secondary">
              View Services <ExternalLink size={14} />
            </Link>
            <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>

          <div className="home-cta-section__contact-row">
            <a href="mailto:shahriyarkhanpk1@gmail.com" className="home-cta-section__contact-link">
              shahriyarkhanpk1@gmail.com
            </a>
            <span className="home-cta-section__contact-sep" />
            <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="home-cta-section__contact-link">
              LinkedIn
            </a>
            <span className="home-cta-section__contact-sep" />
            <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="home-cta-section__contact-link">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [backendEmpty, setBackendEmpty] = useState(false);
  const [projects, setProjects] = useState<ProjectApi[]>([]);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [experience, setExperience] = useState<ExperienceApi[]>([]);
  const refreshKey = useLiveDataRefresh(12000);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchJson<SiteSettings>("/api/v1/public/site/settings/"),
      fetchJson<PageSeo>("/api/v1/public/seo/pages/home/"),
      fetchListJson<ProjectApi>("/api/v1/public/portfolio/projects/"),
      fetchListJson<ServiceCard>("/api/v1/public/portfolio/services/"),
      fetchListJson<ExperienceApi>("/api/v1/public/portfolio/experience/"),
    ]).then(([settingsR, seoR, projectsR, servicesR, expR]) => {
      if (!active) return;
      if (settingsR.status === "fulfilled") setSiteSettings(settingsR.value);
      if (projectsR.status === "fulfilled") setProjects(projectsR.value);
      if (servicesR.status === "fulfilled") setServices(servicesR.value);
      if (expR.status === "fulfilled") setExperience(expR.value);
      setBackendEmpty(settingsR.status !== "fulfilled");
      const seo = seoR.status === "fulfilled" ? seoR.value : null;
      applySeo({
        title: seo?.title_tag ?? "Shahriyar Khan | Software Engineer, Python Developer, Django Developer",
        description: seo?.meta_description ?? "Shahriyar Khan is a Software Engineer in Pakistan specializing in Python, Django, Django REST Framework, FastAPI, React, PostgreSQL, Redis, and Docker. He builds scalable web applications and production-ready full-stack systems.",
        keywords: seo?.keywords ?? "Software Engineer in Pakistan, Python Developer, Django Developer, Full Stack Developer, Backend Developer, Django REST Framework Developer, React and Django Developer, API Development, Scalable Web Applications, Production-Ready Applications, Freelance Developer, Custom Web Application Development",
        ogTitle: seo?.og_title ?? "Shahriyar Khan — Software Engineer",
        ogDescription: seo?.og_description ?? "Shahriyar Khan is a Software Engineer focused on Python, Django, Django REST Framework, FastAPI, React, PostgreSQL, Redis, and Docker.",
        ogImageAlt: seo?.image_alt_text ?? "Portrait of Shahriyar Khan, Software Engineer",
      });
    });
    return () => { active = false; };
  }, [refreshKey]);

  const heroTitle = siteSettings?.hero_title ?? "Shahriyar Khan";
  const heroSubtitle = siteSettings?.hero_subtitle ?? "Software Engineering graduate specializing in backend development with Python, Django, and FastAPI, and full-stack web applications with Django REST Framework and React.js.";

  return (
    <>
      {/* ═══════════════════════════════════════ HERO ════════════════════════════ */}
      <section className="hero-section" aria-label="Hero section">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-grain" />
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
          <div className="hero-orb hero-orb--3" />
          <div className="hero-grid" />
          <div className="hero-vignette" />
        </div>

        <div className="hero-container">
          {backendEmpty && (
            <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Home content using local fallback — Django site settings or SEO record is missing or unpublished.
            </div>
          )}

          <div className="hero-grid-layout">
            {/* ── Left: Text ── */}
            <div className="hero-text-col">
              <div className="hero-pill">
                <span className="hero-pill__dot" />
                Software Engineer in Pakistan
              </div>

              <h1 className="hero-heading">
                <span className="hero-heading__greeting">Hi, I’m</span>
                <span className="hero-heading__name gradient-text">{getHeroName(heroTitle)}</span>
              </h1>

              <div className="hero-role-line" aria-label="Current role">
                <TypewriterText />
              </div>

              <p className="hero-subtitle">{heroSubtitle}</p>
              <p className="hero-body">
                I design scalable API-driven architectures with secure JWT authentication, build production-ready backend systems using Django REST Framework and FastAPI, and develop responsive full-stack applications with React.js. Experienced in microservices architecture, PostgreSQL database design, Redis caching, and deploying cloud-native solutions on Render and Vercel.
              </p>

              <div className="hero-tech-stack">
                {techStack.map((tech, i) => (
                  <span key={tech} className="tech-pill" style={{ animationDelay: `${0.5 + i * 0.06}s` }}>{tech}</span>
                ))}
              </div>

              <div className="hero-cta-row">
                <Link to="/projects" className="btn-primary">View Projects <ArrowRight size={15} /></Link>
                <Link to="/resume" className="btn-secondary"><Download size={15} /> Download CV</Link>
                <Link to="/contact" className="btn-ghost"><Mail size={15} /> Contact</Link>
              </div>

              <div className="hero-socials">
                <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn"><Linkedin size={16} /></a>
                <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub"><Github size={16} /></a>
                <div className="social-divider" />
                <span className="social-label">shahriyarkhanpk1@gmail.com</span>
              </div>
            </div>

            {/* ── Right: Portrait ── */}
            <div className="hero-portrait-col">
              <div className="portrait-wrapper">
                <div className="portrait-glow-ring" />
                <div className="portrait-conic-border">
                  <div className="portrait-card">
                    <div className="portrait-image-swap">
                      <img src="/images/profile.png" alt="Shahriyar Khan — Software Engineer" className="portrait-img portrait-img--primary" loading="eager" decoding="async" />
                      <img src="/images/shary%20photo.jpeg" alt="Shahriyar Khan in a professional workspace" className="portrait-img portrait-img--secondary" loading="lazy" decoding="async" />
                    </div>
                  </div>
                </div>
                <div className="portrait-badge portrait-badge--tl"><span className="portrait-badge__dot" /><span className="portrait-badge__text">Available</span></div>
                <div className="portrait-badge portrait-badge--br"><Code2 size={12} /><span className="portrait-badge__text">Backend Dev</span></div>
                <div className="portrait-orbit-dots" aria-hidden="true"><span /><span /><span /></div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="stats-strip">
            {stats.map((stat, i) => (
              <div key={stat.label} className="stat-card" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                <div className="stat-card__icon"><stat.icon size={18} /></div>
                <p className="stat-card__value"><CounterNumber target={stat.value} suffix={stat.suffix} /></p>
                <p className="stat-card__label">{stat.label}</p>
                <p className="stat-card__sub">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Bottom nav links */}
          <div className="hero-footer-links">
            <p className="hero-footer-links__prompt">Ready to collaborate?</p>
            <div className="hero-footer-links__row">
              <Link to="/services" className="footer-link footer-link--accent">Hire me for a project <ExternalLink size={12} /></Link>
              <span className="footer-link__sep">·</span>
              <Link to="/skills" className="footer-link">View my skills →</Link>
              <span className="footer-link__sep">·</span>
              <Link to="/about" className="footer-link">About me →</Link>
              <span className="footer-link__sep">·</span>
              <Link to="/projects" className="footer-link">All projects →</Link>
            </div>
          </div>

          <div className="hero-scroll-cue" aria-hidden="true">
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ BELOW HERO SECTIONS ════════════════════ */}
      <ExperienceSection />
      <ProjectsSection projects={projects} />
      <SkillsSection />
      <ServicesSection services={services} />
      <EducationSection />
      <CTASection />
    </>
  );
}
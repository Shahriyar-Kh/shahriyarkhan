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
  { icon: Code2,    value: 5,  suffix: "+", label: "Production Apps",    sub: "Deployed & live" },
  { icon: Server,   value: 3,  suffix: "+", label: "Years Learning",     sub: "Python & Django" },
  { icon: Database, value: 4,  suffix: "+", label: "Databases Mastered", sub: "SQL & NoSQL" },
  { icon: Sparkles, value: 10, suffix: "+", label: "Projects Built",     sub: "End-to-end" },
];

const techStack = ["Python", "Django", "FastAPI", "React.js", "PostgreSQL", "Redis", "Docker", "JWT"];

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

const experienceFallback: ExperienceApi[] = [
  { id: 1, role: "Backend Developer (Freelance)", company: "Self-Employed",   current: true,  start_date: "2023-06", summary: "Designing and shipping full-stack products — AI platforms, e-learning systems, and productivity tools — using Django, FastAPI, and React. Focused on clean architecture, secure APIs, and production-grade deployments." },
  { id: 2, role: "Software Engineering Student",  company: "Abasyn University", current: false, start_date: "2021-09", end_date: "2025-05", summary: "BS Software Engineering — CGPA 3.67. Built a strong foundation in data structures, databases, software architecture, and full-stack development. Final year project: AI-powered productivity platform." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function normalizeProject(p: ProjectApi): ProjectApi {
  return { ...p, live: p.live || p.live_url || null, github: p.github || p.github_url };
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
            What I <span className="gradient-text">Build</span> For You
          </h2>
          <p className="home-section__subtitle">
            From robust backend APIs to full-featured web products — end-to-end engineering for your vision.
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
        <p className="project-showcase-card__desc">{n.description}</p>

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
            Production applications built with modern architecture, clean code, and real-world impact.
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
              Technologies I <span className="gradient-text">Master</span>
            </h2>
            <p className="home-section__subtitle" style={{ textAlign: "left", maxWidth: "none" }}>
              A focused stack built for production — backend-first, full-stack capable, always evolving.
            </p>
            <div className="skills-snapshot-highlights">
              {[
                { icon: CheckCircle2, text: "3+ years of Python & Django" },
                { icon: CheckCircle2, text: "Production REST API experience" },
                { icon: CheckCircle2, text: "PostgreSQL, Redis, MongoDB" },
                { icon: CheckCircle2, text: "Deployed on Render, Vercel, Cloudflare" },
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
function ExperienceSection({ experience }: { experience: ExperienceApi[] }) {
  const { ref, visible } = useReveal();
  const list = experience.length ? experience : experienceFallback;

  return (
    <section className="home-section section-shell" aria-labelledby="experience-heading">
      <div className="home-section__inner" ref={ref}>

        <div className={`home-label-row ${visible ? "visible" : ""}`}>
          <span className="home-label-pill"><Award size={11} /> Background</span>
          <span className="home-label-line" />
        </div>

        <div className={`home-heading-block ${visible ? "visible" : ""}`}>
          <h2 id="experience-heading" className="home-section__title">
            Experience & <span className="gradient-text">Education</span>
          </h2>
          <p className="home-section__subtitle">
            A track record of shipping real software and continuous growth as an engineer.
          </p>
        </div>

        <div className="experience-timeline">
          {list.map((exp, i) => (
            <div key={exp.id} className={`experience-timeline__item ${visible ? "visible" : ""}`} style={{ transitionDelay: `${0.1 + i * 0.15}s` }}>
              {/* Timeline line + dot */}
              <div className="experience-timeline__marker">
                <div className={`experience-timeline__dot ${exp.current ? "experience-timeline__dot--active" : ""}`} />
                {i < list.length - 1 && <div className="experience-timeline__line" />}
              </div>

              {/* Content card */}
              <div className="experience-timeline__card">
                <div className="experience-timeline__header">
                  <div>
                    <h3 className="experience-timeline__role">{exp.role}</h3>
                    <div className="experience-timeline__company-row">
                      <Briefcase size={12} />
                      <span className="experience-timeline__company">{exp.company}</span>
                      {exp.current && <span className="experience-timeline__current-badge">Current</span>}
                    </div>
                  </div>
                  <div className="experience-timeline__dates">
                    <Calendar size={12} />
                    <span>{fmt(exp.start_date)}{exp.end_date ? ` – ${fmt(exp.end_date)}` : exp.current ? " – Present" : ""}</span>
                  </div>
                </div>
                {exp.summary && (
                  <p className="experience-timeline__summary">{exp.summary}</p>
                )}
                {exp.bullet_points && exp.bullet_points.length > 0 && (
                  <ul className="experience-timeline__bullets">
                    {exp.bullet_points.map((b, bi) => (
                      <li key={bi}><span className="experience-timeline__bullet-dot" />{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
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

// ─── Section: Social Proof ────────────────────────────────────────────────────
function SocialProofSection() {
  const { ref, visible } = useReveal();

  const proofs = [
    { icon: Code2,    value: "10+",  label: "Projects Built",     detail: "From scratch, end-to-end" },
    { icon: Globe,    value: "5+",   label: "Live Deployments",   detail: "Render · Vercel · Cloudflare" },
    { icon: Database, value: "4+",   label: "Database Stacks",    detail: "SQL, NoSQL, Cache layers" },
    { icon: Award,    value: "3.67", label: "CGPA",               detail: "BS Software Engineering" },
    { icon: MapPin,   value: "ISB",  label: "Based in Islamabad", detail: "Pakistan — Remote-friendly" },
    { icon: Sparkles, value: "100%", label: "Open to Work",       detail: "Full-time or freelance" },
  ];

  return (
    <section className="home-section section-shell home-section--alt" aria-labelledby="social-proof-heading">
      <div className="home-section__inner" ref={ref}>
        <div className={`home-heading-block ${visible ? "visible" : ""}`}>
          <h2 id="social-proof-heading" className="home-section__title">
            At a <span className="gradient-text">Glance</span>
          </h2>
          <p className="home-section__subtitle">
            Numbers that reflect real engineering experience, not just theory.
          </p>
        </div>

        <div className="proof-grid">
          {proofs.map(({ icon: Icon, value, label, detail }, i) => (
            <div
              key={label}
              className={`proof-card ${visible ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="proof-card__icon"><Icon size={18} /></div>
              <p className="proof-card__value">{value}</p>
              <p className="proof-card__label">{label}</p>
              <p className="proof-card__detail">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: CTA ─────────────────────────────────────────────────────────────
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
            Whether you need a scalable backend, a premium full-stack product, or a freelance developer who ships clean code — I'm available and ready to contribute from day one.
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
        title: seo?.title_tag ?? "Shahriyar Khan — Software Engineer | Python & Django Developer",
        description: seo?.meta_description ?? "Portfolio of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, and full-stack development.",
        keywords: seo?.keywords ?? "Shahriyar, Shahriyar Khan, Shary, Python Developer, Django Developer, Backend Developer, Full Stack Developer",
        ogTitle: seo?.og_title ?? "Shahriyar Khan — Software Engineer",
        ogDescription: seo?.og_description ?? "Shahriyar Khan (Shary) is a Software Engineer focused on Python, Django, FastAPI, and high-quality backend architecture.",
        ogImageAlt: seo?.image_alt_text ?? "Portrait of Shahriyar Khan, Software Engineer",
      });
    });
    return () => { active = false; };
  }, [refreshKey]);

  const heroTitle    = siteSettings?.hero_title ?? "Hi, I'm Shahriyar Khan";
  const heroSubtitle = siteSettings?.hero_subtitle ?? "Software Engineer crafting scalable products with Python, Django, FastAPI, and modern frontend technologies.";

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
                Open to Work — Available Now
              </div>

              <h1 className="hero-heading">
                <span className="hero-heading__greeting">Hi, I'm</span>
                <span className="hero-heading__name gradient-text">
                  {heroTitle.replace("Hi, I'm ", "").replace("Hi, I'm", "").trim() || "Shahriyar Khan"}
                </span>
              </h1>

              <div className="hero-role-line" aria-label="Current role">
                <TypewriterText />
              </div>

              <p className="hero-subtitle">{heroSubtitle}</p>
              <p className="hero-body">
                Building scalable systems and backend architecture with Python, Django, and modern technologies. Passionate about clean code, AI-powered features, and delivering production-ready products.
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
      <ServicesSection services={services} />
      <ProjectsSection projects={projects} />
      <SkillsSection />
      <SocialProofSection />
      <ExperienceSection experience={experience} />
      <CTASection />
    </>
  );
}
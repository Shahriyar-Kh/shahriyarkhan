import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume — Shahriyar Khan | Software Engineer CV" },
      { name: "description", content: "Download Shahriyar Khan's ATS-optimized resume. Software Engineer, Python Developer, Django Developer, and Backend Developer." },
      { name: "keywords", content: "Shahriyar resume, software engineer CV, python developer resume, django developer resume" },
      { property: "og:title", content: "Resume — Shahriyar Khan" },
      { property: "og:description", content: "ATS-friendly CV of a Python & Django developer." },
      { property: "og:image", content: "/images/profile.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Resume — Shahriyar Khan" },
      { name: "twitter:description", content: "ATS-optimized resume for Shahriyar Khan, Software Engineer." },
    ],
  }),
  component: ResumePage,
});

function ResumePage() {
  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Resume / CV" subtitle="ATS-optimized professional resume" />

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
            <h2 className="text-2xl font-bold text-foreground">SHAHRIYAR KHAN</h2>
            <p className="text-primary font-medium mt-1">Software Engineer | Python • Django • FastAPI</p>
            <p className="text-sm text-muted-foreground mt-2">
              Islamabad, Pakistan • shahriyarkhanpk1@gmail.com • +92 311 0924560
            </p>
            <p className="text-sm text-muted-foreground">
              linkedin.com/in/shahriyarkhan786 • github.com/Shahriyar-Kh
            </p>
          </div>

          <ResumeSection title="Summary">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Software Engineer with experience designing and developing scalable web applications and backend systems using Python, Django, and FastAPI. Strong understanding of SDLC, system design, and API-driven architectures. Experienced in building production-ready systems, integrating AI-powered features, and delivering reliable solutions in agile environments.
            </p>
          </ResumeSection>

          <ResumeSection title="Experience">
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
          </ResumeSection>

          <ResumeSection title="Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p><span className="text-foreground font-medium">Backend:</span> Python, Django, DRF, FastAPI</p>
              <p><span className="text-foreground font-medium">Frontend:</span> React.js, JavaScript, HTML5, CSS3</p>
              <p><span className="text-foreground font-medium">Databases:</span> PostgreSQL, MongoDB, MySQL, Redis</p>
              <p><span className="text-foreground font-medium">Tools:</span> Git, GitHub, Postman, Docker (basic)</p>
              <p><span className="text-foreground font-medium">Deployment:</span> Render, Vercel, Supabase, Cloudflare</p>
              <p><span className="text-foreground font-medium">AI:</span> OpenAI API, Groq, Machine Learning</p>
            </div>
          </ResumeSection>

          <ResumeSection title="Education">
            <p className="text-sm text-foreground font-medium">BS Software Engineering — Abasyn University, Peshawar</p>
            <p className="text-sm text-muted-foreground">Graduated 2025 • CGPA 3.67</p>
          </ResumeSection>

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

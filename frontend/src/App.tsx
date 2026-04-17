import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, RouterProvider, useLocation } from "@/lib/navigation";
import { HomePage } from "@/routes/index";
import { AboutPage } from "@/routes/about";
import { SkillsPage } from "@/routes/skills";
import { ServicesPage } from "@/routes/services";
import { ProjectsPage } from "@/routes/projects";
import { ProjectDetailPage } from "@/routes/projects.$slug";
import { ResumePage } from "@/routes/resume";
import { ContactPage } from "@/routes/contact";

function AppRoutes() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  if (pathname === "/") return <HomePage />;
  if (pathname === "/about") return <AboutPage />;
  if (pathname === "/skills") return <SkillsPage />;
  if (pathname === "/services") return <ServicesPage />;
  if (pathname === "/projects") return <ProjectsPage />;
  if (pathname === "/resume") return <ResumePage />;
  if (pathname === "/contact") return <ContactPage />;

  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return <ProjectDetailPage slug={decodeURIComponent(projectMatch[1])} />;
  }

  return <NotFoundPage />;
}

function NotFoundPage() {
  useEffect(() => {
    document.title = "404 — Shahriyar Khan";
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <RouterProvider>
      <Header />
      <main className="min-h-screen pt-20">
        <AppRoutes />
      </main>
      <Footer />
    </RouterProvider>
  );
}

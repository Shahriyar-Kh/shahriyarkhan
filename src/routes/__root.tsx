import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Shahriyar Khan — Software Engineer | Python & Django Developer" },
      { name: "description", content: "Premium portfolio of Shahriyar Khan (Shary), Software Engineer specializing in Python, Django, FastAPI, scalable backend systems, and modern full-stack development." },
      { name: "author", content: "Shahriyar Khan" },
      { name: "keywords", content: "Shahriyar, Shahriyar Khan, Shary, Python Developer, Django Developer, Backend Developer, Junior Full Stack Developer, Software Engineer" },
      { name: "theme-color", content: "#101827" },
      { property: "og:title", content: "Shahriyar Khan — Software Engineer" },
      { property: "og:description", content: "Shahriyar Khan (Shary) is a Software Engineer focused on Python, Django, FastAPI, and high-quality backend architecture." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Shahriyar Khan Portfolio" },
      { property: "og:image", content: "/images/profile.png" },
      { property: "og:image:alt", content: "Portrait of Shahriyar Khan, Software Engineer" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Shahriyar Khan — Software Engineer | Python & Django" },
      { name: "twitter:description", content: "Portfolio of Shahriyar Khan (Shary): Python Developer, Django Developer, Backend Developer, and Junior Full Stack Developer." },
      { name: "twitter:image", content: "/images/profile.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

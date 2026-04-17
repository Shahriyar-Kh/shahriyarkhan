import { useState, useEffect } from "react";
import { Menu, X, Github, Linkedin, MessageCircle } from "lucide-react";
import { Link, useLocation } from "@/lib/navigation";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/skills", label: "Skills" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/resume", label: "Resume" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3 shadow-lg shadow-black/20 border-b border-border/60" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold gradient-text tracking-tight">
          SK.
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-secondary/50 hover:-translate-y-0.5"
              activeClassName="!text-primary bg-primary/10"
              exact
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <a
              href="https://linkedin.com/in/shahriyarkhan786"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://github.com/Shahriyar-Kh"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href="https://wa.me/923110924560"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-accent transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="lg:hidden glass mt-2 mx-4 rounded-xl p-4 animate-fade-in-up shadow-xl shadow-black/25 border border-border/70">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              activeClassName="!text-primary"
              exact
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-4 pt-3 border-t border-border mt-3">
            <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary"><Linkedin size={18} /></a>
            <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary"><Github size={18} /></a>
            <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-accent"><MessageCircle size={18} /></a>
          </div>
        </nav>
      )}
    </header>
  );
}

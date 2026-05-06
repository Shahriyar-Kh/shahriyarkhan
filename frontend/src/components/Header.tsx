import { useState, useEffect } from "react";
import { Menu, X, Github, Linkedin, MessageCircle } from "lucide-react";
import { Link, useLocation } from "@/lib/navigation";

const navLinks = [
  { to: "/",         label: "Home",     exact: true },
  { to: "/about",    label: "About" },
  { to: "/skills",   label: "Skills" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/resume",   label: "Resume" },
  { to: "/contact",  label: "Contact" },
] as const;

export function Header() {
  const [isOpen, setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location              = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        role="banner"
        className={`header-shell ${scrolled ? "header-shell--scrolled" : ""}`}
      >
        <div className="header-inner">
          {/* ── Logo ── */}
          <Link to="/" className="header-logo" aria-label="Shahriyar Khan — Home">
            SK<span className="header-logo__dot">.</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="header-desktop-nav" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                exact={"exact" in link ? link.exact : false}
                className="header-nav-link"
                activeClassName="header-nav-link--active"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Right side ── */}
          <div className="header-right">
            {/* Social icons */}
            <div className="header-social-row">
              <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="header-social-icon" aria-label="LinkedIn">
                <Linkedin size={15} />
              </a>
              <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="header-social-icon" aria-label="GitHub">
                <Github size={15} />
              </a>
              <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="header-social-icon" aria-label="WhatsApp">
                <MessageCircle size={15} />
              </a>
            </div>

            {/* Hire me CTA */}
            <Link to="/contact" className="header-hire-btn">
              Hire Me
            </Link>

            {/* Mobile toggle */}
            <button
              className="header-mobile-toggle"
              onClick={() => setIsOpen((o) => !o)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <div
        className={`mobile-menu ${isOpen ? "mobile-menu--open" : ""}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="mobile-menu__backdrop" onClick={() => setIsOpen(false)} />
        <nav className="mobile-menu__panel">
          <div className="mobile-menu__header">
            <span className="header-logo" style={{ fontSize: "1.5rem" }}>
              SK<span className="header-logo__dot">.</span>
            </span>
            <button className="header-mobile-toggle" onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <div className="mobile-menu__links">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                exact={"exact" in link ? link.exact : false}
                className="mobile-menu__link"
                activeClassName="mobile-menu__link--active"
                style={{ animationDelay: `${0.04 + i * 0.04}s` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mobile-menu__footer">
            <Link to="/contact" className="btn-primary" style={{ justifyContent: "center" }}>
              Let's Work Together
            </Link>
            <div className="footer-socials" style={{ justifyContent: "center" }}>
              <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="GitHub"><Github size={16} /></a>
              <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="WhatsApp"><MessageCircle size={16} /></a>
            </div>
            <p className="mobile-menu__email">shahriyarkhanpk1@gmail.com</p>
          </div>
        </nav>
      </div>
    </>
  );
}
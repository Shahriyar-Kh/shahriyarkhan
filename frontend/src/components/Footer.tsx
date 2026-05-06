import { Link } from "@/lib/navigation";
import { Github, Linkedin, MessageCircle, Mail, MapPin, ArrowUpRight } from "lucide-react";

const quickLinks = [
  { to: "/about",    label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/skills",   label: "Skills" },
  { to: "/services", label: "Services" },
  { to: "/resume",   label: "Resume" },
  { to: "/contact",  label: "Contact" },
];

const services = [
  "Backend Development",
  "Website Development",
  "SaaS Applications",
  "Ecommerce Solutions",
  "Custom Web Apps",
  "Portfolio Websites",
];

export function Footer() {
  return (
    <footer className="footer-shell">
      {/* Top separator glow */}
      <div className="footer-top-line" aria-hidden="true" />

      <div className="footer-inner">
        {/* ── Brand col ── */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo" aria-label="Home">
            SK<span className="footer-logo__dot">.</span>
          </Link>
          <p className="footer-brand-bio">
            Software Engineer specializing in Python, Django, and full-stack product development. Building scalable backend systems and premium web applications.
          </p>

          <div className="footer-location">
            <MapPin size={13} />
            <span>Islamabad, Pakistan · Remote-friendly</span>
          </div>

          <div className="footer-socials">
            <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="GitHub">
              <Github size={16} />
            </a>
            <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="WhatsApp">
              <MessageCircle size={16} />
            </a>
            <a href="mailto:shahriyarkhanpk1@gmail.com" className="footer-social-btn" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="footer-nav-col">
          <h3 className="footer-col-title">Navigation</h3>
          <nav aria-label="Footer navigation">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="footer-nav-link">
                <span>{link.label}</span>
                <ArrowUpRight size={11} className="footer-nav-link__arrow" />
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Services ── */}
        <div className="footer-nav-col">
          <h3 className="footer-col-title">Services</h3>
          <nav aria-label="Services navigation">
            {services.map((s) => (
              <Link key={s} to="/services" className="footer-nav-link">
                <span>{s}</span>
                <ArrowUpRight size={11} className="footer-nav-link__arrow" />
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Contact ── */}
        <div className="footer-contact-col">
          <h3 className="footer-col-title">Get in Touch</h3>
          <div className="footer-contact-items">
            <a href="mailto:shahriyarkhanpk1@gmail.com" className="footer-contact-item">
              <div className="footer-contact-item__icon"><Mail size={14} /></div>
              <div>
                <p className="footer-contact-item__label">Email</p>
                <p className="footer-contact-item__value">shahriyarkhanpk1@gmail.com</p>
              </div>
            </a>
            <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
              <div className="footer-contact-item__icon"><MessageCircle size={14} /></div>
              <div>
                <p className="footer-contact-item__label">WhatsApp</p>
                <p className="footer-contact-item__value">+92 311 092 4560</p>
              </div>
            </a>
            <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
              <div className="footer-contact-item__icon"><Linkedin size={14} /></div>
              <div>
                <p className="footer-contact-item__label">LinkedIn</p>
                <p className="footer-contact-item__value">Shahriyar Khan</p>
              </div>
            </a>
          </div>

          <div className="footer-availability-badge">
            <span className="footer-availability-badge__dot" />
            Open to Work — Full-time or Freelance
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom__inner">
          <p className="footer-bottom__copy">
            © {new Date().getFullYear()} Shahriyar Khan. All rights reserved.
          </p>
          <div className="footer-bottom__keywords" aria-hidden="true">
            Python · Django · FastAPI · React · PostgreSQL · Software Engineer
          </div>
          <p className="footer-bottom__built">
            Designed &amp; built by <span className="footer-bottom__built-name">Shahriyar Khan</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
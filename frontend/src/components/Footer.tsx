import { Link } from "@/lib/navigation";
import { Github, Linkedin, MessageCircle, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-bold gradient-text">SK.</span>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Software Engineer specializing in Python, Django, and scalable backend systems. Open to opportunities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Projects</Link>
              <Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-0.5" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-0.5" aria-label="GitHub"><Github size={18} /></a>
              <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-accent hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-0.5" aria-label="WhatsApp"><MessageCircle size={18} /></a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">shahriyarkhanpk1@gmail.com</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Shahriyar Khan. All rights reserved.</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">Built with by Shahriyar Khan</p>
        </div>
      </div>
    </footer>
  );
}

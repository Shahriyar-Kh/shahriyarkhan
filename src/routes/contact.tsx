import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { Mail, Phone, MapPin, Github, Linkedin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shahriyar Khan | Get in Touch" },
      { name: "description", content: "Contact Shahriyar Khan (Shary) for web development, backend engineering, freelance projects, and software engineering opportunities." },
      { name: "keywords", content: "Contact Shahriyar Khan, hire Python developer, Django developer contact, backend developer Pakistan" },
      { property: "og:title", content: "Contact Shahriyar Khan" },
      { property: "og:description", content: "Reach out for web development services, freelance work, or employment opportunities." },
      { property: "og:image", content: "/images/profile.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact — Shahriyar Khan" },
      { name: "twitter:description", content: "Get in touch with Shahriyar Khan for development projects and opportunities." },
    ],
  }),
  component: ContactPage,
});

const contactInfo = [
  { icon: Mail, label: "Email", value: "shahriyarkhanpk1@gmail.com", href: "mailto:shahriyarkhanpk1@gmail.com" },
  { icon: Phone, label: "Phone", value: "+92 311 0924560", href: "tel:+923110924560" },
  { icon: MapPin, label: "Location", value: "Islamabad, Pakistan", href: null },
];

const serviceOptions = [
  "Website Development",
  "Restaurant Website",
  "Ecommerce Website",
  "SaaS Project",
  "Portfolio Website",
  "Backend Development",
  "Custom Web Application",
  "Other",
];

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    service: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "", service: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Get in Touch" subtitle="Let's discuss your next project or opportunity" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {contactInfo.map((item) => (
              <div key={item.label} className="premium-card rounded-xl p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-lg gradient-primary">
                  <item.icon size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="premium-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Connect with me</p>
              <div className="flex items-center gap-3">
                <a href="https://linkedin.com/in/shahriyarkhan786" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
                <a href="https://github.com/Shahriyar-Kh" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all" aria-label="GitHub">
                  <Github size={20} />
                </a>
                <a href="https://wa.me/923110924560" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary text-muted-foreground hover:text-accent hover:bg-secondary/80 transition-all" aria-label="WhatsApp">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="premium-card rounded-xl p-10 text-center">
                <p className="text-2xl font-bold gradient-text">Message Sent! 🎉</p>
                <p className="text-muted-foreground mt-3">Thank you for reaching out. I'll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="premium-card rounded-xl p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Project inquiry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Service Type</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData((f) => ({ ...f, service: e.target.value }))}
                      className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select (optional)</option>
                      {serviceOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Tell me about your project or opportunity..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

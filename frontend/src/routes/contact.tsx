import { SectionHeading } from "@/components/SectionHeading";
import { Mail, Phone, MapPin, Github, Linkedin, MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { applySeo } from "@/lib/seo";
import { fetchJson, fetchListJson, postJson } from "@/lib/api";

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

type SiteSettings = {
  public_email?: string;
  public_phone?: string;
  public_location?: string;
  site_name?: string;
};

type ServiceApi = {
  id: number;
  title: string;
};

export function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<ServiceApi[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    service: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchJson<SiteSettings>("/api/v1/public/site/settings/"),
      fetchListJson<ServiceApi>("/api/v1/public/portfolio/services/"),
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string }>("/api/v1/public/seo/pages/contact/"),
    ]).then(([settingsResult, servicesResult, seoResult]) => {
      if (!active) return;

      if (settingsResult.status === "fulfilled") {
        setSiteSettings(settingsResult.value);
      }

      if (servicesResult.status === "fulfilled") {
        setServices(servicesResult.value);
      }

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Contact — Shahriyar Khan | Get in Touch",
        description: seo?.meta_description ?? "Contact Shahriyar Khan (Shary) for web development, backend engineering, freelance projects, and software engineering opportunities.",
        keywords: seo?.keywords ?? "Contact Shahriyar Khan, hire Python developer, Django developer contact, backend developer Pakistan",
        ogTitle: seo?.og_title ?? "Contact Shahriyar Khan",
        ogDescription: seo?.og_description ?? "Reach out for web development services, freelance work, or employment opportunities.",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await postJson("/api/v1/public/inquiries/contact/", {
        sender_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        service_type_text: formData.service,
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "", service: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  const resolvedContactInfo = [
    { icon: Mail, label: "Email", value: siteSettings?.public_email ?? contactInfo[0].value, href: `mailto:${siteSettings?.public_email ?? "shahriyarkhanpk1@gmail.com"}` },
    { icon: Phone, label: "Phone", value: siteSettings?.public_phone ?? contactInfo[1].value, href: `tel:${(siteSettings?.public_phone ?? "+923110924560").replace(/\s+/g, "")}` },
    { icon: MapPin, label: "Location", value: siteSettings?.public_location ?? contactInfo[2].value, href: null },
  ];
  const contactServiceOptions = services.length ? services.map((service) => service.title) : serviceOptions;

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Get in Touch" subtitle="Let's discuss your next project or opportunity" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {resolvedContactInfo.map((item) => (
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
                      {contactServiceOptions.map((s) => (
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
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <Send size={16} /> {loading ? "Sending..." : "Send Message"}
                </button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

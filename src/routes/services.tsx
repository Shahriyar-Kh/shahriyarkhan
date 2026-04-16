import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { Globe, ShoppingCart, Layers, Briefcase, Code, Server, Settings } from "lucide-react";
import { applySeo } from "@/lib/seo";
import { fetchJson, fetchListJson, postJson } from "@/lib/api";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Shahriyar Khan | Web Development Services" },
      { name: "description", content: "Professional services by Shahriyar Khan (Shary): website development, ecommerce, SaaS products, backend engineering, and custom web applications." },
      { name: "keywords", content: "Shahriyar services, web development services, Django developer for hire, backend developer services" },
      { property: "og:title", content: "Services — Shahriyar Khan" },
      { property: "og:description", content: "Hire Shahriyar Khan for web development, backend engineering, and custom applications." },
      { property: "og:image", content: "/images/profile.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Services — Shahriyar Khan" },
      { name: "twitter:description", content: "Premium web and backend development services by Shahriyar Khan." },
    ],
  }),
  component: ServicesPage,
});

type ServiceCard = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  deliverables?: string[];
  featured?: boolean;
  desc?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

const fallbackServices: ServiceCard[] = [
  { id: 1, icon: Globe, title: "Website Development", desc: "Modern, responsive, SEO-optimized websites tailored to your business needs.", slug: "website-development" },
  { id: 2, icon: Briefcase, title: "Restaurant Website", desc: "Beautiful restaurant websites with menus, reservations, and online ordering.", slug: "restaurant-website" },
  { id: 3, icon: ShoppingCart, title: "Ecommerce Website", desc: "Full-featured ecommerce platforms with payment integration and inventory management.", slug: "ecommerce-website" },
  { id: 4, icon: Layers, title: "SaaS Project", desc: "Scalable SaaS applications with authentication, dashboards, and subscription billing.", slug: "saas-project" },
  { id: 5, icon: Code, title: "Portfolio Website", desc: "Premium portfolio websites that showcase your work and attract clients.", slug: "portfolio-website" },
  { id: 6, icon: Server, title: "Backend Development", desc: "Robust APIs, database architecture, and server-side logic using Django and FastAPI.", slug: "backend-development" },
  { id: 7, icon: Settings, title: "Custom Web Application", desc: "Tailored web applications built to solve your specific business problems.", slug: "custom-web-application" },
];

const iconByTitle: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  "Website Development": Globe,
  "Restaurant Website": Briefcase,
  "Ecommerce Website": ShoppingCart,
  "SaaS Project": Layers,
  "Portfolio Website": Code,
  "Backend Development": Server,
  "Custom Web Application": Settings,
};

function ServicesPage() {
  const [servicesData, setServicesData] = useState<ServiceCard[]>([]);
  const [backendAttempted, setBackendAttempted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", service: "", budgetRange: "", timeline: "", details: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const budgetOptions = [
    "Under $500",
    "$500 - $1,000",
    "$1,000 - $2,500",
    "$2,500 - $5,000",
    "$5,000+",
    "Not sure yet",
  ];

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchListJson<ServiceCard>("/api/v1/public/portfolio/services/"),
      fetchJson<{ title_tag?: string; meta_description?: string; keywords?: string; og_title?: string; og_description?: string }>("/api/v1/public/seo/pages/services/"),
    ]).then(([servicesResult, seoResult]) => {
      if (!active) return;

      setBackendAttempted(true);
      if (servicesResult.status === "fulfilled" && servicesResult.value.length) {
        setServicesData(servicesResult.value);
      }

      const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
      applySeo({
        title: seo?.title_tag ?? "Services — Shahriyar Khan | Web Development Services",
        description: seo?.meta_description ?? "Professional services by Shahriyar Khan (Shary): website development, ecommerce, SaaS products, backend engineering, and custom web applications.",
        keywords: seo?.keywords ?? "Shahriyar services, web development services, Django developer for hire, backend developer services",
        ogTitle: seo?.og_title ?? "Services — Shahriyar Khan",
        ogDescription: seo?.og_description ?? "Hire Shahriyar Khan for web development, backend engineering, and custom applications.",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const displayServices = servicesData.length > 0 ? servicesData : fallbackServices;
  const serviceTitles = displayServices.map((service) => service.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const selectedService = servicesData.find((item) => item.title === formData.service);
      await postJson("/api/v1/public/inquiries/service-requests/", {
        sender_name: formData.name,
        email: formData.email,
        subject: formData.service || "Service Request",
        message: formData.details,
        service: selectedService?.id || undefined,
        service_type_text: formData.service,
        budget_range: formData.budgetRange,
        timeline: formData.timeline,
        source_page: "/services",
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", service: "", budgetRange: "", timeline: "", details: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong while sending your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Services" subtitle="What I can build for you" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {displayServices.map((service) => {
            const Icon = iconByTitle[service.title] ?? service.icon ?? Settings;
            const description = service.description ?? service.desc ?? "";

            return (
              <div key={service.title} className="premium-card rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:border-primary/30 group tilt-hover">
                <Icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={28} />
                <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto">
          <SectionHeading title="Request a Service" subtitle="Tell me about your project and I'll get back to you" />

          {submitted ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-lg font-semibold text-primary">Thank you! 🎉</p>
              <p className="text-muted-foreground mt-2">Your request has been received. I'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Your name"
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Service Type</label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => setFormData((f) => ({ ...f, service: e.target.value }))}
                  className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a service</option>
                  {serviceTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Budget Range</label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData((f) => ({ ...f, budgetRange: e.target.value }))}
                    className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a budget (optional)</option>
                    {budgetOptions.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Timeline / Deadline</label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData((f) => ({ ...f, timeline: e.target.value }))}
                    className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. 2 weeks, end of month"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project Details</label>
                <textarea
                  required
                  rows={4}
                  value={formData.details}
                  onChange={(e) => setFormData((f) => ({ ...f, details: e.target.value }))}
                  className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Describe your project..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                {loading ? "Sending..." : "Submit Request"}
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

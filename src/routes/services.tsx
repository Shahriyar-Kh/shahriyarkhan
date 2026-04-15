import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { Globe, ShoppingCart, Layers, Briefcase, Code, Server, Settings } from "lucide-react";
import { useState } from "react";

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

const services = [
  { icon: Globe, title: "Website Development", desc: "Modern, responsive, SEO-optimized websites tailored to your business needs." },
  { icon: Briefcase, title: "Restaurant Website", desc: "Beautiful restaurant websites with menus, reservations, and online ordering." },
  { icon: ShoppingCart, title: "Ecommerce Website", desc: "Full-featured ecommerce platforms with payment integration and inventory management." },
  { icon: Layers, title: "SaaS Project", desc: "Scalable SaaS applications with authentication, dashboards, and subscription billing." },
  { icon: Code, title: "Portfolio Website", desc: "Premium portfolio websites that showcase your work and attract clients." },
  { icon: Server, title: "Backend Development", desc: "Robust APIs, database architecture, and server-side logic using Django and FastAPI." },
  { icon: Settings, title: "Custom Web Application", desc: "Tailored web applications built to solve your specific business problems." },
];

function ServicesPage() {
  const [formData, setFormData] = useState({ name: "", email: "", service: "", details: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", service: "", details: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Services" subtitle="What I can build for you" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {services.map((service) => (
            <div key={service.title} className="premium-card rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:border-primary/30 group tilt-hover">
              <service.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        {/* Request Service Form */}
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
                  {services.map((s) => (
                    <option key={s.title} value={s.title}>{s.title}</option>
                  ))}
                </select>
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
                className="w-full rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Submit Request
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

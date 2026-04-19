interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ title, subtitle, align = "center" }: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <header className={`mb-14 ${isCenter ? "text-center" : "text-left"}`}>
      {/* Label line */}
      <div className={`flex items-center gap-3 mb-4 ${isCenter ? "justify-center" : ""}`}>
        <div className="h-px w-8 bg-primary/50 rounded-full" />
        <span className="text-label text-primary/80">Portfolio</span>
        <div className="h-px w-8 bg-primary/50 rounded-full" />
      </div>

      <h2
        className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-foreground tracking-tight leading-[1.1]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-3.5 text-muted-foreground text-base sm:text-lg leading-relaxed ${
            isCenter ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Decorative underline */}
      <div className={`mt-6 flex items-center gap-2 ${isCenter ? "justify-center" : ""}`}>
        <div className="h-1 w-10 rounded-full gradient-primary" />
        <div className="h-1 w-4 rounded-full bg-accent/60" />
        <div className="h-1 w-2 rounded-full bg-primary/30" />
      </div>
    </header>
  );
}

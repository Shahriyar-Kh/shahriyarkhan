interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ title, subtitle, align = "center" }: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <header className={`mb-16 transition-all duration-700 ${isCenter ? "text-center" : "text-left"}`}>
      {/* Label line */}
      <div className={`flex items-center gap-3 mb-5 ${isCenter ? "justify-center" : ""}`}>
        <div className="h-px w-10 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
        <span className="text-label-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold tracking-wider">Portfolio Section</span>
        <div className="h-px w-10 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
      </div>

      <h2
        className="text-display-md sm:text-display-lg font-display text-foreground tracking-tight leading-[1.1] mb-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-tertiary text-body-lg sm:text-body-lg leading-relaxed font-medium ${
            isCenter ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Decorative underline */}
      <div className={`mt-7 flex items-center gap-2.5 ${isCenter ? "justify-center" : ""}`}>
        <div className="h-1.5 w-12 rounded-full gradient-primary shadow-md" />
        <div className="h-1 w-4 rounded-full bg-accent/60" />
        <div className="h-1 w-2 rounded-full bg-primary/30" />
      </div>
    </header>
  );
}

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ title, subtitle, align = "center" }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-muted-foreground text-base sm:text-lg ${align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-5 h-1 w-20 rounded-full gradient-primary ${align === "center" ? "mx-auto" : ""}`} />
      <div className={`mt-4 h-px bg-linear-to-r from-transparent via-border to-transparent ${align === "center" ? "mx-auto max-w-xs" : "max-w-xs"}`} />
    </div>
  );
}

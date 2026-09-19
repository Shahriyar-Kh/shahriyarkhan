import Image from "next/image";
import { assetUrl } from "@/lib/assets";
import type { Project } from "@/lib/api/types";

export interface ProjectMediaProps {
  project: Pick<Project, "title" | "preview_image" | "featured_image" | "alt_text" | "image_alt_text">;
  variant?: "card" | "hero";
}

/** Alt resolution order: image_alt_text -> alt_text -> "Screenshot of
 * {title}". Renders nothing when both images are null - the caller
 * falls back to a typographic tile, never a stock placeholder. */
export function ProjectMedia({ project, variant = "card" }: ProjectMediaProps) {
  const source = project.featured_image ?? project.preview_image;
  if (!source) return null;

  const alt = project.image_alt_text || project.alt_text || `Screenshot of ${project.title}`;

  return (
    <Image
      src={assetUrl(source)}
      alt={alt}
      fill
      sizes={variant === "hero" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
      className="object-cover"
    />
  );
}

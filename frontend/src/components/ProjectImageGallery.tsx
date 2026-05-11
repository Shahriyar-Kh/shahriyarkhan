/**
 * ProjectImageGallery.tsx
 * Premium image gallery component for project detail pages
 * Features: auto-scrolling, indicators, smooth transitions
 */

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  image: string;
  alt_text?: string;
  caption?: string;
}

interface ProjectImageGalleryProps {
  images: GalleryImage[];
  projectTitle: string;
  autoPlayInterval?: number;
}

export function ProjectImageGallery({
  images,
  projectTitle,
  autoPlayInterval = 6000,
}: ProjectImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!images.length) {
    return (
      <div className="pig-empty">
        <div className="pig-empty-placeholder">
          <span>No gallery images available</span>
        </div>
      </div>
    );
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index % images.length);
    setIsAutoPlay(false);
    resetAutoPlay();
  };

  const nextSlide = () => {
    setCurrentIndex((p) => (p + 1) % images.length);
    setIsAutoPlay(false);
    resetAutoPlay();
  };

  const prevSlide = () => {
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    setIsAutoPlay(false);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsAutoPlay(true), 2000);
  };

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(
      () => setCurrentIndex((p) => (p + 1) % images.length),
      autoPlayInterval
    );

    return () => clearInterval(timer);
  }, [isAutoPlay, autoPlayInterval, images.length]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const current = images[currentIndex];

  return (
    <div className="pig-shell">
      {/* Main image display */}
      <div className="pig-main">
        <div className="pig-img-wrap">
          <img
            key={current.id}
            src={current.image}
            alt={current.alt_text || `${projectTitle} gallery image ${currentIndex + 1}`}
            className="pig-img pig-img--active"
            loading="lazy"
            decoding="async"
          />
          {current.caption && (
            <div className="pig-caption">{current.caption}</div>
          )}
        </div>

        {/* Controls only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              className="pig-control pig-control--prev"
              onClick={prevSlide}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="pig-control pig-control--next"
              onClick={nextSlide}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="pig-indicators">
          {images.map((img, idx) => (
            <button
              key={img.id}
              className={`pig-indicator ${
                idx === currentIndex ? "pig-indicator--active" : ""
              }`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to image ${idx + 1}`}
              aria-current={idx === currentIndex}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="pig-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';

interface BrandIconProps {
  src: string;
  fallbackSrc?: string;
  className?: string;
}

export function BrandIcon({ src, fallbackSrc = '/logos/default-logo.svg', className }: BrandIconProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    // Reset states when src changes
    setCurrentSrc(src);
    setError(false);
    setLoaded(false);
  }, [src]);

  // Try to load WebP, fallback to PNG if needed
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn("Image load error:", {
      attemptedSrc: currentSrc,
      error: e
    });
    
    if (currentSrc.endsWith('.webp')) {
      // Try PNG version if WebP fails
      const pngSrc = currentSrc.replace('.webp', '.png');
      console.log("Attempting to load PNG version:", pngSrc);
      setCurrentSrc(pngSrc);
    } else if (currentSrc !== fallbackSrc) {
      console.log("Attempting to load fallback image:", fallbackSrc);
      setCurrentSrc(fallbackSrc);
    } else {
      setError(true);
    }
  };

  if (!currentSrc) {
    console.warn('No src provided for BrandIcon');
    return null;
  }

  if (error && currentSrc === fallbackSrc) {
    console.error(`Both main image and fallback failed to load:`, {
      mainSrc: src,
      fallbackSrc
    });
    return null;
  }

  const isSvg = currentSrc.endsWith('.svg');
  const isWebP = currentSrc.endsWith('.webp');

  return (
    <div className={cn("flex justify-center mb-6 relative h-[60px]", className)}>
      <Image
        src={currentSrc}
        alt="Brand Logo"
        width={180}
        height={60}
        className={cn(
          "h-auto w-auto object-contain transition-opacity duration-200",
          loaded ? "opacity-100" : "opacity-0",
          isSvg ? "dark:invert" : ""
        )}
        priority
        quality={isWebP ? 100 : 75}
        onError={handleImageError}
        onLoad={() => {
          console.log(`Brand icon loaded successfully from: ${currentSrc}`);
          setLoaded(true);
        }}
      />
    </div>
  );
} 
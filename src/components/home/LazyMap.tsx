import { useState, useEffect, useRef } from "react";

interface LazyMapProps {
  className?: string;
}

export function LazyMap({ className }: LazyMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before it's visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {!isInView ? (
        // Placeholder skeleton
        <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading map...</div>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center z-10">
              <div className="text-muted-foreground text-sm">Loading map...</div>
            </div>
          )}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3041.8!2d-74.5867!3d40.1789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c160e5b0a89a8d%3A0x1234567890abcdef!2s1278%20Yardville-Allentown%20Rd%2C%20Allentown%2C%20NJ%2008501!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Stonebridge Bagels Location"
            className="absolute inset-0"
            onLoad={() => setIsLoaded(true)}
          />
        </>
      )}
    </div>
  );
}

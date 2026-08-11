"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [animKey, setAnimKey] = useState(pathname);

  useEffect(() => {
    setIsNavigating(true);
    setAnimKey(pathname);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Top Navigation Progress Glow Bar */}
      <div
        className={`page-nav-progress ${isNavigating ? "active" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, var(--accent) 0%, #f59e0b 50%, var(--accent) 100%)",
          boxShadow: "0 0 10px var(--accent-glow)",
          zIndex: 9999,
          opacity: isNavigating ? 1 : 0,
          transform: isNavigating ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease",
          pointerEvents: "none",
        }}
      />

      {/* Smooth Page Container */}
      <div key={animKey} className="page-transition-wrapper">
        {children}
      </div>
    </>
  );
}
